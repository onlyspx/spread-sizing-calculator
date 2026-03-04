import type { CalculatorInputs, DailyMetrics, DailyProjectionRow } from "@/lib/types";

export const CONTRACT_MULTIPLIER = 100;
export const MIN_BP_USAGE_PCT = 1;
export const MAX_BP_USAGE_PCT = 100;
export const MIN_DAYS = 1;
export const MAX_DAYS = 252;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeInputs(inputs: CalculatorInputs): CalculatorInputs {
  return {
    accountBuyingPower: Math.max(0, inputs.accountBuyingPower),
    spreadWidth: Math.max(0.01, inputs.spreadWidth),
    sellPremium: Math.max(0, inputs.sellPremium),
    closePremium: Math.max(0, inputs.closePremium),
    bpUsagePct: clamp(inputs.bpUsagePct, MIN_BP_USAGE_PCT, MAX_BP_USAGE_PCT),
    days: clamp(Math.trunc(inputs.days), MIN_DAYS, MAX_DAYS),
  };
}

export function calculateDaily(rawInputs: CalculatorInputs): DailyMetrics {
  const inputs = normalizeInputs(rawInputs);
  const marginPerContract = inputs.spreadWidth * CONTRACT_MULTIPLIER;
  const allocatedCapital = inputs.accountBuyingPower * (inputs.bpUsagePct / 100);
  const contracts = marginPerContract > 0 ? Math.floor(allocatedCapital / marginPerContract) : 0;

  const premiumDelta = inputs.sellPremium - inputs.closePremium;
  const dailyNetPnl = contracts * premiumDelta * CONTRACT_MULTIPLIER;
  const dailyReturnPct =
    inputs.accountBuyingPower > 0 ? (dailyNetPnl / inputs.accountBuyingPower) * 100 : 0;

  return {
    marginPerContract,
    allocatedCapital,
    contracts,
    dailyNetPnl,
    dailyReturnPct,
  };
}

export function projectCompounding(rawInputs: CalculatorInputs): DailyProjectionRow[] {
  const inputs = normalizeInputs(rawInputs);
  const rows: DailyProjectionRow[] = [];
  let currentAccount = inputs.accountBuyingPower;

  for (let day = 1; day <= inputs.days; day += 1) {
    const daily = calculateDaily({ ...inputs, accountBuyingPower: Math.max(0, currentAccount) });
    const endingAccount = currentAccount + daily.dailyNetPnl;

    rows.push({
      day,
      startingAccount: currentAccount,
      allocatedCapital: daily.allocatedCapital,
      contracts: daily.contracts,
      dailyNetPnl: daily.dailyNetPnl,
      dailyReturnPct: currentAccount > 0 ? (daily.dailyNetPnl / currentAccount) * 100 : 0,
      endingAccount,
    });

    currentAccount = endingAccount;
  }

  return rows;
}
