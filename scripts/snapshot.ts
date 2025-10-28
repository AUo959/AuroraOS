#!/usr/bin/env tsx
/**
 * SRB: AURORA_CORE | T1
 * CLI tool to seal/verify JSON artifacts from stdin or file.
 * Usage:
 *   cat state.json | npm run snap:seal -- --anchor T1_AURORA_CORE > sealed.json
 *   cat sealed.json | npm run snap:verify
 */
import { readFileSync } from "node:fs";
import { createSeal, verifySeal, type SealedArtifact } from "../src/symbolic/seal.js";
import { defaultManifest } from "../src/symbolic/manifest.js";

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === "--help" || !command) {
    console.error("Usage:");
    console.error("  Seal:   cat artifact.json | node scripts/snapshot.ts seal --anchor T1_ANCHOR");
    console.error("  Verify: cat sealed.json | node scripts/snapshot.ts verify");
    process.exit(1);
  }

  try {
    if (command === "seal") {
      const anchorIndex = args.indexOf("--anchor");
      const anchor = anchorIndex !== -1 ? args[anchorIndex + 1] : "T1_AURORA_CORE";
      
      const fileIndex = args.indexOf("--file");
      const input = fileIndex !== -1 
        ? readFileSync(args[fileIndex + 1], "utf-8")
        : await readStdin();
      
      const artifact = JSON.parse(input);
      const manifest = defaultManifest({ anchor });
      const sealed = await createSeal(artifact, manifest);
      
      console.log(JSON.stringify(sealed, null, 2));
      
    } else if (command === "verify") {
      const input = await readStdin();
      const sealed: SealedArtifact = JSON.parse(input);
      const isValid = await verifySeal(sealed);
      
      if (isValid) {
        console.log("✓ Seal verification PASSED");
        console.log(`Anchor: ${sealed.manifest.anchor}`);
        console.log(`Digest: ${sealed.manifest.seal?.digest}`);
        process.exit(0);
      } else {
        console.error("✗ Seal verification FAILED");
        process.exit(1);
      }
    } else {
      console.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(console.error);