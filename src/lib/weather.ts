import "server-only";

import { MORRIS_DAILY_GDU_NORMALS } from "@/data/gdu-normals";
import { RIVERVIEW_FIELDS } from "@/data/riverview-fields";
import { addDays, cornGdu, projectFields, type DailyWeather, type FieldProjection } from "@/lib/gdu";

const LOCATION = {
  name: "West River Dairy",
  detail: "Riverview LLP · Morris, Minnesota",
  latitude: 45.5,
  longitude: -95.99,
  station: "Morris Municipal Airport (MOX)",
};

const FALLBACK_OBSERVED_THROUGH = "2026-08-09";
const FALLBACK_REPORT_DATE = "2026-08-10";
const FALLBACK_GDU_BY_PLANTING_DATE: Record<string, number> = {
  "2026-05-02": 1790.5,
  "2026-05-04": 1770.5,
  "2026-05-05": 1765,
  "2026-05-06": 1765,
  "2026-05-07": 1765,
  "2026-05-08": 1759.5,
  "2026-05-09": 1748,
  "2026-05-11": 1739,
  "2026-05-12": 1727.5,
};

const FALLBACK_FORECAST: DailyWeather[] = [
  { date: "2026-08-10", high: 79.6, low: 56.0, gdu: 18.0, kind: "forecast" },
  { date: "2026-08-11", high: 84.0, low: 63.8, gdu: 24.0, kind: "forecast" },
  { date: "2026-08-12", high: 86.9, low: 62.6, gdu: 24.5, kind: "forecast" },
  { date: "2026-08-13", high: 80.2, low: 60.6, gdu: 20.5, kind: "forecast" },
  { date: "2026-08-14", high: 78.8, low: 57.2, gdu: 18.0, kind: "forecast" },
  { date: "2026-08-15", high: 77.8, low: 63.3, gdu: 20.5, kind: "forecast" },
  { date: "2026-08-16", high: 82.0, low: 56.9, gdu: 19.5, kind: "forecast" },
  { date: "2026-08-17", high: 86.3, low: 57.1, gdu: 21.5, kind: "forecast" },
  { date: "2026-08-18", high: 93.9, low: 64.1, gdu: 25.0, kind: "forecast" },
  { date: "2026-08-19", high: 90.9, low: 65.7, gdu: 26.0, kind: "forecast" },
  { date: "2026-08-20", high: 80.9, low: 65.9, gdu: 23.5, kind: "forecast" },
  { date: "2026-08-21", high: 65.6, low: 56.6, gdu: 11.5, kind: "forecast" },
  { date: "2026-08-22", high: 75.7, low: 56.1, gdu: 16.0, kind: "forecast" },
  { date: "2026-08-23", high: 77.8, low: 58.3, gdu: 18.0, kind: "forecast" },
];

export type SilageDashboardData = {
  location: typeof LOCATION;
  reportDate: string;
  lastObservedDate: string;
  forecastEndDate: string;
  forecastDays: DailyWeather[];
  forecastTotalGdu: number;
  todayEstimatedGdu: number;
  projections: FieldProjection[];
  dataStatus: "live" | "forecast-fallback" | "saved-outlook";
  generatedAt: string;
};

function centralToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function parseIemCsv(csv: string): DailyWeather[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("No station observations returned");
  const headers = lines[0].split(",");
  return lines.slice(1).flatMap((line) => {
    const values = line.split(",");
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    const high = Number(row.max_temp_f);
    const low = Number(row.min_temp_f);
    if (!row.day || !Number.isFinite(high) || !Number.isFinite(low)) return [];
    return [{ date: row.day, high, low, gdu: cornGdu(high, low), kind: "observed" as const }];
  });
}

