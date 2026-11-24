import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ANCHORS,
  SRB,
  createSeal,
  defaultManifest,
  driftScore,
  guardExport,
  makeGlyphcard,
  recordDrift,
  stableStringify,
  verifySeal,
} from "../src/index.js";

const fixedManifest = () =>
  defaultManifest({ export_time: "2026-11-24T00:00:00.000Z" });

test("SHA-256 seals are deterministic and survive serialization", () => {
  const artifact = { z: 2, a: ["α", null] };
  const sealed = createSeal(artifact, fixedManifest());
  assert.match(sealed.seal.digest, /^[a-f0-9]{64}$/);
  assert.equal(
    sealed.seal.digest,
    createSeal({ a: ["α", null], z: 2 }, fixedManifest()).seal.digest,
  );
  artifact.z = 5;
  assert.equal(sealed.artifact.z, 2);
  assert.equal(verifySeal(JSON.parse(JSON.stringify(sealed))), true);
});

test("verification rejects changes to the artifact, manifest, or seal metadata", () => {
  const sealed = createSeal({ count: 3 }, fixedManifest());
  assert.equal(verifySeal({ ...sealed, artifact: { count: 4 } }), false);
  assert.equal(
    verifySeal({
      ...sealed,
      manifest: { ...sealed.manifest, anchor: "T1_OTHER" },
    }),
    false,
  );
  assert.equal(
    verifySeal({ ...sealed, seal: { ...sealed.seal, algo: "other" } }),
    false,
  );
  assert.equal(
    verifySeal({ ...sealed, seal: { ...sealed.seal, created_at: "" } }),
    false,
  );
  assert.equal(verifySeal({ artifact: 0, seal: sealed.seal }), false);
});

test("serialization rejects unsupported values and permits repeated JSON references", () => {
  const shared = { value: 1 };
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  assert.throws(() => stableStringify(circular), /circular/);
  assert.throws(() => stableStringify({ value: Infinity }), /JSON value/);
  assert.equal(stableStringify([shared, shared]), '[{"value":1},{"value":1}]');
});

test("export policy rejects incomplete strict manifests and uses locked defaults in warn mode", () => {
  assert.throws(
    () => guardExport({}, { policy: "strict" }),
    /requires a manifest/,
  );
  assert.throws(
    () =>
      guardExport(
        {},
        {
          policy: "strict",
          manifest: defaultManifest({
            dlp: { classification: "DLP_L1_OK", context_tag: " " },
          }),
        },
      ),
    /context tag/,
  );
  const guarded = guardExport("example", {
    policy: "warn",
    makeGlyphcard: false,
  });
  assert.equal(guarded.sealed.manifest.dlp.classification, "DLP_L2_LOCKED");
  assert.equal(guarded.warnings.length, 1);
  assert.equal(guarded.glyphcard, undefined);
  assert.deepEqual(guardExport({}, { policy: "off" }).warnings, []);
});

test("glyphcards honor flag overrides and include aggregate byte counts", (t) => {
  const keys = [
    "AURORA_EXPORT_POLICY",
    "AURORA_GLYPHCARDS",
    "AURORA_GLYPHCARD_REDACT",
  ];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  process.env.AURORA_EXPORT_POLICY = "strict";
  process.env.AURORA_GLYPHCARDS = "1";
  process.env.AURORA_GLYPHCARD_REDACT = "0";

  const manifest = fixedManifest();
  const artifact = { report: "秘密" };
  const result = guardExport(artifact, { manifest, redactGlyphcard: true });
  assert.ok(result.glyphcard);
  assert.ok(!("team" in result.glyphcard));
  assert.ok(!JSON.stringify(result.glyphcard).includes(artifact.report));
  assert.equal(
    result.glyphcard.artifact_stats.byte_length,
    Buffer.byteLength(stableStringify(artifact)),
  );
  assert.equal(
    guardExport(artifact, { manifest }).glyphcard?.team,
    manifest.team,
  );
  assert.deepEqual(makeGlyphcard(result.sealed), result.glyphcard);
});

test("drift scoring tracks unique observations and preserves lineage", () => {
  assert.equal(driftScore([]), 0);
  assert.equal(driftScore(["A", "a"]), driftScore(["A"]));
  assert.ok(driftScore(["A", "B"]) > driftScore(["A"]));
  const result = recordDrift({
    source: "test",
    anchor: ANCHORS.CORE,
    observations: ["A"],
  });
  assert.deepEqual(result.probe.srb_tags, [SRB.DRIFT]);
  assert.equal(result.probe.anchor, ANCHORS.CORE);
});

function runScript(
  script: string,
  args: string[],
  input?: string,
  cwd?: string,
) {
  const path = fileURLToPath(
    new URL(`../scripts/${script}.ts`, import.meta.url),
  );
  return spawnSync(
    process.execPath,
    ["--import", import.meta.resolve("tsx"), path, ...args],
    {
      cwd,
      input,
      encoding: "utf8",
    },
  );
}

test("snapshot and glyphcard commands round-trip an artifact from stdin", () => {
  const sealed = runScript("snapshot", ["seal"], "0");
  assert.equal(sealed.status, 0, sealed.stderr);
  const checked = runScript("snapshot", ["verify"], sealed.stdout);
  assert.equal(checked.status, 0, checked.stderr);
  const card = runScript("snapshot", ["glyphcard"], sealed.stdout);
  assert.equal(card.status, 0, card.stderr);
  assert.equal(JSON.parse(card.stdout).artifact_stats.type, "number");
});

test("the index includes tracked token locations without copying source lines", (t) => {
  const root = mkdtempSync(join(tmpdir(), "aurora-index-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(
    join(root, "index.md"),
    "Example with T1_TEST_ANCHOR and SRB_TEST_TAG\n",
  );
  writeFileSync(join(root, "scratch.md"), "T1_UNTRACKED\n");
  assert.equal(spawnSync("git", ["init", "-q"], { cwd: root }).status, 0);
  assert.equal(spawnSync("git", ["add", "index.md"], { cwd: root }).status, 0);
  const indexed = runScript("reliquary-index", [], undefined, root);
  assert.equal(indexed.status, 0, indexed.stderr);
  const output = JSON.parse(indexed.stdout);
  assert.equal(verifySeal(output), true);
  assert.deepEqual(output.artifact.anchors, {
    T1_TEST_ANCHOR: [{ file: "index.md", line: 1 }],
  });
  assert.ok(!indexed.stdout.includes("Example with"));
});
