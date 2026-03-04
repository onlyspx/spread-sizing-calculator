export type CalculatorInputs = {
  accountBuyingPower: number;
  spreadWidth: number;
  sellPremium: number;
  closePremium: number;
  bpUsagePct: number;
  days: number;
};

export type DailyMetrics = {
  marginPerContract: number;
  allocatedCapital: number;
  contracts: number;
  dailyNetPnl: number;
  dailyReturnPct: number;
};

export type DailyProjectionRow = {
  day: number;
  startingAccount: number;
  allocatedCapital: number;
  contracts: number;
  dailyNetPnl: number;
  dailyReturnPct: number;
  endingAccount: number;
};