async function fetchObserved(startDate: string, endDate: string): Promise<DailyWeather[]> {
  const [year1, month1, day1] = startDate.split("-");
  const [year2, month2, day2] = endDate.split("-");
  const url = new URL("https://mesonet.agron.iastate.edu/cgi-bin/request/daily.py");
  url.search = new URLSearchParams({
    network: "MN_ASOS",
    stations: "MOX",
    year1,
    month1,
    day1,
    year2,
    month2,
    day2,
    var: "max_temp_f",
    format: "csv",
  }).toString() + "&var=min_temp_f";

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`Station data request failed: ${response.status}`);
  return parseIemCsv(await response.text());
}

async function fetchForecast(startDate: string): Promise<DailyWeather[]> {
  const endDate = addDays(startDate, 13);
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(LOCATION.latitude),
    longitude: String(LOCATION.longitude),
    daily: "temperature_2m_max,temperature_2m_min",
    temperature_unit: "fahrenheit",
    timezone: "America/Chicago",
    start_date: startDate,
    end_date: endDate,
  }).toString();

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`Forecast request failed: ${response.status}`);
  const payload = await response.json() as {
    daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
  };
  return payload.daily.time.map((date, index) => {
    const high = payload.daily.temperature_2m_max[index];
    const low = payload.daily.temperature_2m_min[index];
    return { date, high, low, gdu: cornGdu(high, low), kind: "forecast" as const };
  });
}

function buildNormalDays(startDate: string, endDate = "2026-11-30"): DailyWeather[] {
  const days: DailyWeather[] = [];
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const gdu = MORRIS_DAILY_GDU_NORMALS[date.slice(5)] ?? 0;
    days.push({ date, high: null, low: null, gdu, kind: "normal" });
  }
  return days;
}

function createDashboardData({
  reportDate,
  lastObservedDate,
  observedDays,
  forecastDays,
  dataStatus,
  fallbackCurrentGdu,
}: {
  reportDate: string;
  lastObservedDate: string;
  observedDays: DailyWeather[];
  forecastDays: DailyWeather[];
  dataStatus: SilageDashboardData["dataStatus"];
  fallbackCurrentGdu?: Record<string, number>;
}): SilageDashboardData {
  const forecastEndDate = forecastDays.at(-1)?.date ?? reportDate;
  const normalDays = buildNormalDays(addDays(forecastEndDate, 1));
  const futureDays = [...forecastDays, ...normalDays];
  const projections = projectFields({
    fields: RIVERVIEW_FIELDS,
    observedDays,
    futureDays,
    asOfDate: reportDate,
    forecastEndDate,
    fallbackCurrentGdu,
  });

  return {
    location: LOCATION,
    reportDate,
    lastObservedDate,
    forecastEndDate,
    forecastDays,
    forecastTotalGdu: Math.round(forecastDays.reduce((sum, day) => sum + day.gdu, 0)),
    todayEstimatedGdu: Math.round(forecastDays[0]?.gdu ?? 0),
    projections,
    dataStatus,
    generatedAt: new Date().toISOString(),
  };
}

export async function getSilageDashboardData(): Promise<SilageDashboardData> {
  const today = centralToday();
  const observationEnd = addDays(today, -1);

  try {
    const observedDays = await fetchObserved("2026-05-02", observationEnd);
    try {
      const forecastDays = await fetchForecast(today);
      return createDashboardData({
        reportDate: today,
        lastObservedDate: observationEnd,
        observedDays,
        forecastDays,
        dataStatus: "live",
      });
    } catch {
      const normalForecast = buildNormalDays(today, addDays(today, 13)).map((day) => ({ ...day, kind: "forecast" as const }));
      return createDashboardData({
        reportDate: today,
        lastObservedDate: observationEnd,
        observedDays,
        forecastDays: normalForecast,
        dataStatus: "forecast-fallback",
      });
    }
  } catch {
    return createDashboardData({
      reportDate: FALLBACK_REPORT_DATE,
      lastObservedDate: FALLBACK_OBSERVED_THROUGH,
      observedDays: [],
      forecastDays: FALLBACK_FORECAST,
      dataStatus: "saved-outlook",
      fallbackCurrentGdu: FALLBACK_GDU_BY_PLANTING_DATE,
    });
  }
}
