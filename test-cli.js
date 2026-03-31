/**
 * Simple CLI test for snapshot functionality
 */

import { guardExport } from "./dist/symbolic/export-guard.js";

const testData = { test: "snapshot data", timestamp: new Date().toISOString() };

console.log("Testing snapshot functionality...\n");

// Test default behavior
console.log("1. Default snapshot (no glyphcard):");
const result1 = await guardExport(testData, { policy: "warn" });
console.log(JSON.stringify(result1.sealed, null, 2));

console.log("\n" + "=".repeat(50) + "\n");

// Test with glyphcard
console.log("2. Snapshot with glyphcard:");
const result2 = await guardExport(testData, { 
  policy: "warn", 
  makeGlyphcard: true 
});

const output = {
  sealed: result2.sealed,
  glyphcard: result2.glyphcard
};

console.log(JSON.stringify(output, null, 2));