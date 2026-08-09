# ShelterGrid

> Emergency shelter readiness is a live operational condition, not a static capacity number.

ShelterGrid coordinates shelters, zones, supplies, accessibility checks, staffing shifts, incidents, readiness reports, and activation decisions. Its GenLayer intelligent contract keeps every assessment connected to attributable evidence and preserves a conservative `limited_activation` path when the record is incomplete.

## Command Intent

The system helps an authorized response team answer three questions:

1. **What capacity is actually available now?**
2. **Which constraints prevent full activation?**
3. **What evidence supports the published readiness state?**

It does not dispatch emergency services automatically, guarantee physical availability, or replace local incident command.

## Readiness Board

ShelterGrid consolidates the operational picture in `/network`. The root route `/` introduces the project.

The board is organized around live command bands:

- shelter identity and operating authority;
- capacity and zone allocation;
- supply readiness;
- accessibility and facility checks;
- staffing and shift coverage;
- incidents and unresolved constraints;
- activation plan;
- consensus assessment and final status.

Because these bands describe the same selected shelter, they are not split into separate pages.

## Activation Matrix

| Evidence state | Operational posture |
| --- | --- |
| Capacity, staffing, supplies, and checks supported | Eligible for full activation review |
| Essential evidence incomplete | `limited_activation` |
| Material incident or blocker open | Hold or constrained activation |
| New counter-evidence filed | Reassess before publishing |
| Final record approved | Publish readiness state and retain audit history |

## Network Record

**Protocol:** ShelterGrid Activation Protocol  
**Chain:** GenLayer Studionet `61999`  
**Contract:** [`0x657C681CF3b6D727B6ddC56155847E7BdaA3bA32`](https://explorer-studio.genlayer.com/address/0x657C681CF3b6D727B6ddC56155847E7BdaA3bA32)  
Live app: https://teranaollpol.github.io/sheltergrid/
**Public methods:** 25  
**Deployment:** `configured_verified`

## Stand Up A Local Board

```powershell
npm run dev
```

Operational verification:

```powershell
npm run typecheck
npm test
npm run test:studionet
npm run build
```
