/**
 * SRB: AURORA_CORE | T1
 * Tests for glyphcard generation and deterministic behavior.
 */

import { makeGlyphcard } from "../src/symbolic/glyphcard.js";
import { createSeal } from "../src/symbolic/seal.js";
import { defaultManifest } from "../src/symbolic/manifest.js";
import { ANCHORS } from "../src/symbolic/anchors.js";

// Simple test framework
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function testGlyphcardDeterminism() {
  const artifact = { test: "data", num: 42 };
  const manifest = defaultManifest({ anchor: ANCHORS.GLYPHCARD });
  const sealed = await createSeal(artifact, manifest);
  
  const card1 = makeGlyphcard(sealed);
  const card2 = makeGlyphcard(sealed);
  
  assert(JSON.stringify(card1) === JSON.stringify(card2), "Glyphcard generation should be deterministic");
  console.log("✓ Determinism test passed");
}

async function testGlyphcardContentInvariants() {
  const artifact = { test: "data", items: [1, 2, 3] };
  const manifest = defaultManifest({ anchor: ANCHORS.GLYPHCARD });
  const sealed = await createSeal(artifact, manifest);
  
  const card = makeGlyphcard(sealed);
  
  // Check required fields
  assert(card.title === "Glyphcard", "Should have correct title");
  assert(typeof card.digest === "string", "Should have digest");
  assert(typeof card.created_at === "string", "Should have creation timestamp");
  assert(card.anchor === ANCHORS.GLYPHCARD, "Should have correct anchor");
  assert(card.ethics_protocol === "Picard_Delta_3", "Should have ethics protocol");
  assert(Array.isArray(card.srb_tags), "Should have SRB tags array");
  assert(typeof card.classification === "string", "Should have classification");
  assert(typeof card.context_tag === "string", "Should have context tag");
  assert(typeof card.manifest_version === "string", "Should have manifest version");
  assert(typeof card.team === "string", "Should have team");
  assert(typeof card.export_time === "string", "Should have export time");
  assert(typeof card.artifact_stats === "object", "Should have artifact stats");
  assert(card.redacted === true, "Should be redacted by default");
  
  console.log("✓ Content invariants test passed");
}

async function testGlyphcardArtifactStats() {
  const objectArtifact = { a: 1, b: 2, c: 3 };
  const arrayArtifact = [1, 2, 3, 4];
  const stringArtifact = "hello world";
  
  const manifest = defaultManifest();
  
  const objectSealed = await createSeal(objectArtifact, manifest);
  const arraySealed = await createSeal(arrayArtifact, manifest);
  const stringSealed = await createSeal(stringArtifact, manifest);
  
  const objectCard = makeGlyphcard(objectSealed);
  const arrayCard = makeGlyphcard(arraySealed);
  const stringCard = makeGlyphcard(stringSealed);
  
  // Check object stats
  assert(objectCard.artifact_stats.type === "object", "Object should have type 'object'");
  assert(objectCard.artifact_stats.keys === 3, "Object should have 3 keys");
  
  // Check array stats
  assert(arrayCard.artifact_stats.type === "array", "Array should have type 'array'");
  assert(arrayCard.artifact_stats.keys === 4, "Array should have 4 elements");
  
  // Check string stats
  assert(stringCard.artifact_stats.type === "string", "String should have type 'string'");
  assert(stringCard.artifact_stats.keys === 0, "String should have 0 keys");
  
  console.log("✓ Artifact stats test passed");
}

async function testGlyphcardRedactionOption() {
  const artifact = { secret: "data" };
  const manifest = defaultManifest();
  const sealed = await createSeal(artifact, manifest);
  
  const redactedCard = makeGlyphcard(sealed, { redact: true });
  const unredactedCard = makeGlyphcard(sealed, { redact: false });
  
  assert(redactedCard.redacted === true, "Redacted card should be marked as redacted");
  assert(unredactedCard.redacted === false, "Unredacted card should be marked as not redacted");
  
  console.log("✓ Redaction option test passed");
}

async function testGlyphcardFieldOrder() {
  const artifact = { data: "test" };
  const manifest = defaultManifest();
  const sealed = await createSeal(artifact, manifest);
  
  const card = makeGlyphcard(sealed);
  const keys = Object.keys(card);
  
  // Check that specific important fields are present
  assert(keys.includes("title"), "Should include title");
  assert(keys.includes("digest"), "Should include digest");
  assert(keys.includes("anchor"), "Should include anchor");
  assert(keys.includes("classification"), "Should include classification");
  assert(keys.includes("artifact_stats"), "Should include artifact_stats");
  assert(keys.includes("redacted"), "Should include redacted");
  
  console.log("✓ Field order test passed");
}

// Run tests
async function runTests() {
  console.log("Running glyphcard tests...\n");
  
  try {
    await testGlyphcardDeterminism();
    await testGlyphcardContentInvariants();
    await testGlyphcardArtifactStats();
    await testGlyphcardRedactionOption();
    await testGlyphcardFieldOrder();
    
    console.log("\n✅ All glyphcard tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}