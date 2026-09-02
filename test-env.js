/**
 * Test environment variable simulation for feature flags
 */

import { guardExport } from "./dist/symbolic/export-guard.js";

// Simulate environment variables using globalThis
const originalEnv = globalThis.process?.env || {};

function setTestEnv(vars) {
  globalThis.process = {
    env: { ...originalEnv, ...vars }
  };
}

function restoreEnv() {
  globalThis.process = { env: originalEnv };
}

const testData = { test: "env test" };

console.log("=== Environment Variable Feature Flags Demo ===\n");

// Test 1: Default behavior (no env vars)
console.log("1. Default behavior (no env vars set):");
setTestEnv({});
const result1 = await guardExport(testData);
console.log("   Policy used: warn (default)");
console.log("   Glyphcard generated:", !!result1.glyphcard);

console.log("\n" + "-".repeat(40) + "\n");

// Test 2: AURORA_EXPORT_POLICY=off
console.log("2. AURORA_EXPORT_POLICY=off:");
setTestEnv({ AURORA_EXPORT_POLICY: "off" });
const result2 = await guardExport(testData);
console.log("   Warnings:", result2.warnings.length);
console.log("   Should have no warnings with 'off' policy");

console.log("\n" + "-".repeat(40) + "\n");

// Test 3: AURORA_EXPORT_POLICY=strict (should fail without manifest)
console.log("3. AURORA_EXPORT_POLICY=strict (should fail):");
setTestEnv({ AURORA_EXPORT_POLICY: "strict" });
try {
  const result3 = await guardExport(testData);
  console.log("   ❌ Unexpected success");
} catch (error) {
  console.log("   ✓ Expected failure:", error.message);
}

console.log("\n" + "-".repeat(40) + "\n");

// Test 4: AURORA_GLYPHCARDS=1 (enable glyphcard generation)
console.log("4. AURORA_GLYPHCARDS=1 (enable glyphcard):");
setTestEnv({ 
  AURORA_EXPORT_POLICY: "warn",
  AURORA_GLYPHCARDS: "1" 
});
const result4 = await guardExport(testData);
console.log("   Glyphcard automatically generated:", !!result4.glyphcard);
console.log("   Glyphcard redacted:", result4.glyphcard?.redacted);

console.log("\n" + "-".repeat(40) + "\n");

// Test 5: AURORA_GLYPHCARD_REDACT=0 (disable redaction)
console.log("5. AURORA_GLYPHCARD_REDACT=0 (disable redaction):");
setTestEnv({ 
  AURORA_EXPORT_POLICY: "warn",
  AURORA_GLYPHCARDS: "1",
  AURORA_GLYPHCARD_REDACT: "0"
});
const result5 = await guardExport(testData);
console.log("   Glyphcard generated:", !!result5.glyphcard);
console.log("   Glyphcard redacted:", result5.glyphcard?.redacted);

console.log("\n" + "-".repeat(40) + "\n");

// Test 6: Override env with explicit options
console.log("6. Override env vars with explicit options:");
setTestEnv({ 
  AURORA_EXPORT_POLICY: "off",  // env says 'off'
  AURORA_GLYPHCARDS: "0"        // env says 'no glyphcard'
});
const result6 = await guardExport(testData, {
  policy: "warn",               // but we override to 'warn'
  makeGlyphcard: true          // and force glyphcard
});
console.log("   Policy override worked: has warnings =", result6.warnings.length > 0);
console.log("   Glyphcard override worked:", !!result6.glyphcard);

// Restore environment
restoreEnv();

console.log("\n=== Feature flags demonstration complete ===");