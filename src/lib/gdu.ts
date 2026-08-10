import { CHOP_TARGET_OFFSET_GDU, type RiverviewField } from "../data/riverview-fields";

export type WeatherKind = "observed" | "forecast" | "normal";

export type DailyWeather = {
  date: string;
  high: number | null;
  low: number | null;
  gdu: number;
  kind: WeatherKind;
};

export type FieldStatus = "Check moisture" | "Next up" | "Approaching" | "Planned";

export type FieldProjection = RiverviewField & {
  rank: number;
  currentGdu: number;
  chopTargetGdu: number;
  remainingToChop: number;
  progressPercent: number;
  projectedChopDate: string | null;
  projectedBlackLayerDate: string | null;
  daysToChopTarget: number | null;
  status: FieldStatus;
  projectionBasis: "14-day forecast" | "Forecast + climate normals";
};

export function cornGdu(high: number, low: number): number {
  const cappedHigh = Math.min(86, Math.max(50, high));
  const cappedLow = Math.min(86, Math.max(50, low));
  return (cappedHigh + cappedLow) / 2 - 50;
}

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function daysBetween(start: string, end: string): number {
  const from = new Date(`${start}T12:00:00Z`).getTime();
  const to = new Date(`${end}T12:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function sumGduFromDate(days: DailyWeather[], plantingDate: string): number {
  return days.reduce((total, day) => total + (day.date >= plantingDate ? day.gdu : 0), 0);
}

export function findThresholdDate(
  currentGdu: number,
  threshold: number,
  futureDays: DailyWeather[],
): string | null {
  if (currentGdu >= threshold) return futureDays[0]?.date ?? null;

  let accumulated = currentGdu;
  for (const day of futureDays) {
    accumulated += day.gdu;
    if (accumulated >= threshold) return day.date;
  }
  return null;
}

function statusFor(daysUntil: number | null): FieldStatus {
  if (daysUntil === null || daysUntil > 14) return "Planned";
  if (daysUntil <= 0) return "Check moisture";
  if (daysUntil <= 7) return "Next up";
  return "Approaching";
}

export function projectFields({
  fields,
  observedDays,
  futureDays,
  asOfDate,
  forecastEndDate,
  fallbackCurrentGdu,
}: {
  fields: RiverviewField[];
  observedDays: DailyWeather[];
  futureDays: DailyWeather[];
  asOfDate: string;
  forecastEndDate: string;
  fallbackCurrentGdu?: Record<string, number>;
}): FieldProjection[] {
  const projections = fields.map((field) => {
    const observedGdu = observedDays.length
      ? sumGduFromDate(observedDays, field.plantingDate)
      : (fallbackCurrentGdu?.[field.plantingDate] ?? 0);
    const chopTargetGdu = field.blackLayerGdu - CHOP_TARGET_OFFSET_GDU;
    const projectedChopDate = findThresholdDate(observedGdu, chopTargetGdu, futureDays);
    const projectedBlackLayerDate = findThresholdDate(observedGdu, field.blackLayerGdu, futureDays);
    const daysToChopTarget = projectedChopDate ? daysBetween(asOfDate, projectedChopDate) : null;

    return {
      ...field,
      rank: 0,
      currentGdu: Math.round(observedGdu),
      chopTargetGdu,
      remainingToChop: Math.max(0, Math.round(chopTargetGdu - observedGdu)),
      progressPercent: Math.min(100, Math.round((observedGdu / chopTargetGdu) * 100)),
      projectedChopDate,
      projectedBlackLayerDate,
      daysToChopTarget,
      status: statusFor(daysToChopTarget),
      projectionBasis:
        projectedChopDate && projectedChopDate <= forecastEndDate
          ? "14-day forecast" as const
          : "Forecast + climate normals" as const,
    };
  });

  return projections
    .sort((a, b) => {
      if (a.projectedChopDate === b.projectedChopDate) return a.id.localeCompare(b.id);
      if (a.projectedChopDate === null) return 1;
      if (b.projectedChopDate === null) return -1;
      return a.projectedChopDate.localeCompare(b.projectedChopDate);
    })
    .map((field, index) => ({ ...field, rank: index + 1 }));
}
