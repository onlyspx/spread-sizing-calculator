import { describe, expect, it } from "vitest";
import { calculateDaily, projectCompounding } from "./calculator";
import type { CalculatorInputs } from "./types";

const deterministicInputs: CalculatorInputs = {
  calculationMode: "deterministic",
  accountBuyingPower: 100_000,
  spreadWidth: 5,
  sellPremium: 0.3,
  closePremium: 0.05,
  bpUsagePct: 100,
  days: 20,
  winRatePct: 96,
  lossMultiplier: 2,
};

const probabilityInputs: CalculatorInputs = {
  calculationMode: "probability",
  accountBuyingPower: 100_000,
  spreadWidth: 5,
  sellPremium: 0.3,
  closePremium: 0.05,
  bpUsagePct: 20,
  days: 20,
  winRatePct: 96,
  lossMultiplier: 2,
};

describe("calculateDaily", () => {
  it("keeps deterministic baseline 100% usage scenario", () => {
    const result = calculateDaily(deterministicInputs);

    expect(result.mode).toBe("deterministic");
    expect(result.contracts).toBe(200);
    expect(result.dailyNetPnl).toBe(5_000);
    expect(result.dailyReturnPct).toBe(5);
  });

  it("keeps deterministic 20% usage scenario", () => {
    const result = calculateDaily({ ...deterministicInputs, bpUsagePct: 20 });

    expect(result.contracts).toBe(40);
    expect(result.dailyNetPnl).toBe(1_000);
    expect(result.dailyReturnPct).toBe(1);
  });

  it("matches probability default case", () => {
    const result = calculateDaily(probabilityInputs);

    expect(result.mode).toBe("probability");
    expect(result.contracts).toBe(40);
    expect(result.winDayPnl).toBe(1_000);
    expect(result.lossDayPnl).toBe(-2_400);
    expect(result.dailyNetPnl).toBeCloseTo(864, 8);
    expect(result.dailyReturnPct).toBeCloseTo(0.864, 8);
  });

  it("reduces expected daily pnl as loss multiplier increases", () => {
    const m1 = calculateDaily({ ...probabilityInputs, lossMultiplier: 1 });
    const m2 = calculateDaily({ ...probabilityInputs, lossMultiplier: 2 });
    const m3 = calculateDaily({ ...probabilityInputs, lossMultiplier: 3 });

    expect(m1.dailyNetPnl).toBeGreaterThan(m2.dailyNetPnl);
    expect(m2.dailyNetPnl).toBeGreaterThan(m3.dailyNetPnl);
  });

  it("handles win-rate edges", () => {
    const allWin = calculateDaily({ ...probabilityInputs, winRatePct: 100 });
    const allLoss = calculateDaily({ ...probabilityInputs, winRatePct: 0 });

    expect(allWin.dailyNetPnl).toBe(allWin.winDayPnl);
    expect(allLoss.dailyNetPnl).toBe(allLoss.lossDayPnl);
  });

  it("returns zero contracts when allocation cannot fund one spread", () => {
    const result = calculateDaily({
      ...probabilityInputs,
      accountBuyingPower: 500,
      spreadWidth: 5,
    });

    expect(result.contracts).toBe(0);
    expect(result.dailyNetPnl).toBe(0);
    expect(result.winDayPnl).toBe(0);
    expect(result.lossDayPnl).toBe(0);
  });

  it("coerces decimal loss multiplier to integer in calculator normalization", () => {
    const result = calculateDaily({ ...probabilityInputs, lossMultiplier: 2.7 });

    expect(result.lossDayPnl).toBe(-2_400);
    expect(result.dailyNetPnl).toBeCloseTo(864, 8);
  });

  it("allows zero and clamps negative loss multiplier to minimum 0", () => {
    const zeroResult = calculateDaily({ ...probabilityInputs, lossMultiplier: 0 });
    const negativeResult = calculateDaily({ ...probabilityInputs, lossMultiplier: -2 });

    expect(zeroResult.lossDayPnl).toBe(0);
    expect(zeroResult.dailyNetPnl).toBeCloseTo(960, 8);
    expect(negativeResult.lossDayPnl).toBe(0);
    expect(negativeResult.dailyNetPnl).toBeCloseTo(960, 8);
  });
});

describe("projectCompounding", () => {
  it("recomputes contracts as account grows in probability mode", () => {
    const rows = projectCompounding({ ...probabilityInputs, days: 20 });

    expect(rows).toHaveLength(20);
    expect(rows[0].mode).toBe("probability");
    expect(rows[0].contracts).toBe(40);
    expect(rows[rows.length - 1].contracts).toBeGreaterThanOrEqual(rows[0].contracts);
  });

  it("clamps days to max 252", () => {
    const rows = projectCompounding({ ...probabilityInputs, days: 500 });

    expect(rows).toHaveLength(252);
  });
});
