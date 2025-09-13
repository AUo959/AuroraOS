#!/usr/bin/env node
/**
 * SRB: AURORA_CORE | T1
 * Glyphcard generator CLI for sealed bundles.
 * Usage: npm run glyphcard [--file <path>] [--no-redact]
 */

import { readFile } from "fs/promises";
import { makeGlyphcard } from "../src/symbolic/glyphcard.js";
import { type SealedArtifact } from "../src/symbolic/seal.js";

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.indexOf("--file");
  const noRedact = args.includes("--no-redact");
  
  let input: string;
  
  if (fileArg !== -1 && args[fileArg + 1]) {
    // Read from file
    const filepath = args[fileArg + 1];
    try {
      input = await readFile(filepath, "utf-8");
    } catch (error) {
      console.error("Error reading file:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  } else {
    // Read from stdin
    let stdinData = "";
    for await (const chunk of process.stdin) {
      stdinData += chunk;
    }
    input = stdinData;
  }

  if (!input.trim()) {
    console.error("Error: No input provided");
    process.exit(1);
  }

  let sealed: SealedArtifact<unknown>;
  try {
    sealed = JSON.parse(input);
  } catch (error) {
    console.error("Error parsing input as JSON:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // Validate it looks like a SealedArtifact
  if (!sealed.artifact || !sealed.manifest || !sealed.seal) {
    console.error("Error: Input does not appear to be a valid sealed artifact");
    console.error("Expected: { artifact, manifest, seal }");
    process.exit(1);
  }

  try {
    const glyphcard = makeGlyphcard(sealed, { redact: !noRedact });
    console.log(JSON.stringify(glyphcard, null, 2));
  } catch (error) {
    console.error("Error generating glyphcard:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(console.error);