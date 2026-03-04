import { describe, expect, it } from "vitest";
import { calculateDaily, projectCompounding } from "./calculator";
import type { CalculatorInputs } from "./types";

const baseInputs: CalculatorInputs = {
  accountBuyingPower: 100_000,
  spreadWidth: 5,
  sellPremium: 0.3,
  closePremium: 0.05,
  bpUsagePct: 100,
  days: 20,
};

describe("calculateDaily", () => {
  it("matches baseline 100% usage scenario", () => {
    const result = calculateDaily(baseInputs);

    expect(result.contracts).toBe(200);
    expect(result.dailyNetPnl).toBe(5_000);
    expect(result.dailyReturnPct).toBe(5);
  });

  it("matches 20% usage scenario", () => {
    const result = calculateDaily({ ...baseInputs, bpUsagePct: 20 });

    expect(result.contracts).toBe(40);
    expect(result.dailyNetPnl).toBe(1_000);
    expect(result.dailyReturnPct).toBe(1);
  });

  it("floors fractional contracts", () => {
    const result = calculateDaily({
      ...baseInputs,
      accountBuyingPower: 12_345,
      bpUsagePct: 37,
      spreadWidth: 7,
    });

    expect(result.contracts).toBe(6);
  });

  it("returns zero contracts when allocation cannot fund one spread", () => {
    const result = calculateDaily({
      ...baseInputs,
      accountBuyingPower: 500,
      bpUsagePct: 20,
      spreadWidth: 5,
    });

    expect(result.contracts).toBe(0);
    expect(result.dailyNetPnl).toBe(0);
  });

  it("handles negative expectancy when close premium exceeds sell", () => {
    const result = calculateDaily({ ...baseInputs, closePremium: 0.6 });

    expect(result.dailyNetPnl).toBeLessThan(0);
    expect(result.dailyReturnPct).toBeLessThan(0);
  });
});

describe("projectCompounding", () => {
  it("recomputes contracts as account grows", () => {
    const rows = projectCompounding({ ...baseInputs, bpUsagePct: 20, days: 20 });

    expect(rows).toHaveLength(20);
    expect(rows[0].contracts).toBe(40);
    expect(rows[rows.length - 1].contracts).toBeGreaterThanOrEqual(rows[0].contracts);
  });

  it("clamps days to max 252", () => {
    const rows = projectCompounding({ ...baseInputs, days: 500 });

    expect(rows).toHaveLength(252);
  });
});
