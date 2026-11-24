import { stableStringify, type SealedArtifact } from "./seal.js";

export function makeGlyphcard(sealed: SealedArtifact, { redact = true } = {}) {
  const { artifact, manifest, seal } = sealed;
  const artifactType = Array.isArray(artifact)
    ? "array"
    : artifact === null
      ? "null"
      : typeof artifact;
  return {
    title: "Glyphcard",
    ...seal,
    anchor: manifest.anchor,
    ethics_protocol: manifest.ethics_protocol,
    srb_tags: [...manifest.srb_tags],
    classification: manifest.dlp.classification,
    manifest_version: manifest.version,
    artifact_stats: {
      byte_length: Buffer.byteLength(stableStringify(artifact)),
      type: artifactType,
      keys:
        artifact !== null && typeof artifact === "object"
          ? Object.keys(artifact).length
          : 0,
    },
    redacted: redact,
    ...(redact
      ? {}
      : { team: manifest.team, context_tag: manifest.dlp.context_tag }),
  };
}
