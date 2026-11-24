# Symbolic exports

Exports carry a versioned manifest with the T1 anchor, SRB tags,
`Picard_Delta_3`, and data-loss-prevention classification and context.
A SHA-256 digest covers the JSON artifact and manifest. Verification checks
integrity against the bundled digest. Origin authentication requires a
trusted digest or signature from the exporting party.

```sh
npm run --silent snap:seal -- --file artifact.json > sealed.json
npm run --silent snap:verify -- --file sealed.json
npm run --silent glyphcard -- --file sealed.json
npm run --silent reliquary:index > index.json
```

The snapshot and glyphcard commands also read standard input. The reliquary
command indexes locations in tracked source and Markdown files. Its JSON
contains repository-relative paths and line numbers.

```ts
import { ANCHORS, defaultManifest, guardExport } from "./src/index.js";

const manifest = defaultManifest({
  anchor: ANCHORS.CORE,
  dlp: { classification: "DLP_L2_LOCKED", context_tag: "CONTINUITY_SNAPSHOT" },
});
const { sealed, glyphcard } = guardExport({ observations: 3 }, {
  manifest,
  policy: "strict",
  makeGlyphcard: true,
});
```

| Setting | Default | Behavior |
| --- | --- | --- |
| `AURORA_EXPORT_POLICY` | `warn` | `strict` requires explicit classification and context. `warn` supplies defaults with a warning. `off` supplies defaults silently. |
| `AURORA_GLYPHCARDS` | `0` | Set to `1` to include a glyphcard with guarded exports. |
| `AURORA_GLYPHCARD_REDACT` | `1` | Redacted cards omit the team and context tag. The CLI uses `--no-redact` to include them. |

Function options override environment settings. Missing classifications
default to `DLP_L2_LOCKED`. Glyphcards contain metadata and aggregate artifact
statistics. Export the sealed snapshot separately when the artifact is needed.
