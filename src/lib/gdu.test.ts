import { describe, expect, it } from "vitest";
import { cornGdu, findThresholdDate, projectFields, type DailyWeather } from "./gdu";

describe("corn GDU calculations", () => {
  it("caps daily temperatures at 86 and 50", () => {
    expect(cornGdu(93, 44)).toBe(18);
    expect(cornGdu(86, 50)).toBe(18);
  });

  it("finds the first date a target is reached", () => {
    const future: DailyWeather[] = [
      { date: "2026-08-10", high: 80, low: 60, gdu: 20, kind: "forecast" },
      { date: "2026-08-11", high: 82, low: 62, gdu: 22, kind: "forecast" },
    ];
    expect(findThresholdDate(100, 141, future)).toBe("2026-08-11");
  });

  it("ranks fields from their individual planting-date accumulation", () => {
    const observed: DailyWeather[] = [
      { date: "2026-05-05", high: 70, low: 50, gdu: 10, kind: "observed" },
      { date: "2026-05-06", high: 80, low: 60, gdu: 20, kind: "observed" },
    ];
    const future: DailyWeather[] = [
      { date: "2026-05-07", high: 86, low: 70, gdu: 28, kind: "forecast" },
      { date: "2026-05-08", high: null, low: null, gdu: 20, kind: "normal" },
    ];
    const result = projectFields({
      fields: [
        { id: "1", name: "Early", hybrid: "A", plantingDate: "2026-05-05", relativeMaturity: 98, blackLayerGdu: 350 },
        { id: "2", name: "Late", hybrid: "B", plantingDate: "2026-05-06", relativeMaturity: 98, blackLayerGdu: 350 },
      ],
      observedDays: observed,
      futureDays: future,
      asOfDate: "2026-05-07",
      forecastEndDate: "2026-05-07",
    });
    expect(result[0].currentGdu).toBe(30);
    expect(result[1].currentGdu).toBe(20);
  });
});
