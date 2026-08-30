# ShelterGrid

ShelterGrid is an emergency-readiness ledger for shelters whose activation depends on a current, attributable operational record. The application combines deterministic inventory and incident accounting with GenLayer consensus over independently fetched authority evidence.

## Application

- Live site: https://teranaollpol.github.io/sheltergrid/
- App route: https://teranaollpol.github.io/sheltergrid/app/
- Network: GenLayer StudioNet (`61999`)
- Contract: [`0xA748CB9228f17549838E02E0Eb5ee9cFeDcA0938`](https://explorer-studio.genlayer.com/address/0xA748CB9228f17549838E02E0Eb5ee9cFeDcA0938)
- Frontend: Next.js, React, RainbowKit, wagmi, genlayer-js

## Operational trust model

The grid owner appoints two distinct roles:

- **coordinators** request final activation and manage incident resolution;
- **evidence authorities** publish operational records from their own bound wallets.

An authority record is accepted only when validators can retrieve its public HTTPS source and independently reproduce the committed SHA-256. Every record has an on-chain observation time and expiry. Facility, capacity, supplies, accessibility, staffing and incident evidence must all be current before a review can begin.

## Readiness revisions

Every readiness-affecting write advances `operational_revision`. A plan stores the exact revision and a six-category evidence snapshot used by consensus. Activation checks that:

1. the stored plan revision still equals the live operational revision;
2. every snapshotted evidence record remains current and correctly bound;
3. no critical incident is open;
4. the shelter is in a consensus-approved `READY` or `CONDITIONAL` state.

A new evidence record, inventory change, incident or resolution sets `assessment_current` to false. Existing `READY`, `CONDITIONAL`, `NOT_READY`, review or active states move to `REASSESSMENT_REQUIRED`. This prevents an older verdict from surviving a material change.

## Consensus boundary

The contract owns the activation decision. Validators re-fetch all six authority records, verify their hashes, compare them with the deterministic inventory and incident counters, then independently agree on every readiness dimension, the final result and the confidence bucket. Open critical incidents are a deterministic `NOT_READY` override.

The React client owns navigation, wallet connection and presentation only. Browser writes are signed through the connected wagmi wallet provider and are shown as successful only after `FINALIZED`, `MAJORITY_AGREE` consensus.

## Repository map

- `contracts/ShelterGrid.py` — pinned GenVM intelligent contract (30 public methods).
- `tests/direct/test_sheltergrid.py` — role, hash, freshness, revision and lifecycle regressions.
- `tests/source.test.mjs` — contract/client surface and signer-path checks.
- `src/lib/deployment.ts` — public StudioNet contract address used by the frontend.

## Verify locally

```powershell
python -m pip install -r requirements.txt
genvm-lint check contracts/ShelterGrid.py --json
python -m pytest tests/direct -q
npm ci --legacy-peer-deps
npm test
npm run typecheck
npm run build
```

ShelterGrid supports incident command; it does not replace physical inspections, emergency dispatch or the responsible public authority.
