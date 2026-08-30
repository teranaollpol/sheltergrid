"use client";

import { LoaderCircle, Radio, RotateCcw, Siren } from "lucide-react";
import {
  contractLabel,
  initialContractValue,
  longContractField,
  stringifyContractValue,
  useContractWorkflow,
} from "@/lib/contract-workflow";
import type { ContractParam } from "@/lib/contract-surface";

function DispatchInput({
  param,
  value,
  onChange,
}: {
  param: ContractParam;
  value: string;
  onChange: (value: string) => void;
}) {
  if (param.type === "bool") {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="false">STANDBY</option>
        <option value="true">ACTIVE</option>
      </select>
    );
  }
  if (longContractField(param)) {
    return <textarea value={value} onChange={(event) => onChange(event.target.value)} />;
  }
  return (
    <input
      type={param.type === "int" ? "number" : "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function DomainContractActions() {
  const flow = useContractWorkflow();
  const station = Math.max(
    0,
    flow.methods.findIndex((method) => method.name === flow.selected.name),
  );
  return (
    <section className="sg-domain-actions" data-domain-control="readiness-dispatch">
      <header>
        <Siren />
        <div>
          <small>OPERATIONAL DISPATCH</small>
          <strong>{contractLabel(flow.selected.name)}</strong>
        </div>
        <Radio />
      </header>

      <label className="sg-frequency">
        <span>COMMAND BAND {String(station + 1).padStart(2, "0")}</span>
        <input
          type="range"
          min="0"
          max={flow.methods.length - 1}
          value={station}
          onChange={(event) => {
            const method = flow.methods[Number(event.target.value)];
            if (method) flow.choose(method);
          }}
        />
        <output>{station + 1}/{flow.methods.length}</output>
      </label>

      <menu className="sg-dispatch-grid">
        {flow.selected.params.map((param, index) => (
          <li key={param.name}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <label>
              <span>{contractLabel(param.name)}</span>
              <DispatchInput
                param={param}
                value={flow.values[param.name] ?? initialContractValue(param)}
                onChange={(value) =>
                  flow.setValues((current) => ({
                    ...current,
                    [param.name]: value,
                  }))
                }
              />
            </label>
          </li>
        ))}
      </menu>

      <button
        className="sg-dispatch"
        type="button"
        disabled={flow.busy}
        onClick={() => void flow.execute()}
      >
        {flow.busy ? <LoaderCircle className="spin" /> : <Radio />}
        {flow.selected.kind === "read" ? "Poll readiness signal" : "Dispatch command"}
      </button>

      <footer aria-live="polite">
        <div>
          <i className={flow.error ? "alert" : flow.result ? "ready" : ""} />
          <span>{flow.error ? "COMMAND FAILED" : flow.result ? "RECEIPT FINALIZED" : "CHANNEL READY"}</span>
        </div>
        {(flow.result || flow.error) && (
          <button type="button" onClick={flow.reset} aria-label="Clear dispatch result">
            <RotateCcw />
          </button>
        )}
        {flow.error ? <p>{flow.error}</p> : flow.result ? <pre>{stringifyContractValue(flow.result)}</pre> : null}
      </footer>

      <style jsx>{`
        .sg-domain-actions{margin-top:16px;border-top:5px solid #0e2b1d;background:#f6f5e9;padding:14px;color:#0e2b1d;font-family:var(--font-barlow-condensed),Arial,sans-serif}
        header{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;border-bottom:1px solid #0e2b1d;padding-bottom:10px}header div{display:grid}header small{font-size:8px;color:#ef4b35}header strong{font-size:18px}
        .sg-frequency{display:grid;grid-template-columns:160px 1fr 64px;gap:10px;align-items:center;padding:11px 0}.sg-frequency span{font-size:9px}.sg-frequency input{accent-color:#ef4b35}.sg-frequency output{text-align:right;font-weight:700}
        .sg-dispatch-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0;padding:0;list-style:none}.sg-dispatch-grid li{border:1px solid #657267;padding:8px}.sg-dispatch-grid li>b{display:block;color:#ef4b35}.sg-dispatch-grid label{display:grid;gap:4px}.sg-dispatch-grid span{font-size:9px}
        select,input:not([type="range"]),textarea{width:100%;min-height:38px;border:1px solid #657267;border-radius:0;background:#fff;padding:7px;font:inherit}textarea{min-height:68px}
        .sg-dispatch{width:100%;min-height:42px;margin-top:10px;border:0;background:#0e2b1d;color:#fff;display:flex;align-items:center;justify-content:center;gap:7px}
        footer{position:relative;margin-top:10px;border:1px solid #657267;padding:10px}footer>div{display:flex;align-items:center;gap:7px}footer i{width:9px;height:9px;background:#657267}footer i.ready{background:#64a32b}footer i.alert{background:#ef4b35}footer button{position:absolute;right:5px;top:5px}pre{white-space:pre-wrap;overflow-wrap:anywhere}
        @media(max-width:700px){.sg-frequency,.sg-dispatch-grid{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
