"use client";

import { useMemo, useState } from "react";
import { CalculatorForm } from "@/components/calculator-form";
import { CalculatorMetrics } from "@/components/calculator-metrics";
import { CompoundingTable } from "@/components/compounding-table";
import { EquityChart } from "@/components/equity-chart";
import {
  MAX_BP_USAGE_PCT,
  MAX_DAYS,
  MAX_WIN_RATE_PCT,
  MIN_BP_USAGE_PCT,
  MIN_DAYS,
  MIN_LOSS_MULTIPLIER,
  MIN_WIN_RATE_PCT,
  calculateDaily,
  projectCompounding,
} from "@/lib/calculator";
import type { CalculatorInputs } from "@/lib/types";

const DEFAULT_INPUTS: CalculatorInputs = {
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

export function CalculatorApp() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const daily = useMemo(() => calculateDaily(inputs), [inputs]);
  const rows = useMemo(() => projectCompounding(inputs), [inputs]);

  const endingAccount = rows.length > 0 ? rows[rows.length - 1].endingAccount : inputs.accountBuyingPower;
  const totalReturnPct =
    inputs.accountBuyingPower > 0
      ? ((endingAccount - inputs.accountBuyingPower) / inputs.accountBuyingPower) * 100
      : 0;

  const highUsage = inputs.bpUsagePct > 50;
  const deterministicNegative =
    inputs.calculationMode === "deterministic" && inputs.closePremium > inputs.sellPremium;
  const probabilityNegative = inputs.calculationMode === "probability" && daily.dailyNetPnl < 0;
  const zeroContracts = daily.contracts === 0;

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  const handleChange = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    if (key === "calculationMode") {
      setInputs((prev) => ({
        ...prev,
        calculationMode: value as CalculatorInputs["calculationMode"],
      }));
      return;
    }

    const nextValue = typeof value === "number" && Number.isFinite(value) ? value : 0;

    if (key === "bpUsagePct") {
      setInputs((prev) => ({
        ...prev,
        bpUsagePct: Math.trunc(clamp(nextValue, MIN_BP_USAGE_PCT, MAX_BP_USAGE_PCT)),
      }));
      return;
    }

    if (key === "days") {
      setInputs((prev) => ({ ...prev, days: Math.trunc(clamp(nextValue, MIN_DAYS, MAX_DAYS)) }));
      return;
    }

    if (key === "winRatePct") {
      setInputs((prev) => ({ ...prev, winRatePct: clamp(nextValue, MIN_WIN_RATE_PCT, MAX_WIN_RATE_PCT) }));
      return;
    }

    if (key === "lossMultiplier") {
      setInputs((prev) => ({
        ...prev,
        lossMultiplier: Math.max(MIN_LOSS_MULTIPLIER, Math.trunc(nextValue)),
      }));
      return;
    }

    setInputs((prev) => ({ ...prev, [key]: nextValue }));
  };

  return (
    <main className="page-shell">
      <header className="header-card">
        <h1 className="header-title">SPX Spread Position Size Planner</h1>
        <p className="header-subtitle">
          Size 5-wide (or custom width) credit spreads, project deterministic or win/loss expectancy outcomes.
        </p>
      </header>

      <section className="layout-grid">
        <div>
          <CalculatorForm inputs={inputs} onChange={handleChange} />

          {highUsage && (
            <p className="warning warning-risk">
              Buying power usage is above 50%. This materially increases daily drawdown risk.
            </p>
          )}

          {deterministicNegative && (
            <p className="warning warning-negative">
              Close premium exceeds sell premium. Deterministic projection is negative under these settings.
            </p>
          )}

          {probabilityNegative && (
            <p className="warning warning-negative">
              Expected value is negative with the current win rate and loss multiplier assumptions.
            </p>
          )}

          {zeroContracts && (
            <p className="warning warning-zero">Allocation is too small for 1 contract at this spread width.</p>
          )}
        </div>

        <div>
          <CalculatorMetrics
            daily={daily}
            endingAccount={endingAccount}
            totalReturnPct={totalReturnPct}
            days={inputs.days}
            inputs={inputs}
          />
          <EquityChart initialAccount={inputs.accountBuyingPower} rows={rows} />
        </div>
      </section>

      <CompoundingTable rows={rows} />

      <p className="footer-note">
        Model assumptions: fixed width-based margin, static premiums per day, no commissions/slippage.
      </p>
    </main>
  );
}
