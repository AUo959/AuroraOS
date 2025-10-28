#!/usr/bin/env node
/**
 * SRB: AURORA_CORE | T1
 * Snapshot utility with optional glyphcard generation.
 * Usage: npm run snapshot [--glyphcard] [data]
 */

import { guardExport } from "../src/symbolic/export-guard.js";

async function main() {
  const args = process.argv.slice(2);
  const wantGlyphcard = args.includes("--glyphcard");
  const dataArg = args.find(arg => !arg.startsWith("--"));

  let artifact: unknown;
  
  if (dataArg) {
    try {
      artifact = JSON.parse(dataArg);
    } catch {
      artifact = dataArg; // treat as string if not valid JSON
    }
  } else {
    // Read from stdin
    let input = "";
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    
    if (!input.trim()) {
      artifact = { snapshot: "empty", timestamp: new Date().toISOString() };
    } else {
      try {
        artifact = JSON.parse(input);
      } catch {
        artifact = input.trim();
      }
    }
  }

  try {
    const result = await guardExport(artifact, {
      makeGlyphcard: wantGlyphcard,
      source: "snapshot-cli"
    });

    if (wantGlyphcard && result.glyphcard) {
      console.log(JSON.stringify({
        sealed: result.sealed,
        glyphcard: result.glyphcard
      }, null, 2));
    } else {
      console.log(JSON.stringify(result.sealed, null, 2));
    }

    if (result.warnings.length > 0) {
      console.error("Warnings:", result.warnings.join(", "));
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(console.error);