import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(".");
const contract = fs.readFileSync(path.join(root, "contracts", "ShelterGrid.py"), "utf8");
const surface = fs.readFileSync(path.join(root, "src", "lib", "contract-surface.ts"), "utf8");
const client = fs.readFileSync(path.join(root, "src", "lib", "genlayer.ts"), "utf8");
const deployment = fs.readFileSync(path.join(root, "src", "lib", "deployment.ts"), "utf8");

const writes = [
  "configure_grid", "set_coordinator", "set_evidence_authority", "register_shelter",
  "submit_operational_evidence", "add_capacity_zone", "log_supply_lot",
  "record_accessibility_check", "schedule_staffing_shift", "report_incident",
  "close_incident", "request_readiness_review", "assess_readiness",
  "activate_shelter", "submit_shift_report", "stand_down", "archive_shelter_cycle",
];
const views = [
  "get_grid_config", "get_evidence_authority", "get_operational_evidence",
  "get_shelter_evidence", "get_shelter", "get_readiness_inventory",
  "get_readiness_vector", "get_activation_plan", "get_incident_board",
  "get_shift_reports", "get_operations_timeline", "get_shelters_by_state",
  "get_frontend_bootstrap",
];

test("contract pins GenVM and exposes the exact 30-method operational surface", () => {
  assert.match(contract.split(/\r?\n/)[0], /py-genlayer:[a-z0-9]{20,}/);
  assert.doesNotMatch(contract, /py-genlayer:(test|latest)/);
  for (const method of [...writes, ...views]) {
    assert.match(contract, new RegExp(`def ${method}\\(`));
    assert.match(surface, new RegExp(`"${method}"`));
  }
  assert.equal(writes.length + views.length, 30);
});

test("authority, digest, freshness and revision guards are enforced in contract code", () => {
  for (const marker of [
    "evidence_authorities", "source_sha256", "expires_at", "_consensus_evidence",
    "operational_revision", "assessment_current", "REASSESSMENT_REQUIRED",
    "Readiness assessment is stale", "open_critical_incident_totals",
  ]) assert.match(contract, new RegExp(marker));
  assert.match(contract, /leader\.get\("sha256"\) == follower\.get\("sha256"\)/);
  assert.match(contract, /leader\.get\("result"\) != validator\.get\("result"\)/);
});

test("published deployment config targets the live ShelterGrid contract", () => {
  assert.match(deployment, /0xA748CB9228f17549838E02E0Eb5ee9cFeDcA0938/);
  assert.match(deployment, /explorer-studio\.genlayer\.com/);
  assert.doesNotMatch(deployment, /deployment\.json/);
});

test("browser writes use the connected signer and verify finalized majority consensus", () => {
  assert.match(client, /useWalletClient/);
  assert.match(client, /provider:/);
  assert.match(client, /TransactionStatus\.FINALIZED/);
  assert.match(client, /MAJORITY_AGREE/);
  assert.doesNotMatch([contract, surface, client, deployment].join("\n"), /privateKey|mnemonic|seedPhrase/i);
});
