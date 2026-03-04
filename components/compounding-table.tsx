import type { DailyProjectionRow } from "@/lib/types";

type CompoundingTableProps = {
  rows: DailyProjectionRow[];
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

export function CompoundingTable({ rows }: CompoundingTableProps) {
  return (
    <section className="card" aria-labelledby="table-heading">
      <h2 id="table-heading" className="card-title">
        Compounding Detail
      </h2>
      <p className="card-subtitle">Daily re-sized position using updated account value.</p>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Starting Account</th>
              <th scope="col">Allocated Capital</th>
              <th scope="col">Contracts</th>
              <th scope="col">Daily P&amp;L</th>
              <th scope="col">Daily Return</th>
              <th scope="col">Ending Account</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pnlClass = row.dailyNetPnl >= 0 ? "data-positive" : "data-negative";
              const returnClass = row.dailyReturnPct >= 0 ? "data-positive" : "data-negative";

              return (
                <tr key={row.day}>
                  <td>{row.day}</td>
                  <td>{currencyFmt.format(row.startingAccount)}</td>
                  <td>{currencyFmt.format(row.allocatedCapital)}</td>
                  <td>{row.contracts.toLocaleString("en-US")}</td>
                  <td className={pnlClass}>{currencyFmt.format(row.dailyNetPnl)}</td>
                  <td className={returnClass}>{pctFmt.format(row.dailyReturnPct)}%</td>
                  <td>{currencyFmt.format(row.endingAccount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
