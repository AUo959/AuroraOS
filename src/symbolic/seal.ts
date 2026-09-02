/**
 * SRB: AURORA_CORE | T1
 * SHA256 sealing and verification for artifacts and thread states.
 * Stateless helpers; caller decides persistence.
 */
import { createHash } from "node:crypto";
import { defaultManifest, type SymbolicManifest, type SealInfo } from "./manifest.js";

export interface SealedArtifact<T = unknown> {
  manifest: SymbolicManifest;
  seal: SealInfo;
  artifact: T;
}

// Deterministic stringify with sorted keys to stabilize digests.
export function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const stringify = (val: unknown): unknown => {
    if (val === null) return null;
    const t = typeof val;
    if (t === "string" || t === "number" || t === "boolean") return val;
    if (Array.isArray(val)) return (val as unknown[]).map((v) => stringify(v));
    if (t === "object") {
      if (seen.has(val as object)) return "[Circular]";
      seen.add(val as object);
      const obj = val as Record<string, unknown>;
      const sortedKeys = Object.keys(obj).sort();
      const out: Record<string, unknown> = {};
      for (const k of sortedKeys) out[k] = stringify(obj[k]);
      return out;
    }
    return String(val);
  };
  return JSON.stringify(stringify(value));
}

export async function createSeal<T>(
  artifact: T,
  manifest: SymbolicManifest = defaultManifest({ anchor: "T1_AURORA_CORE" })
): Promise<SealedArtifact<T>> {
  const payload = stableStringify({ artifact, manifest: { ...manifest, seal: undefined } });
  const digest = createHash("sha256").update(payload).digest("hex");
  const seal: SealInfo = { algo: "SHA256", digest, created_at: new Date().toISOString() };
  return { manifest: { ...manifest, seal }, seal, artifact };
}

export async function verifySeal<T>(sealed: SealedArtifact<T>): Promise<boolean> {
  const { artifact, manifest } = sealed;
  if (!manifest.seal) return false;
  const payload = stableStringify({ artifact, manifest: { ...manifest, seal: undefined } });
  const digest = createHash("sha256").update(payload).digest("hex");
  return digest === manifest.seal.digest;
}