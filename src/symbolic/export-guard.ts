/**
 * SRB: AURORA_CORE | T1
 * Export Guard: policy-driven manifest enforcement + sealing + optional glyphcard.
 * Policies: off | warn | strict (env: AURORA_EXPORT_POLICY; default 'warn').
 */
import { defaultManifest, type SymbolicManifest } from "./manifest.js";
import { createSeal, verifySeal, type SealedArtifact, stableStringify } from "./seal.js";
import { ANCHORS, SRB, type Anchor } from "./anchors.js";
import { makeGlyphcard } from "./glyphcard.js";

export type ExportPolicy = "off" | "warn" | "strict";

export interface GuardOptions<TMeta = Record<string, unknown>> {
  policy?: ExportPolicy;           // overrides env
  anchor?: Anchor | string;        // defaults to ANCHORS.CORE
  manifest?: SymbolicManifest<TMeta>;
  makeGlyphcard?: boolean;         // overrides env AURORA_GLYPHCARDS
  redactGlyphcard?: boolean;       // overrides env AURORA_GLYPHCARD_REDACT (default true)
  source?: string;                 // for logs (e.g., "mastra:http:export")
}

export interface GuardResult<T> {
  sealed: SealedArtifact<T>;
  glyphcard?: Record<string, unknown>;
  warnings: string[];
}

function envPolicy(): ExportPolicy {
  // Use globalThis to access process.env in Node.js environments
  const env = (globalThis as any).process?.env;
  const v = (env?.AURORA_EXPORT_POLICY || "warn").toLowerCase();
  if (v === "off" || v === "warn" || v === "strict") return v;
  return "warn";
}

function envOn(name: string, fallback: boolean): boolean {
  const env = (globalThis as any).process?.env;
  const v = env?.[name];
  if (v == null) return fallback;
  return v === "1" || v?.toLowerCase() === "true";
}

export async function guardExport<T>(
  artifact: T,
  opts: GuardOptions = {}
): Promise<GuardResult<T>> {
  const policy: ExportPolicy = opts.policy ?? envPolicy();
  const anchor = opts.anchor ?? ANCHORS.CORE;
  const warnings: string[] = [];

  let manifest = opts.manifest;
  if (!manifest) {
    if (policy === "strict") {
      throw new Error("[EXPORT_GUARD] strict policy requires a manifest");
    }
    manifest = defaultManifest({ anchor: String(anchor) });
    if (policy === "warn") warnings.push("Manifest missing; attached defaultManifest().");
  }

  // Validate manifest requirements
  const missingClass = !manifest.dlp?.classification;
  const missingCtx = !manifest.dlp?.context_tag;
  if (missingClass || missingCtx) {
    if (policy === "strict") {
      throw new Error(
        "[EXPORT_GUARD] strict policy requires dlp.classification and dlp.context_tag"
      );
    } else {
      if (missingClass) warnings.push("dlp.classification missing; default assumed DLP_L1_OK.");
      if (missingCtx) warnings.push("dlp.context_tag missing; default assumed AURORA_EXPORT.");
      manifest = {
        ...manifest,
        dlp: {
          classification: (manifest.dlp as any)?.classification ?? "DLP_L1_OK",
          context_tag: (manifest.dlp as any)?.context_tag ?? "AURORA_EXPORT",
          notes: manifest.dlp?.notes,
        },
      };
    }
  }

  // Seal
  const sealed = await createSeal(artifact, manifest);
  const ok = await verifySeal(sealed);
  if (!ok) throw new Error("[EXPORT_GUARD] seal verification failed");

  // Optional glyphcard
  const wantGlyph = opts.makeGlyphcard ?? envOn("AURORA_GLYPHCARDS", false);
  const redact = opts.redactGlyphcard ?? envOn("AURORA_GLYPHCARD_REDACT", true);
  const glyphcard = wantGlyph ? makeGlyphcard(sealed, { redact }) : undefined;

  // Log (anchor + SRB)
  const entry = {
    anchor,
    srb_tags: [SRB.CORE, "SRB_EXPORT"],
    policy,
    source: opts.source ?? "export-guard",
    digest: sealed.seal.digest,
    size: stableStringify(artifact).length,
    warnings,
  };
  
  // Use globalThis to access console in different environments
  const logFn = (globalThis as any).console;
  if (logFn) {
    if (warnings.length) logFn.warn("[EXPORT_GUARD]", JSON.stringify(entry));
    else logFn.debug("[EXPORT_GUARD]", JSON.stringify(entry));
  }

  return { sealed, glyphcard, warnings };
}