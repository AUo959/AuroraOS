/**
 * SRB: AURORA_CORE | T1
 * Glyphcards: deterministic, DLP-aware summaries for sealed artifacts.
 * No sensitive payload content is included; only manifest + shallow stats.
 */
import { type SealedArtifact, stableStringify } from "./seal.js";

export interface GlyphcardOptions {
  maxFields?: number;  // reserved for future; not used in this minimal card
  redact?: boolean;    // default true (no payload excerpts)
}

export function makeGlyphcard<T>(sealed: SealedArtifact<T>, opts: GlyphcardOptions = {}): Record<string, unknown> {
  const { manifest, seal, artifact } = sealed;
  const redact = opts.redact !== false; // default true

  const payloadStr = stableStringify(artifact);
  const stats = {
    byte_length: payloadStr.length,
    type: Array.isArray(artifact) ? "array" : typeof artifact === "object" && artifact !== null ? "object" : typeof artifact,
    keys: typeof artifact === "object" && artifact !== null && !Array.isArray(artifact)
      ? Object.keys(artifact as Record<string, unknown>).length
      : Array.isArray(artifact) ? (artifact as unknown[]).length : 0,
  };

  // Deterministic field order
  return {
    title: "Glyphcard",
    algo: seal.algo,
    digest: seal.digest,
    created_at: seal.created_at,
    anchor: manifest.anchor,
    ethics_protocol: manifest.ethics_protocol,
    srb_tags: manifest.srb_tags,
    classification: manifest.dlp.classification,
    context_tag: manifest.dlp.context_tag,
    manifest_version: manifest.version,
    team: manifest.team,
    export_time: manifest.export_time,
    artifact_stats: stats,
    // No payload excerpts when redacted (default). Option reserved for future.
    redacted: redact,
  } as const;
}