/**
 * SRB: AURORA_CORE | T1
 * Tests for sealing and verification functionality.
 */
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { createSeal, verifySeal, stableStringify } from "../src/symbolic/seal.js";
import { defaultManifest } from "../src/symbolic/manifest.js";

describe("Seal Tests", () => {
  test("stableStringify produces consistent output", () => {
    const obj1 = { b: 2, a: 1, c: { z: 26, y: 25 } };
    const obj2 = { a: 1, b: 2, c: { y: 25, z: 26 } };
    
    const str1 = stableStringify(obj1);
    const str2 = stableStringify(obj2);
    
    assert.equal(str1, str2, "Objects with same content should stringify identically");
  });

  test("stableStringify handles arrays", () => {
    const obj1 = { items: [3, 1, 2] };
    const obj2 = { items: [3, 1, 2] };
    
    const str1 = stableStringify(obj1);
    const str2 = stableStringify(obj2);
    
    assert.equal(str1, str2, "Arrays should maintain order");
  });

  test("stableStringify handles circular references", () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    
    const result = stableStringify(obj);
    assert(result.includes("[Circular]"), "Should handle circular references");
  });

  test("createSeal generates stable digest", async () => {
    const artifact = { message: "test", value: 42 };
    const manifest = defaultManifest({ anchor: "T1_TEST" });
    
    const sealed1 = await createSeal(artifact, manifest);
    const sealed2 = await createSeal(artifact, manifest);
    
    // Digests should be the same for same content
    assert.equal(sealed1.seal.digest, sealed2.seal.digest, "Digests should be stable");
    assert.equal(sealed1.seal.algo, "SHA256", "Should use SHA256");
    assert(sealed1.seal.created_at, "Should have creation timestamp");
  });

  test("verifySeal detects tampering", async () => {
    const artifact = { secret: "original" };
    const manifest = defaultManifest({ anchor: "T1_TEST" });
    
    const sealed = await createSeal(artifact, manifest);
    
    // Original should verify
    assert.equal(await verifySeal(sealed), true, "Original seal should verify");
    
    // Tampered artifact should fail
    const tampered = { ...sealed, artifact: { secret: "modified" } };
    assert.equal(await verifySeal(tampered), false, "Tampered artifact should fail verification");
    
    // Tampered manifest should fail
    const tamperedManifest = { 
      ...sealed, 
      manifest: { ...sealed.manifest, anchor: "T1_EVIL" } 
    };
    assert.equal(await verifySeal(tamperedManifest), false, "Tampered manifest should fail verification");
  });

  test("verifySeal handles missing seal", async () => {
    const artifact = { data: "test" };
    const manifest = defaultManifest({ anchor: "T1_TEST" });
    delete manifest.seal;
    
    const unsealed = { artifact, manifest, seal: undefined as any };
    assert.equal(await verifySeal(unsealed), false, "Unsealed artifact should fail verification");
  });

  test("seal contains required fields", async () => {
    const artifact = { test: true };
    const manifest = defaultManifest({ anchor: "T1_TEST" });
    
    const sealed = await createSeal(artifact, manifest);
    
    assert(sealed.manifest.seal, "Should have seal in manifest");
    assert.equal(sealed.manifest.seal.algo, "SHA256", "Should specify algorithm");
    assert(sealed.manifest.seal.digest.length === 64, "SHA256 digest should be 64 hex chars");
    assert(sealed.manifest.seal.created_at, "Should have creation timestamp");
    assert.equal(sealed.artifact, artifact, "Should preserve original artifact");
  });
});