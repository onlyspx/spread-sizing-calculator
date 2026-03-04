export type CalculationMode = "deterministic" | "probability";

export type CalculatorInputs = {
  calculationMode: CalculationMode;
  accountBuyingPower: number;
  spreadWidth: number;
  sellPremium: number;
  closePremium: number;
  bpUsagePct: number;
  days: number;
  winRatePct: number;
  lossMultiplier: number;
};

export type DailyMetrics = {
  mode: CalculationMode;
  marginPerContract: number;
  allocatedCapital: number;
  contracts: number;
  dailyNetPnl: number;
  dailyReturnPct: number;
  lossRatePct: number;
  winDayPnl: number | null;
  lossDayPnl: number | null;
  expectedPnlPerContract: number;
  expectancyMultiple: number;
};

export type DailyProjectionRow = {
  day: number;
  mode: CalculationMode;
  startingAccount: number;
  allocatedCapital: number;
  contracts: number;
  dailyNetPnl: number;
  dailyReturnPct: number;
  endingAccount: number;
  winDayPnl: number | null;
  lossDayPnl: number | null;
};
