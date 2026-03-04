import type { DailyProjectionRow } from "@/lib/types";

type EquityChartProps = {
  initialAccount: number;
  rows: DailyProjectionRow[];
};

type Point = {
  day: number;
  account: number;
};

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function EquityChart({ initialAccount, rows }: EquityChartProps) {
  if (rows.length === 0) {
    return null;
  }

  const points: Point[] = [{ day: 0, account: initialAccount }].concat(
    rows.map((row) => ({ day: row.day, account: row.endingAccount })),
  );

  const width = 720;
  const height = 280;
  const pad = 40;
  const maxDay = points[points.length - 1].day;

  const accounts = points.map((point) => point.account);
  const minAccount = Math.min(...accounts);
  const maxAccount = Math.max(...accounts);
  const spread = maxAccount - minAccount || 1;

  const toX = (day: number) => pad + (day / maxDay) * (width - pad * 2);
  const toY = (account: number) => height - pad - ((account - minAccount) / spread) * (height - pad * 2);

  const linePoints = points.map((point) => `${toX(point.day)},${toY(point.account)}`).join(" ");

  return (
    <section className="card chart-shell" aria-labelledby="chart-heading">
      <h2 id="chart-heading" className="card-title">
        Equity Curve
      </h2>
      <p className="card-subtitle">Projected account path over the selected trading-day horizon.</p>

      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Account equity curve">
        <line className="chart-axis" x1={pad} y1={pad} x2={pad} y2={height - pad} />
        <line className="chart-axis" x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} />

        <text className="chart-label" x={pad} y={pad - 10}>
          High: {currencyFmt.format(maxAccount)}
        </text>
        <text className="chart-label" x={pad} y={height - 12}>
          Low: {currencyFmt.format(minAccount)}
        </text>
        <text className="chart-label" x={width - pad - 150} y={height - 12}>
          Day {maxDay}
        </text>

        <polyline className="chart-line" points={linePoints} />
      </svg>
    </section>
  );
}
