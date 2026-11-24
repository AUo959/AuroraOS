import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { createSeal, defaultManifest, SRB } from "../src/index.js";

type Reference = { file: string; line: number };

function addReference(
  index: Map<string, Reference[]>,
  key: string,
  reference: Reference,
) {
  const references = index.get(key) ?? [];
  references.push(reference);
  index.set(key, references);
}

function main() {
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trimEnd();
  const paths = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  }).split("\0");
  const extensions = new Set([".ts", ".js", ".md"]);
  const anchors = new Map<string, Reference[]>();
  const tags = new Map<string, Reference[]>();
  let scannedFiles = 0;

  for (const file of paths) {
    if (!extensions.has(extname(file))) continue;
    const path = join(root, file);
    if (!lstatSync(path, { throwIfNoEntry: false })?.isFile()) continue;
    scannedFiles += 1;
    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      for (const token of new Set(line.match(/\b(?:T1|SRB)_[A-Z0-9_]+\b/g))) {
        addReference(token.startsWith("T1_") ? anchors : tags, token, {
          file,
          line: index + 1,
        });
      }
    }
  }

  const manifest = defaultManifest({
    srb_tags: [SRB.CORE, SRB.RELIQUARY],
    dlp: { classification: "DLP_L2_LOCKED", context_tag: "RELIQUARY_INDEX" },
  });
  const sealed = createSeal(
    {
      anchors: Object.fromEntries(anchors),
      srb_tags: Object.fromEntries(tags),
      scanned_files: scannedFiles,
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
