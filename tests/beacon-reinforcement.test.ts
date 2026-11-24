import assert from "node:assert/strict";
import { test } from "node:test";
import { RuntimeContext } from "@mastra/core/runtime-context";
import {
  BEACON_REINFORCEMENT_PROTOCOL,
  reinforceBeaconPulseStability,
} from "../src/mastra/tools/beaconReinforcement.js";
import { symbolicCognitionTool } from "../src/mastra/tools/symbolicCognitionTool.js";

test("reinforces lower stability and preserves already saturated beacons", () => {
  const input = "align the relay fields";
  const low = reinforceBeaconPulseStability(0.85, input);
  const high = reinforceBeaconPulseStability(0.98, input);
  assert.ok(low.stability > 0.85);
  assert.ok(high.stability > 0.98);
  assert.ok(low.stability - 0.85 > high.stability - 0.98);
  assert.equal(reinforceBeaconPulseStability(0.9998, input).stability, 0.9999);
  assert.equal(reinforceBeaconPulseStability(1, input).stability, 1);
});

test("uses a deterministic pattern without embedding input text", () => {
  const input = "test signal";
  const one = reinforceBeaconPulseStability(0.85, input);
  assert.match(one.pattern, /^RNF_[0-9a-f]{12}$/);
  assert.deepEqual(one, reinforceBeaconPulseStability(0.85, input));
  assert.notEqual(
    one.pattern,
    reinforceBeaconPulseStability(0.85, "another signal").pattern,
  );
});

test("dispatches the new operation and exposes the beacon and anchor updates", async () => {
  const { execute, inputSchema, outputSchema } = symbolicCognitionTool;
  const context = inputSchema.parse({
    input: "test signal",
    operation: "reinforce_beacon_pulse",
  });
  const result = outputSchema.parse(
    await execute({
      context,
      runtimeContext: new RuntimeContext(),
      tracingContext: {},
    }),
  );
  const reinforcement = result.beaconReinforcement;
  assert.ok(reinforcement);
  assert.equal(reinforcement.protocol, BEACON_REINFORCEMENT_PROTOCOL);
  assert.equal(reinforcement.previousStability, 0.997);
  assert.equal(reinforcement.stability, 0.9999);
  assert.equal(reinforcement.anchors.length, 3);
  assert.ok(reinforcement.anchors.every(({ stability }) => stability <= 1));
  assert.ok(result.fieldReport.includes(reinforcement.pattern));
});

test("keeps the existing beacon pulse operation available", async () => {
  const { execute, inputSchema, outputSchema } = symbolicCognitionTool;
  const context = inputSchema.parse({
    input: "test signal",
    operation: "beacon_pulse",
  });
  const result = outputSchema.parse(
    await execute({
      context,
      runtimeContext: new RuntimeContext(),
      tracingContext: {},
    }),
  );
  assert.match(result.symbolicOutput, /^BEACON_PULSE_ENHANCEMENT/);
  assert.equal(result.beaconReinforcement, undefined);
});
