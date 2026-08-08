import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(".");
const contract = fs.readFileSync(path.join(root, "contracts", "ShelterGrid.py"), "utf8");
const shell = fs.readFileSync(path.join(root, "src", "components", "app-shell.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src", "app", "globals.css"), "utf8");
const client = fs.readFileSync(path.join(root, "src", "lib", "genlayer.ts"), "utf8");

test("shelter contract models inventory, readiness, incidents and activation", () => {
  for (const method of [
    "register_shelter",
    "add_capacity_zone",
    "log_supply_lot",
    "record_accessibility_check",
    "schedule_staffing_shift",
    "assess_readiness",
    "activate_shelter",
    "submit_shift_report",
  ]) assert.match(contract, new RegExp(`def ${method}\\(`));
  assert.match(contract, /run_nondet_unsafe/);
  assert.match(contract, /untrusted/);
});

test("frontend is a dedicated emergency command wall", () => {
  for (const marker of ["sg-wall", "READINESS DOMAINS", "NETWORK TOTALS", "SHELTERGRID"]) {
    assert.match(shell, new RegExp(marker));
  }
  assert.match(css, /--deep:#365c2f/);
  assert.doesNotMatch(shell, /CreateRecordForm|TenderRegister|DomainVisual/);
});

test("writes verify finality and majority execution", () => {
  assert.match(client, /TransactionStatus\.FINALIZED/);
  assert.match(client, /MAJORITY_AGREE/);
  assert.doesNotMatch([contract, shell, client].join("\n"), new RegExp(["private" + "Key", "mne" + "monic", "seed" + "Phrase"].join("|")));
});
