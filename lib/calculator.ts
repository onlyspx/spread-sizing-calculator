import type { CalculatorInputs, DailyMetrics, DailyProjectionRow } from "@/lib/types";

export const CONTRACT_MULTIPLIER = 100;
export const MIN_BP_USAGE_PCT = 1;
export const MAX_BP_USAGE_PCT = 100;
export const MIN_DAYS = 1;
export const MAX_DAYS = 252;
export const MIN_WIN_RATE_PCT = 0;
export const MAX_WIN_RATE_PCT = 100;
export const MIN_LOSS_MULTIPLIER = 1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeInputs(inputs: CalculatorInputs): CalculatorInputs {
  return {
    calculationMode: inputs.calculationMode,
    accountBuyingPower: Math.max(0, inputs.accountBuyingPower),
    spreadWidth: Math.max(0.01, inputs.spreadWidth),
    sellPremium: Math.max(0, inputs.sellPremium),
    closePremium: Math.max(0, inputs.closePremium),
    bpUsagePct: clamp(inputs.bpUsagePct, MIN_BP_USAGE_PCT, MAX_BP_USAGE_PCT),
    days: clamp(Math.trunc(inputs.days), MIN_DAYS, MAX_DAYS),
    winRatePct: clamp(inputs.winRatePct, MIN_WIN_RATE_PCT, MAX_WIN_RATE_PCT),
    lossMultiplier: Math.max(MIN_LOSS_MULTIPLIER, Math.trunc(inputs.lossMultiplier)),
  };
}

export function calculateDaily(rawInputs: CalculatorInputs): DailyMetrics {
  const inputs = normalizeInputs(rawInputs);
  const marginPerContract = inputs.spreadWidth * CONTRACT_MULTIPLIER;
  const allocatedCapital = inputs.accountBuyingPower * (inputs.bpUsagePct / 100);
  const contracts = marginPerContract > 0 ? Math.floor(allocatedCapital / marginPerContract) : 0;

  if (inputs.calculationMode === "probability") {
    const lossRatePct = 100 - inputs.winRatePct;
    const winRate = inputs.winRatePct / 100;
    const lossRate = lossRatePct / 100;
    const targetCredit = inputs.sellPremium - inputs.closePremium;

    const winDayPnl = contracts * targetCredit * CONTRACT_MULTIPLIER;
    const lossDayPnl =
      contracts === 0 ? 0 : contracts * (-inputs.lossMultiplier * inputs.sellPremium) * CONTRACT_MULTIPLIER;
    const dailyNetPnl = winRate * winDayPnl + lossRate * lossDayPnl;
    const dailyReturnPct =
      inputs.accountBuyingPower > 0 ? (dailyNetPnl / inputs.accountBuyingPower) * 100 : 0;

    const expectedPnlPerContract =
      winRate * (targetCredit * CONTRACT_MULTIPLIER) +
      lossRate * (-inputs.lossMultiplier * inputs.sellPremium * CONTRACT_MULTIPLIER);

    const expectancyMultiple =
      inputs.sellPremium > 0 ? expectedPnlPerContract / (inputs.sellPremium * CONTRACT_MULTIPLIER) : 0;

    return {
      mode: "probability",
      marginPerContract,
      allocatedCapital,
      contracts,
      dailyNetPnl,
      dailyReturnPct,
      lossRatePct,
      winDayPnl,
      lossDayPnl,
      expectedPnlPerContract,
      expectancyMultiple,
    };
  }

  const premiumDelta = inputs.sellPremium - inputs.closePremium;
  const dailyNetPnl = contracts * premiumDelta * CONTRACT_MULTIPLIER;
  const dailyReturnPct =
    inputs.accountBuyingPower > 0 ? (dailyNetPnl / inputs.accountBuyingPower) * 100 : 0;

  return {
    mode: "deterministic",
    marginPerContract,
    allocatedCapital,
    contracts,
    dailyNetPnl,
    dailyReturnPct,
    lossRatePct: 0,
    winDayPnl: null,
    lossDayPnl: null,
    expectedPnlPerContract: premiumDelta * CONTRACT_MULTIPLIER,
    expectancyMultiple: inputs.sellPremium > 0 ? premiumDelta / inputs.sellPremium : 0,
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
      mode: daily.mode,
      startingAccount: currentAccount,
      allocatedCapital: daily.allocatedCapital,
      contracts: daily.contracts,
      dailyNetPnl: daily.dailyNetPnl,
      dailyReturnPct: currentAccount > 0 ? (daily.dailyNetPnl / currentAccount) * 100 : 0,
      endingAccount,
      winDayPnl: daily.winDayPnl,
      lossDayPnl: daily.lossDayPnl,
    });

    currentAccount = endingAccount;
  }

  return rows;
}
