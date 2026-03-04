import type { DailyMetrics } from "@/lib/types";

type CalculatorMetricsProps = {
  daily: DailyMetrics;
  endingAccount: number;
  totalReturnPct: number;
  days: number;
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

export function CalculatorMetrics({ daily, endingAccount, totalReturnPct, days }: CalculatorMetricsProps) {
  const dailyClass = daily.dailyNetPnl >= 0 ? "metric-positive" : "metric-negative";
  const totalClass = totalReturnPct >= 0 ? "metric-positive" : "metric-negative";

  return (
    <section className="card" aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="card-title">
        Daily Projection Snapshot
      </h2>
      <p className="card-subtitle">Position size and expected P&L from current inputs.</p>

      <article className="contract-spotlight" aria-label="Prominent contracts summary">
        <p className="contract-spotlight-label">Contracts You Can Sell Today</p>
        <p className="contract-spotlight-value">{daily.contracts.toLocaleString("en-US")}</p>
        <p className="contract-spotlight-subtitle">
          Daily return: <span className={dailyClass}>{pctFmt.format(daily.dailyReturnPct)}%</span> on account
        </p>
      </article>

      <div className="metrics-grid">
        <MetricCard label="Allocated Capital" value={currencyFmt.format(daily.allocatedCapital)} />
        <MetricCard label="Margin / Contract" value={currencyFmt.format(daily.marginPerContract)} />
        <MetricCard label="Contracts" value={daily.contracts.toLocaleString("en-US")} />
        <MetricCard
          label="Daily Net P&L"
          value={currencyFmt.format(daily.dailyNetPnl)}
          valueClassName={dailyClass}
        />
        <MetricCard
          label="Daily Return on Account"
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
