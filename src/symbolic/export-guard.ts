import { makeGlyphcard } from "./glyphcard.js";
import {
  DLP_LEVELS,
  defaultManifest,
  type DlpInfo,
  type SymbolicManifest,
} from "./manifest.js";
import { createSeal } from "./seal.js";

export type ExportPolicy = "off" | "warn" | "strict";

export interface GuardOptions {
  policy?: ExportPolicy;
  anchor?: string;
  manifest?: Partial<Omit<SymbolicManifest, "dlp">> & {
    dlp?: Partial<DlpInfo>;
  };
  makeGlyphcard?: boolean;
  redactGlyphcard?: boolean;
  source?: string;
}

function environmentPolicy(): ExportPolicy {
  const policy = process.env.AURORA_EXPORT_POLICY?.toLowerCase();
  if (policy === undefined) return "warn";
  if (policy === "off" || policy === "warn" || policy === "strict")
    return policy;
  throw new Error("AURORA_EXPORT_POLICY must be off, warn, or strict");
}

function environmentFlag(
  value: string | undefined,
  fallback: boolean,
): boolean {
  return value === undefined ? fallback : /^(1|true)$/i.test(value);
}

export function guardExport<T>(artifact: T, options: GuardOptions = {}) {
  const policy = options.policy ?? environmentPolicy();
  const warnings: string[] = [];
  const supplied = options.manifest;
  const classification = supplied?.dlp?.classification;
  const contextTag = supplied?.dlp?.context_tag;
  const hasClassification =
    classification !== undefined && DLP_LEVELS.includes(classification);
  const hasContext =
    typeof contextTag === "string" && contextTag.trim().length > 0;
  if (!hasClassification || !hasContext) {
    if (policy === "strict") {
      throw new Error(
        "Strict export policy requires a manifest with a DLP classification and context tag",
      );
    }
    if (policy === "warn")
      warnings.push("Missing or incomplete DLP metadata was filled in.");
  }

  const defaults = defaultManifest();
  const manifest: SymbolicManifest = {
    ...defaults,
    ...supplied,
    anchor: supplied?.anchor ?? options.anchor ?? defaults.anchor,
    dlp: {
      ...supplied?.dlp,
      classification: hasClassification
        ? classification
        : defaults.dlp.classification,
      context_tag: hasContext ? contextTag : defaults.dlp.context_tag,
    },
  };
  const sealed = createSeal(artifact, manifest);
  const includeGlyphcard =
    options.makeGlyphcard ??
    environmentFlag(process.env.AURORA_GLYPHCARDS, false);
  const redact =
    options.redactGlyphcard ??
    environmentFlag(process.env.AURORA_GLYPHCARD_REDACT, true);
  if (warnings.length) {
    console.warn("[EXPORT_GUARD]", {
      source: options.source ?? "export-guard",
      anchor: manifest.anchor,
      srb_tags: manifest.srb_tags,
      warnings,
    });
  }
  return {
    sealed,
    warnings,
    glyphcard: includeGlyphcard ? makeGlyphcard(sealed, { redact }) : undefined,
  };
}
