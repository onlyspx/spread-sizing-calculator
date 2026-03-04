import type { CalculatorInputs } from "@/lib/types";

type CalculatorFormProps = {
  inputs: CalculatorInputs;
  onChange: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
};

const BP_PRESETS = [10, 20, 30, 50, 100] as const;
const accountFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function parseAccountInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, "");
  return cleaned.length > 0 ? Number(cleaned) : 0;
}

export function CalculatorForm({ inputs, onChange }: CalculatorFormProps) {
  return (
    <section className="card" aria-labelledby="inputs-heading">
      <h2 id="inputs-heading" className="card-title">
        Trade Inputs
      </h2>
      <p className="card-subtitle">Tune capital, spread details, and projection horizon.</p>

      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Account Buying Power ($)</span>
          <input
            className="number-input"
            type="text"
            inputMode="numeric"
            value={accountFmt.format(Math.max(0, Math.trunc(inputs.accountBuyingPower)))}
            onChange={(event) => onChange("accountBuyingPower", parseAccountInput(event.target.value))}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Spread Width</span>
          <input
            className="number-input"
            type="number"
            min={0.1}
            step="0.1"
            value={inputs.spreadWidth}
            onChange={(event) => onChange("spreadWidth", Number(event.target.value))}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Sell Premium</span>
          <input
            className="number-input"
            type="number"
            min={0}
            step="0.01"
            value={inputs.sellPremium}
            onChange={(event) => onChange("sellPremium", Number(event.target.value))}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Close Premium</span>
          <input
            className="number-input"
            type="number"
            min={0}
            step="0.01"
            value={inputs.closePremium}
            onChange={(event) => onChange("closePremium", Number(event.target.value))}
          />
        </label>

        <label className="form-field wide">
          <span className="form-label">Buying Power Usage</span>
          <div className="slider-wrap bp-control-wrap">
            <div className="slider-line">
              <span>Choose allocation %</span>
              <div className="bp-inline-input">
                <input
                  className="number-input bp-percent-input"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={inputs.bpUsagePct}
                  onChange={(event) => onChange("bpUsagePct", Number(event.target.value))}
                  aria-label="Buying power usage percent textbox"
                />
                <span>%</span>
              </div>
            </div>
            <input
              className="slider-input"
              type="range"
              min={1}
              max={100}
              step={1}
              value={inputs.bpUsagePct}
              onChange={(event) => onChange("bpUsagePct", Number(event.target.value))}
              aria-label="Buying power usage percent"
            />
            <div className="slider-line">
              <span>1%</span>
              <span className="slider-value">{inputs.bpUsagePct}% selected</span>
              <span>100%</span>
            </div>
            <div className="bp-preset-row" aria-label="Buying power preset buttons">
              {BP_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`bp-preset-btn ${inputs.bpUsagePct === preset ? "active" : ""}`.trim()}
                  onClick={() => onChange("bpUsagePct", preset)}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
        </label>

        <label className="form-field wide">
          <span className="form-label">Compounding Days (trading days)</span>
          <input
            className="number-input"
            type="number"
            min={1}
            max={252}
            step={1}
            value={inputs.days}
            onChange={(event) => onChange("days", Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
