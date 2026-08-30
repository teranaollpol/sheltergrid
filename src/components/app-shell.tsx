"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ReadinessField } from "@/components/readiness-field";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Accessibility,
  AlertTriangle,
  Check,
  ClipboardList,
  ExternalLink,
  LoaderCircle,
  MapPinned,
  Radio,
  Send,
  ShieldCheck,
  Siren,
  Users,
  Warehouse,
} from "lucide-react";
import { appConfig } from "@/lib/config";
import { DomainContractActions } from "@/components/domain-contract-actions";
import {
  contractAddress,
  contractExplorerUrl,
  explorerBaseUrl,
} from "@/lib/deployment";
import { useProtocol } from "@/hooks/use-protocol";
import { useProtocolTransaction } from "@/lib/genlayer";
import type { Shelter, ShelterBootstrap, TxState } from "@/lib/types";
type Props = { routeIndex: number };
type V = Record<string, string>;
const titles = [
  "Network wall",
  "Shelters",
  "Readiness checks",
  "Incident command",
  "Activation",
];
function Receipt({ s, reset }: { s: TxState; reset: () => void }) {
  if (s.stage === "idle") return null;
  const busy = ["wallet", "submitted", "finalizing"].includes(s.stage);
  return (
    <div className={`sg-receipt ${s.stage}`}>
      {busy ? (
        <LoaderCircle className="spin" />
      ) : s.stage === "finalized" ? (
        <Check />
      ) : (
        <AlertTriangle />
      )}
      <span>
        {s.action}
        <small>{s.error || s.stage}</small>
      </span>
      {s.hash && (
        <a
          href={`${explorerBaseUrl}/tx/${s.hash}`}
          target="_blank"
          rel="noreferrer"
        >
          tx↗
        </a>
      )}
      {!busy && <button onClick={reset}>×</button>}
    </div>
  );
}
function CommandForm({
  title,
  method,
  fields,
  args,
}: {
  title: string;
  method: string;
  fields: { key: string; label: string; kind?: string }[];
  args: (v: V) => unknown[];
}) {
  const tx = useProtocolTransaction();
  const [v, setV] = useState<V>(() =>
    Object.fromEntries(fields.map((f) => [f.key, ""])),
  );
  async function submit(e: FormEvent) {
    e.preventDefault();
    await tx.write(title, method, args(v));
  }
  return (
    <form className="sg-command-form" onSubmit={submit}>
      <header>
        <Siren />
        <div>
          <span>OPERATIONAL WRITE</span>
          <strong>{title}</strong>
        </div>
      </header>
      <div>
        {fields.map((f, index) => (
          <label key={f.key}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <span>{f.label}</span>
            {f.kind === "area" ? (
              <textarea
                required
                value={v[f.key]}
                onChange={(e) => setV({ ...v, [f.key]: e.target.value })}
              />
            ) : (
              <input
                required
                type={f.kind || "text"}
                value={v[f.key]}
                onChange={(e) => setV({ ...v, [f.key]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
      <button>
        <Send />
        Dispatch command
      </button>
      <Receipt s={tx.state} reset={tx.reset} />
    </form>
  );
}
function Command({
  route,
  configured,
}: {
  route: number;
  configured: boolean;
}) {
  if (!configured)
    return (
      <CommandForm
        title="Configure readiness grid"
        method="configure_grid"
        fields={[
          { key: "name", label: "Grid name" },
          { key: "policy", label: "Readiness policy", kind: "area" },
        ]}
        args={(v) => [v.name, v.policy]}
      />
    );
  if (route <= 1)
    return (
      <CommandForm
        title="Register shelter station"
        method="register_shelter"
        fields={[
          { key: "id", label: "Shelter ID" },
          { key: "name", label: "Shelter name" },
          { key: "address", label: "Address label" },
          { key: "url", label: "Facility plan URL", kind: "url" },
        ]}
        args={(v) => [v.id, v.name, v.address, v.url]}
      />
    );
  if (route === 2)
    return (
      <CommandForm
        title="Record accessibility check"
        method="record_accessibility_check"
        fields={[
          { key: "shelter", label: "Shelter ID" },
          { key: "id", label: "Check ID" },
          { key: "checkpoint", label: "Checkpoint" },
          { key: "passed", label: "Passed: true / false" },
          { key: "evidence", label: "Authority evidence ID" },
        ]}
        args={(v) => [
          v.shelter,
          v.id,
          v.checkpoint,
          v.passed.toLowerCase() === "true",
          v.evidence,
        ]}
      />
    );
  if (route === 3)
    return (
      <CommandForm
        title="Report operational incident"
        method="report_incident"
        fields={[
          { key: "shelter", label: "Shelter ID" },
          { key: "id", label: "Incident ID" },
          { key: "severity", label: "MINOR / MATERIAL / CRITICAL" },
          { key: "description", label: "Incident description", kind: "area" },
          { key: "evidence", label: "Authority evidence ID" },
        ]}
        args={(v) => [v.shelter, v.id, v.severity, v.description, v.evidence]}
      />
    );
  return <Activation />;
}
function Activation() {
  const tx = useProtocolTransaction();
  const [id, setId] = useState("");
  const [reference, setReference] = useState("");
  return (
    <section className="sg-activation">
      <header>
        <Radio />
        <div>
          <span>ACTIVATION AUTHORITY</span>
          <strong>Readiness and stand-up</strong>
        </div>
      </header>
      <label>
        <span>Shelter ID</span>
        <input value={id} onChange={(e) => setId(e.target.value)} />
      </label>
      <button
        onClick={() =>
          tx.write("Request readiness review", "request_readiness_review", [id])
        }
      >
        Request readiness review
      </button>
      <button
        onClick={() => tx.write("Assess readiness", "assess_readiness", [id])}
      >
        Run readiness consensus
      </button>
      <label>
        <span>Activation reference</span>
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </label>
      <button
        className="activate"
        onClick={() =>
          tx.write("Activate shelter", "activate_shelter", [id, reference])
        }
      >
        Activate shelter
      </button>
      <button
        onClick={() =>
          tx.write("Stand down shelter", "stand_down", [id, reference])
        }
      >
        Stand down
      </button>
      <Receipt s={tx.state} reset={tx.reset} />
    </section>
  );
}
function CommandWall({ items }: { items: Shelter[] }) {
  return (
    <div className="sg-wall">
      {[
        "REGISTERED",
        "INVENTORY_OPEN",
        "READINESS_REVIEW",
        "REASSESSMENT_REQUIRED",
        "ACTIVATED",
      ].map((state, i) => (
        <section key={state}>
          <header>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{state.replaceAll("_", " ")}</strong>
            <b>
              {
                items.filter((x) =>
                  x.state === state,
                ).length
              }
            </b>
          </header>
          {items
            .filter((x) =>
              x.state === state,
            )
            .map((x) => (
              <article key={x.id}>
                <div>
                  <Warehouse />
                  <code>{x.id}</code>
                  <i className={x.state === "ACTIVATED" ? "live" : ""} />
                </div>
                <h3>{x.name}</h3>
                <p>{x.address_label}</p>
                <footer>
                  <span>{x.zone_ids.length} zones</span>
                  <span>{x.shift_ids.length} shifts</span>
                  <span>{x.incident_ids.length} incidents</span>
                </footer>
              </article>
            ))}
          {!items.some((x) =>
            x.state === state,
          ) && <div className="sg-empty">NO STATIONS</div>}
        </section>
      ))}
    </div>
  );
}
export function AppShell({ routeIndex: initialRouteIndex }: Props) {
  const [routeIndex, setRouteIndex] = useState(initialRouteIndex);
  const p = useProtocol();
  const d = p.data as ShelterBootstrap | undefined;
  const c = d?.counts;
  useEffect(() => {
    document.documentElement.dataset.appHydrated = appConfig.projectId;
  }, []);
  return (
    <main className="sheltergrid">
      <header className="sg-alert">
        <Link href="../" className="sg-brand">
          <Siren />
          <div>
            <strong>SHELTERGRID</strong>
            <small>EMERGENCY READINESS NETWORK</small>
          </div>
        </Link>
        <div className="sg-live">
          <i />
          NETWORK LIVE · STUDIONET 61999
        </div>
        <div>
          <a href={contractExplorerUrl} target="_blank" rel="noreferrer">
            {contractAddress.slice(0, 8)}…<ExternalLink />
          </a>
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </header>
      <nav className="sg-nav">
        {appConfig.routes.map(([href, label], i) => (
          <a
            key={label}
            href={href}
            className={i === routeIndex ? "active" : ""}
            onClick={(event) => {
              event.preventDefault();
              setRouteIndex(i);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <aside className="sg-sites">
        <span>READINESS DOMAINS</span>
        {[
          [Warehouse, "Capacity zones"],
          [ClipboardList, "Supply lots"],
          [Accessibility, "Accessibility"],
          [Users, "Staffing shifts"],
          [ShieldCheck, "Activation plan"],
        ].map(([Icon, label], i) => (
          <div key={String(label)}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <Icon />
            <strong>{label as string}</strong>
            <i className={i < 3 ? "ok" : ""} />
          </div>
        ))}
      </aside>
      <section className="sg-main">
        <header>
          <ReadinessField />
          <span>COMMAND / {titles[routeIndex].toUpperCase()}</span>
          <h1>{titles[routeIndex]}</h1>
          <p>
            Authority-bound evidence, freshness and the current operational
            revision must converge before activation.
          </p>
        </header>
        {p.isLoading ? (
          <div className="sg-loading">
            <LoaderCircle className="spin" />
            Loading readiness wall
          </div>
        ) : p.isError ? (
          <div className="sg-error">
            {p.error.message}
            <button onClick={() => p.refetch()}>Retry</button>
          </div>
        ) : (
          <CommandWall items={d?.recent_shelters ?? []} />
        )}
        <Command route={routeIndex} configured={Boolean(d?.grid?.configured)} />
        <DomainContractActions />
      </section>
      <aside className="sg-incidents">
        <span>NETWORK TOTALS</span>
        {[
          ["Shelters", c?.shelters],
          ["Capacity zones", c?.zones],
          ["Supply lots", c?.supplies],
          ["Incidents", c?.incidents],
          ["Verified evidence", c?.evidence],
          ["Activated", c?.activated],
        ].map(([k, v]) => (
          <div key={String(k)}>
            <span>{k}</span>
            <b>{v ?? 0}</b>
          </div>
        ))}
        <article>
          <AlertTriangle />
          <strong>Neutral activation</strong>
          <p>A material change or critical incident invalidates the prior verdict and forces reassessment.</p>
        </article>
      </aside>
      <footer>
        <span>Wallet-secured dispatch</span>
        <span>SHA-256 + authority + expiry</span>
        <span>Desktop command station</span>
      </footer>
    </main>
  );
}
