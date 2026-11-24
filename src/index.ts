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

export function withAnchorLog<F extends CallableFunction>(
  fn: F,
  anchor: string,
  srb_tags: string[] = [SRB.CORE],
): F {
  return new Proxy(fn, {
    apply(target, receiver, args) {
      console.debug("[ANCHOR]", {
        anchor,
        srb_tags,
        argument_count: args.length,
      });
      return Reflect.apply(target, receiver, args);
    },
  });
}
