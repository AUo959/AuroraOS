/**
 * Simple test of the symbolic modules functionality.
 */

import { guardExport } from "./src/symbolic/export-guard.js";
import { makeGlyphcard } from "./src/symbolic/glyphcard.js";
import { createSeal } from "./src/symbolic/seal.js";
import { defaultManifest } from "./src/symbolic/manifest.js";

// Test basic functionality
async function testBasicFunctionality() {
  const artifact = { test: "data", number: 42 };
  
  // Test export guard
  const result = await guardExport(artifact, { 
    policy: "warn",
    makeGlyphcard: true 
  });
  
  // Basic assertions
  if (!result.sealed) throw new Error("No sealed artifact");
  if (!result.sealed.artifact) throw new Error("No artifact in seal");
  if (!result.sealed.manifest) throw new Error("No manifest in seal");
  if (!result.sealed.seal) throw new Error("No seal info");
  if (!result.glyphcard) throw new Error("No glyphcard generated");
  
  // Test manual seal and glyphcard
  const manifest = defaultManifest();
  const sealed = await createSeal(artifact, manifest);
  const glyphcard = makeGlyphcard(sealed);
  
  if (!glyphcard.title) throw new Error("Glyphcard missing title");
  if (glyphcard.title !== "Glyphcard") throw new Error("Wrong glyphcard title");
  if (!glyphcard.digest) throw new Error("Glyphcard missing digest");
  if (glyphcard.redacted !== true) throw new Error("Glyphcard not redacted by default");
  
  return "✅ All basic functionality tests passed!";
}

// Export the test for external execution
export { testBasicFunctionality };