/**
 * Demonstrate export guard policy levels
 */

import { guardExport } from "./dist/symbolic/export-guard.js";
import { defaultManifest } from "./dist/symbolic/manifest.js";
import { ANCHORS } from "./dist/symbolic/anchors.js";

const testData = { sensitive: "data", level: "test" };

console.log("=== Export Guard Policy Demonstration ===\n");

// Test "off" policy
console.log("1. Policy: OFF (no validation)");
try {
  const result = await guardExport(testData, { policy: "off" });
  console.log("   ✓ Success - no warnings:", result.warnings.length === 0);
  console.log("   ✓ Sealed:", !!result.sealed);
} catch (error) {
  console.log("   ❌ Error:", error.message);
}

console.log("\n" + "-".repeat(40) + "\n");

// Test "warn" policy (default)
console.log("2. Policy: WARN (validation with warnings)");
try {
  const result = await guardExport(testData, { policy: "warn" });
  console.log("   ✓ Success with warnings:", result.warnings.length);
  console.log("   ✓ Warning:", result.warnings[0]);
  console.log("   ✓ Auto-attached manifest");
} catch (error) {
  console.log("   ❌ Error:", error.message);
}

console.log("\n" + "-".repeat(40) + "\n");

// Test "strict" policy without manifest (should fail)
console.log("3. Policy: STRICT without manifest (should fail)");
try {
  const result = await guardExport(testData, { policy: "strict" });
  console.log("   ❌ Unexpected success");
} catch (error) {
  console.log("   ✓ Expected error:", error.message);
}

console.log("\n" + "-".repeat(40) + "\n");

// Test "strict" policy with manifest (should succeed)
console.log("4. Policy: STRICT with valid manifest");
try {
  const manifest = defaultManifest({ anchor: ANCHORS.SECURITY });
  const result = await guardExport(testData, { 
    policy: "strict", 
    manifest: manifest 
  });
  console.log("   ✓ Success - no warnings:", result.warnings.length === 0);
  console.log("   ✓ Used provided manifest with anchor:", result.sealed.manifest.anchor);
} catch (error) {
  console.log("   ❌ Error:", error.message);
}

console.log("\n" + "-".repeat(40) + "\n");

// Test with incomplete manifest in strict mode
console.log("5. Policy: STRICT with incomplete manifest");
try {
  const incompleteManifest = {
    version: "1.0.0",
    anchor: ANCHORS.CORE,
    ethics_protocol: "Picard_Delta_3",
    srb_tags: ["SRB_AURORA_CORE"],
    dlp: {
      classification: "DLP_L1_OK"
      // missing context_tag
    },
    team: "AuroraOS",
    export_time: new Date().toISOString()
  };
  
  const result = await guardExport(testData, { 
    policy: "strict", 
    manifest: incompleteManifest 
  });
  console.log("   ❌ Unexpected success");
} catch (error) {
  console.log("   ✓ Expected error for incomplete manifest:", error.message);
}

console.log("\n=== Policy demonstration complete ===");