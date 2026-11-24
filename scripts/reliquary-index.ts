import { execFileSync, spawnSync } from "node:child_process";
import { createSeal, defaultManifest, SRB } from "../src/index.js";

type Reference = { file: string; line: number };

const indexPaths = ["*.ts", "*.js", "*.md"];

function addReference(
  index: Map<string, Reference[]>,
  key: string,
  reference: Reference,
) {
  const references = index.get(key) ?? [];
  references.push(reference);
  index.set(key, references);
}

function collectReferences(output: string) {
  const anchors = new Map<string, Reference[]>();
  const tags = new Map<string, Reference[]>();
  const fields = output.split("\0").values();
  for (let file = fields.next().value; file; ) {
    const line = Number(fields.next().value);
    const match = fields.next().value ?? "";
    const end = match.indexOf("\n");
    if (end < 0 || !Number.isInteger(line)) {
      throw new Error("Unexpected Git reference output");
    }
    const token = match.slice(0, end);
    addReference(token.startsWith("T1_") ? anchors : tags, token, {
      file,
      line,
    });
    file = match.slice(end + 1);
  }
  return {
    anchors: Object.fromEntries(anchors),
    srb_tags: Object.fromEntries(tags),
  };
}

function main() {
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trimEnd();
  const paths = execFileSync("git", ["ls-files", "-z", "--", ...indexPaths], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const scan = spawnSync(
    "git",
    [
      "grep",
      "--cached",
      "-I",
      "-n",
      "-o",
      "-E",
      "-w",
      "-z",
      "-e",
      "(T1|SRB)_[A-Z0-9_]+",
      "--",
      ...indexPaths,
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  if (scan.error) throw scan.error;
  if (scan.status !== 0 && scan.status !== 1) {
    throw new Error("Git could not index symbolic references");
  }
  const manifest = defaultManifest({
    srb_tags: [SRB.CORE, SRB.RELIQUARY],
    dlp: { classification: "DLP_L2_LOCKED", context_tag: "RELIQUARY_INDEX" },
  });
  const sealed = createSeal(
    {
      ...collectReferences(scan.stdout),
      scanned_files: paths.length,
    },
    manifest,
  );
  console.log(JSON.stringify(sealed, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
