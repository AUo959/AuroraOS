/**
 * SRB: AURORA_CORE | T1
 * Tests for drift scoring and monitoring functionality.
 */
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";
import { driftScore, recordDrift, type DriftProbe } from "../src/symbolic/drift.js";

describe("Drift Tests", () => {
  test("driftScore monotonicity - more observations increase score", () => {
    const observations1 = ["observation1"];
    const observations2 = ["observation1", "observation2"];
    const observations3 = ["observation1", "observation2", "observation3"];
    
    const score1 = driftScore(observations1);
    const score2 = driftScore(observations2);
    const score3 = driftScore(observations3);
    
    assert(score1 <= score2, "Score should increase with more observations");
    assert(score2 <= score3, "Score should continue to increase");
  });

  test("driftScore handles duplicate observations", () => {
    const unique = ["obs1", "obs2", "obs3"];
    const duplicates = ["obs1", "obs1", "obs2", "obs2", "obs3", "obs3"];
    
    const uniqueScore = driftScore(unique);
    const duplicateScore = driftScore(duplicates);
    
    assert.equal(uniqueScore, duplicateScore, "Duplicate observations should not increase score");
  });

  test("driftScore case insensitive", () => {
    const mixed = ["Observation", "OBSERVATION", "observation"];
    const lowercase = ["observation"];
    
    const mixedScore = driftScore(mixed);
    const lowercaseScore = driftScore(lowercase);
    
    assert.equal(mixedScore, lowercaseScore, "Should be case insensitive");
  });

  test("driftScore bounded between 0 and 1", () => {
    const empty: string[] = [];
    const many = Array.from({ length: 1000 }, (_, i) => `obs${i}`);
    
    const emptyScore = driftScore(empty);
    const manyScore = driftScore(many);
    
    assert(emptyScore >= 0, "Score should not be negative");
    assert(emptyScore <= 1, "Score should not exceed 1");
    assert(manyScore >= 0, "Score should not be negative");
    assert(manyScore <= 1, "Score should not exceed 1");
  });

  test("recordDrift adds timestamp when missing", () => {
    const probe: DriftProbe = {
      source: "test",
      anchor: "T1_TEST",
      observations: ["test observation"]
    };
    
    const result = recordDrift(probe);
    
    assert(result.probe.timestamp, "Should add timestamp");
    assert(result.probe.timestamp.includes("T"), "Should be ISO timestamp");
  });

  test("recordDrift preserves existing timestamp", () => {
    const timestamp = "2023-01-01T00:00:00.000Z";
    const probe: DriftProbe = {
      source: "test",
      anchor: "T1_TEST",
      timestamp,
      observations: ["test observation"]
    };
    
    const result = recordDrift(probe);
    
    assert.equal(result.probe.timestamp, timestamp, "Should preserve existing timestamp");
  });

  test("recordDrift adds default SRB tags", () => {
    const probe: DriftProbe = {
      source: "test",
      anchor: "T1_TEST", 
      observations: ["test observation"]
    };
    
    const result = recordDrift(probe);
    
    assert(result.probe.srb_tags, "Should have SRB tags");
    assert(result.probe.srb_tags!.includes("SRB_DRIFT_PROBE"), "Should include default SRB tag");
  });

  test("recordDrift preserves existing SRB tags", () => {
    const customTags = ["SRB_CUSTOM", "SRB_TEST"];
    const probe: DriftProbe = {
      source: "test",
      anchor: "T1_TEST",
      srb_tags: customTags,
      observations: ["test observation"]
    };
    
    const result = recordDrift(probe);
    
    assert.deepEqual(result.probe.srb_tags, customTags, "Should preserve existing SRB tags");
  });

  test("recordDrift returns score and probe", () => {
    const probe: DriftProbe = {
      source: "mastra:agent:planner",
      anchor: "T1_AURORA_CORE",
      observations: ["action1", "action2", "action3"]
    };
    
    const result = recordDrift(probe);
    
    assert(typeof result.score === "number", "Should return numeric score");
    assert(result.score >= 0 && result.score <= 1, "Score should be bounded");
    assert.equal(result.probe.source, probe.source, "Should return stamped probe");
    assert.equal(result.probe.anchor, probe.anchor, "Should preserve anchor");
    assert.deepEqual(result.probe.observations, probe.observations, "Should preserve observations");
  });

  test("driftScore empty observations", () => {
    const score = driftScore([]);
    assert.equal(score, 0, "Empty observations should have score 0");
  });
});