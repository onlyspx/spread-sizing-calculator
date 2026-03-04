import type { CalculatorInputs, DailyMetrics } from "@/lib/types";

type CalculatorMetricsProps = {
  daily: DailyMetrics;
  endingAccount: number;
  totalReturnPct: number;
  days: number;
  inputs: Pick<CalculatorInputs, "sellPremium" | "closePremium" | "winRatePct" | "lossMultiplier">;
};

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const pctFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type MetricCardProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function MetricCard({ label, value, valueClassName }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className={`metric-value ${valueClassName ?? ""}`.trim()}>{value}</p>
    </article>
  );
}

export function CalculatorMetrics({ daily, endingAccount, totalReturnPct, days, inputs }: CalculatorMetricsProps) {
  const dailyClass = daily.dailyNetPnl >= 0 ? "metric-positive" : "metric-negative";
  const totalClass = totalReturnPct >= 0 ? "metric-positive" : "metric-negative";
  const isProbability = daily.mode === "probability";
  const dailyPnlLabel = isProbability ? "Expected Daily P&L" : "Daily Net P&L";
  const dailyReturnLabel = isProbability ? "Expected Daily Return" : "Daily Return on Account";

  return (
    <section className="card" aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="card-title">
        {isProbability ? "Probability Projection Snapshot" : "Daily Projection Snapshot"}
      </h2>
      <p className="card-subtitle">Position size and expected P&L from current inputs.</p>

      <article className="contract-spotlight" aria-label="Prominent contracts summary">
        <p className="contract-spotlight-label">Contracts You Can Sell Today</p>
        <p className="contract-spotlight-value">{daily.contracts.toLocaleString("en-US")}</p>
        <p className="contract-spotlight-subtitle">
          {isProbability ? "Expected return:" : "Daily return:"}{" "}
          <span className={dailyClass}>{pctFmt.format(daily.dailyReturnPct)}%</span> on account
        </p>
      </article>

      {isProbability && (
        <details className="formula-details">
          <summary className="formula-summary">Show Formula Details</summary>
          <article className="formula-card" aria-label="Probability mode formula explanation">
            <p className="formula-card-title">Formula Used</p>
            <p className="formula-line">
              Win-Day P&L = contracts × (sell - close) × 100 = {daily.contracts} × (
              {inputs.sellPremium.toFixed(2)} - {inputs.closePremium.toFixed(2)}) × 100
            </p>
            <p className="formula-line">
              Loss-Day P&L = contracts × (-lossMultiplier × sell) × 100 = {daily.contracts} × (-
              {inputs.lossMultiplier} × {inputs.sellPremium.toFixed(2)}) × 100
            </p>
            <p className="formula-line">
              Expected Daily P&L = win% × win-day + loss% × loss-day = {inputs.winRatePct.toFixed(2)}% × win +{" "}
              {daily.lossRatePct.toFixed(2)}% × loss
            </p>
            <p className="formula-line">Expected Daily Return = Expected Daily P&L / Account</p>
          </article>
        </details>
      )}

      {isProbability && (
        <article className="prob-summary" aria-label="Probability mode summary">
          <p className="prob-summary-title">Probability Summary</p>
          <div className="prob-summary-grid">
            <p>
              <span>Win Rate</span>
              <strong>{pctFmt.format(100 - daily.lossRatePct)}%</strong>
            </p>
            <p>
              <span>Loss Rate</span>
              <strong>{pctFmt.format(daily.lossRatePct)}%</strong>
            </p>
            <p>
              <span>Win-Day P&L (sell-close)</span>
              <strong className="metric-positive">{currencyFmt.format(daily.winDayPnl ?? 0)}</strong>
            </p>
            <p>
              <span>Loss-Day P&L (-lossMultiplier*sell)</span>
              <strong className="metric-negative">{currencyFmt.format(daily.lossDayPnl ?? 0)}</strong>
            </p>
            <p>
              <span>EV per Contract</span>
              <strong className={dailyClass}>{currencyFmt.format(daily.expectedPnlPerContract)}</strong>
            </p>
            <p>
              <span>Expectancy Multiple</span>
              <strong className={dailyClass}>{pctFmt.format(daily.expectancyMultiple)}x</strong>
            </p>
          </div>
        </article>
      )}

      <div className="metrics-grid">
        <MetricCard label="Allocated Capital" value={currencyFmt.format(daily.allocatedCapital)} />
        <MetricCard label="Margin / Contract" value={currencyFmt.format(daily.marginPerContract)} />
        <MetricCard label="Contracts" value={daily.contracts.toLocaleString("en-US")} />
        <MetricCard label={dailyPnlLabel} value={currencyFmt.format(daily.dailyNetPnl)} valueClassName={dailyClass} />
        <MetricCard
          label={dailyReturnLabel}
          value={`${pctFmt.format(daily.dailyReturnPct)}%`}
          valueClassName={dailyClass}
        />
        <MetricCard
          label={`Ending Account (Day ${days})`}
          value={currencyFmt.format(endingAccount)}
          valueClassName={totalClass}
        />
        <MetricCard
          label={`Total Return by Day ${days}`}
          value={`${pctFmt.format(totalReturnPct)}%`}
          valueClassName={totalClass}
        />
      </div>
    </section>
  );
}
