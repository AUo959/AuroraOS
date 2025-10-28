/**
 * Test glyphcard generation from a sealed bundle
 */

import { makeGlyphcard } from "./dist/symbolic/glyphcard.js";

// Sample sealed bundle (from previous output)
const sealedBundle = {
  "artifact": {
    "test": "snapshot data",
    "timestamp": "2025-09-13T23:40:11.362Z"
  },
  "manifest": {
    "version": "1.0.0",
    "anchor": "AURORA_CORE",
    "ethics_protocol": "Picard_Delta_3",
    "srb_tags": [
      "SRB_AURORA_CORE",
      "T1"
    ],
    "dlp": {
      "classification": "DLP_L1_OK",
      "context_tag": "AURORA_EXPORT",
      "notes": "Default manifest for Aurora symbolic operations"
    },
    "team": "AuroraOS",
    "export_time": "2025-09-13T23:40:11.368Z"
  },
  "seal": {
    "algo": "aurora-simple-hash-v1",
    "digest": "57af3b64",
    "created_at": "2025-09-13T23:40:11.368Z"
  }
};

console.log("Testing glyphcard generation from sealed bundle...\n");

// Test default (redacted) glyphcard
console.log("1. Redacted glyphcard (default):");
const redactedCard = makeGlyphcard(sealedBundle);
console.log(JSON.stringify(redactedCard, null, 2));

console.log("\n" + "=".repeat(50) + "\n");

// Test unredacted glyphcard
console.log("2. Unredacted glyphcard:");
const unredactedCard = makeGlyphcard(sealedBundle, { redact: false });
console.log(JSON.stringify(unredactedCard, null, 2));