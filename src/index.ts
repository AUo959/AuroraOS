/**
 * SRB: AURORA_CORE | T1
 * Public exports for symbolic utilities and initialization helpers.
 */
export { defaultManifest, type SymbolicManifest, type DlpLevel, type DlpInfo } from "./symbolic/manifest.js";
export { createSeal, verifySeal, stableStringify, type SealedArtifact, type SealInfo } from "./symbolic/seal.js";
export { ANCHORS, SRB, type Anchor, type SRBTag } from "./symbolic/anchors.js";
export { guardExport, type ExportPolicy, type GuardOptions, type GuardResult } from "./symbolic/export-guard.js";
export { makeGlyphcard, type GlyphcardOptions } from "./symbolic/glyphcard.js";