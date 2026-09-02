/**
 * SRB: AURORA_CORE | T1
 * Public exports for symbolic utilities and initialization helpers.
 */
export { defaultManifest, type SymbolicManifest, type DlpInfo, type DlpLevel, type SealInfo } from "./symbolic/manifest.js";
export { createSeal, verifySeal, stableStringify, type SealedArtifact } from "./symbolic/seal.js";
export { recordDrift, driftScore, type DriftProbe } from "./symbolic/drift.js";
export { ANCHORS, SRB, type Anchor, type SrbTag } from "./symbolic/anchors.js";

/**
 * Helper for anchor-aware logging that preserves SRB tags.
 * Use this to integrate symbolic utilities into existing Mastra flows.
 */
export function withAnchorLog<T extends (...args: any[]) => any>(
  fn: T,
  anchor: string,
  srb_tags: string[] = ["SRB_AURORA_CORE"]
): T {
  return ((...args: Parameters<T>) => {
    console.debug(`[ANCHOR:${anchor}]`, JSON.stringify({ srb_tags, args: args.length }));
    return fn(...args);
  }) as T;
}