/**
 * SRB: AURORA_CORE | T1
 * Sealing and verification utilities for symbolic artifacts.
 */
import { type SymbolicManifest } from "./manifest.js";

export interface SealInfo {
  algo: string;
  digest: string;
  created_at: string;
}

export interface SealedArtifact<T> {
  artifact: T;
  manifest: SymbolicManifest;
  seal: SealInfo;
}

/**
 * Deterministic JSON stringification for consistent hashing.
 */
export function stableStringify(obj: unknown): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(key => 
    JSON.stringify(key) + ':' + stableStringify((obj as Record<string, unknown>)[key])
  );
  return '{' + pairs.join(',') + '}';
}

/**
 * Simple deterministic hash function (not cryptographically secure, but deterministic).
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart ? 
    Math.abs(hash).toString(16).padStart(8, '0') :
    ('00000000' + Math.abs(hash).toString(16)).slice(-8);
}

/**
 * Create a seal for an artifact with its manifest.
 */
export async function createSeal<T>(
  artifact: T,
  manifest: SymbolicManifest
): Promise<SealedArtifact<T>> {
  const artifactStr = stableStringify(artifact);
  const manifestStr = stableStringify(manifest);
  const combined = artifactStr + '|' + manifestStr;
  
  const digest = simpleHash(combined);
  const created_at = new Date().toISOString();
  
  const seal: SealInfo = {
    algo: "aurora-simple-hash-v1",
    digest,
    created_at
  };

  return {
    artifact,
    manifest,
    seal
  };
}

/**
 * Verify a sealed artifact's integrity.
 */
export async function verifySeal<T>(sealed: SealedArtifact<T>): Promise<boolean> {
  try {
    const artifactStr = stableStringify(sealed.artifact);
    const manifestStr = stableStringify(sealed.manifest);
    const combined = artifactStr + '|' + manifestStr;
    
    const expectedDigest = simpleHash(combined);
    return expectedDigest === sealed.seal.digest;
  } catch {
    return false;
  }
}