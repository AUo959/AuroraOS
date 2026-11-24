import { createHash } from "node:crypto";
import {
  defaultManifest,
  manifestSchema,
  type SymbolicManifest,
} from "./manifest.js";

export interface SealInfo {
  algo: "SHA256";
  digest: string;
  created_at: string;
}

export interface SealedArtifact<T = unknown> {
  artifact: T;
  manifest: SymbolicManifest;
  seal: SealInfo;
}

export function stableStringify(value: unknown): string {
  const ancestors = new Set<object>();

  function serialize(item: unknown): string {
    if (item === null) return "null";
    switch (typeof item) {
      case "string":
      case "boolean":
        return JSON.stringify(item);
      case "number":
        if (Number.isFinite(item)) return JSON.stringify(item);
        break;
      case "object":
        return serializeContainer(item);
    }
    throw new TypeError("Expected a finite JSON value");
  }

  function serializeContainer(item: object): string {
    if (ancestors.has(item)) throw new TypeError("Circular JSON reference");

    ancestors.add(item);
    try {
      if (Array.isArray(item)) {
        return "[" + Array.from(item, serialize).join(",") + "]";
      }
      const prototype = Object.getPrototypeOf(item);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new TypeError("Expected a plain JSON object");
      }
      const object = item as Record<string, unknown>;
      const entries = Object.entries(object)
        .sort(([left], [right]) => (left < right ? -1 : Number(left > right)))
        .map(([key, value]) => JSON.stringify(key) + ":" + serialize(value));
      return "{" + entries.join(",") + "}";
    } finally {
      ancestors.delete(item);
    }
  }

  return serialize(value);
}

export function createSeal<T>(
  artifact: T,
  manifest: SymbolicManifest = defaultManifest(),
): SealedArtifact<T> {
  const payload = stableStringify({ artifact, manifest });
  const snapshot: Pick<SealedArtifact<T>, "artifact" | "manifest"> = JSON.parse(
    payload,
  );
  manifestSchema.parse(snapshot.manifest);
  return {
    ...snapshot,
    seal: {
      algo: "SHA256",
      digest: createHash("sha256").update(payload).digest("hex"),
      created_at: snapshot.manifest.export_time,
    },
  };
}

export function verifySeal(input: unknown): input is SealedArtifact {
  try {
    const { artifact, manifest, seal } = input as Omit<
      SealedArtifact,
      "seal"
    > & {
      seal: Record<string, unknown>;
    };
    if (seal.algo !== "SHA256" || seal.created_at !== manifest.export_time) {
      return false;
    }
    return createSeal(artifact, manifest).seal.digest === seal.digest;
  } catch {
    return false;
  }
}
