import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const deployment = JSON.parse(
  fs.readFileSync(path.resolve("deployment.json"), "utf8"),
);
const client = createClient({ chain: studionet });

async function read(functionName, args = []) {
  assert.match(deployment.contractAddress, /^0x[0-9a-fA-F]{40}$/);
  return client.readContract({
    address: deployment.contractAddress,
    functionName,
    args,
    jsonSafeReturn: true,
  });
}

test("deployed schema exposes the protocol lifecycle", async () => {
  const schema = await read("get_protocol_schema");
  assert.equal(schema.name, deployment.name);
  assert.equal(schema.neutral_outcome, deployment.neutralOutcome);
  assert.ok(schema.child_kinds.length >= 5);
});

test("frontend bootstrap returns persisted counts and records", async () => {
  const bootstrap = await read("get_frontend_bootstrap");
  assert.equal(bootstrap.protocol.name, deployment.protocolName);
  assert.ok(bootstrap.counts.records >= 1);
  assert.ok(Array.isArray(bootstrap.recent_records));
});
