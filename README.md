# AuroraOS

Status: T1 Anchor | SRB: AURORA_CORE | Ethics: Picard_Delta_3

AuroraOS is a Mastra-based TypeScript agent stack for symbolic simulation threads with sealed continuity, drift detection, and DLP-aware exports.

## Quickstart
- Requirements: Node >= 20.9
- Install: `npm i`
- Dev: `npm run dev` (Mastra)
- Build: `npm run build`
- Type-check: `npm run check`
- Test: `npm test`

## Symbolic Conventions
- Anchors: T1 anchors are declared in `src/symbolic/anchors.ts` (see below).
- SRB Tags: Use `SRB_*` in headers/logs to preserve lineage.
- Ethics: Current protocol `Picard_Delta_3`. Update changes in [docs/ethics-log.md](./docs/ethics-log.md).

## DLP
All exports must include:
- dlp.classification (e.g., DLP_L1_OK, DLP_L2_LOCKED)
- dlp.notes for confidential/critical fields
- context_tag for audit trails

Use `src/symbolic/manifest.ts` to standardize export manifests.

## Continuity & Observability
- Drift/Entropy: `src/symbolic/drift.ts`
- Sealing: `src/symbolic/seal.ts` for SHA256 sealing and verification
- Reliquary Index: `scripts/reliquary-index.ts` to index anchors across repo
- Snapshot: `scripts/snapshot.ts` to seal/verify any artifact

## CLI
- Seal JSON from file/stdin:
  - `cat state.json | npm run snap:seal -- --anchor T1_AURORA_CORE > sealed.json`
- Verify a sealed bundle:
  - `cat sealed.json | npm run snap:verify`
- Build an anchor index (prints JSON index to stdout):
  - `npm run reliquary:index`

## Example
```ts
import { createSeal } from "./src/symbolic/seal.js";
import { defaultManifest } from "./src/symbolic/manifest.js";

const artifact = { hello: "world" };
const { manifest, seal } = await createSeal(artifact, defaultManifest({ anchor: "T1_AURORA_CORE" }));
console.log("Sealed:", seal.digest);
```

## Tests
- `npm test` runs TypeScript tests via tsx and Node's built-in test runner.
- See examples in `tests/`.

## Roadmap
- [ ] Wire Mastra agents to anchors and drift probes
- [ ] Export bundle manifests for agent actions
- [ ] Live diagnostics with anchor-aware logging
- [ ] Glyphcard generation on thread seal/rehydration