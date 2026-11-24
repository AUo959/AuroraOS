export { ANCHORS, SRB } from "./symbolic/anchors.js";
export { driftScore, recordDrift, type DriftProbe } from "./symbolic/drift.js";
export {
  guardExport,
  type ExportPolicy,
  type GuardOptions,
} from "./symbolic/export-guard.js";
export { makeGlyphcard } from "./symbolic/glyphcard.js";
export {
  defaultManifest,
  type DlpInfo,
  type DlpLevel,
  type SymbolicManifest,
} from "./symbolic/manifest.js";
export {
  createSeal,
  stableStringify,
  verifySeal,
  type SealedArtifact,
  type SealInfo,
} from "./symbolic/seal.js";

import { SRB } from "./symbolic/anchors.js";

export function withAnchorLog<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
  anchor: string,
  srb_tags: string[] = [SRB.CORE],
): (...args: Args) => Result {
  return (...args) => {
    console.debug("[ANCHOR]", {
      anchor,
      srb_tags,
      argument_count: args.length,
    });
    return fn(...args);
  };
}
