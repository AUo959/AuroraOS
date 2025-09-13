/**
 * SRB: AURORA_CORE | T1
 * Tests for export guard functionality.
 */

import { guardExport, type ExportPolicy } from "../src/symbolic/export-guard.js";
import { defaultManifest } from "../src/symbolic/manifest.js";
import { ANCHORS } from "../src/symbolic/anchors.js";

// Simple test framework
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function testExportGuardPolicyOff() {
  const artifact = { test: "data" };
  const result = await guardExport(artifact, { policy: "off" });
  
  assert(result.sealed.artifact === artifact, "Artifact should be preserved");
  assert(result.warnings.length >= 0, "Should have warnings array");
  assert(!result.glyphcard, "Should not have glyphcard by default");
  console.log("✓ Policy 'off' test passed");
}

async function testExportGuardPolicyWarn() {
  const artifact = { test: "data" };
  const result = await guardExport(artifact, { policy: "warn" });
  
  assert(result.sealed.artifact === artifact, "Artifact should be preserved");
  assert(result.warnings.length > 0, "Should have warnings for missing manifest");
  assert(result.warnings[0].includes("Manifest missing"), "Should warn about missing manifest");
  console.log("✓ Policy 'warn' test passed");
}

async function testExportGuardPolicyStrict() {
  const artifact = { test: "data" };
  
  try {
    await guardExport(artifact, { policy: "strict" });
    assert(false, "Should throw for missing manifest in strict mode");
  } catch (error) {
    assert(error instanceof Error, "Should throw Error");
    assert(error.message.includes("strict policy requires a manifest"), "Should mention manifest requirement");
  }
  console.log("✓ Policy 'strict' test passed");
}

async function testExportGuardWithManifest() {
  const artifact = { test: "data" };
  const manifest = defaultManifest({ anchor: ANCHORS.EXPORT });
  const result = await guardExport(artifact, { policy: "strict", manifest });
  
  assert(result.sealed.artifact === artifact, "Artifact should be preserved");
  assert(result.sealed.manifest === manifest, "Manifest should be preserved");
  assert(result.warnings.length === 0, "Should have no warnings with valid manifest");
  assert(typeof result.sealed.seal.digest === "string", "Should have seal digest");
  console.log("✓ Manifest test passed");
}

async function testExportGuardWithGlyphcard() {
  const artifact = { test: "data", number: 42 };
  const result = await guardExport(artifact, { 
    policy: "warn", 
    makeGlyphcard: true 
  });
  
  assert(result.glyphcard, "Should have glyphcard when requested");
  assert(result.glyphcard.title === "Glyphcard", "Should have correct title");
  assert(result.glyphcard.digest === result.sealed.seal.digest, "Should have matching digest");
  assert(result.glyphcard.redacted === true, "Should be redacted by default");
  console.log("✓ Glyphcard generation test passed");
}

async function testManifestAutoAttach() {
  const artifact = { test: "data" };
  const result = await guardExport(artifact, { policy: "warn" });
  
  assert(result.sealed.manifest.anchor === ANCHORS.CORE, "Should use default anchor");
  assert(result.sealed.manifest.ethics_protocol === "Picard_Delta_3", "Should use default ethics protocol");
  assert(result.sealed.manifest.dlp.classification === "DLP_L1_OK", "Should use default DLP classification");
  console.log("✓ Manifest auto-attach test passed");
}

// Run tests
async function runTests() {
  console.log("Running export guard tests...\n");
  
  try {
    await testExportGuardPolicyOff();
    await testExportGuardPolicyWarn();
    await testExportGuardPolicyStrict();
    await testExportGuardWithManifest();
    await testExportGuardWithGlyphcard();
    await testManifestAutoAttach();
    
    console.log("\n✅ All export guard tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}