import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import {
  createSeal,
  defaultManifest,
  makeGlyphcard,
  verifySeal,
} from "../src/index.js";

function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      file: { type: "string" },
      anchor: { type: "string" },
      "no-redact": { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });
  const [command] = positionals;
  if (values.help) {
    console.log(
      "Usage: snapshot <seal|verify|glyphcard> [--file <path>] [--anchor <id>] [--no-redact]",
    );
    return;
  }
  if (
    positionals.length !== 1 ||
    !["seal", "verify", "glyphcard"].includes(command)
  ) {
    throw new Error("Specify seal, verify, or glyphcard");
  }

  const input: unknown = JSON.parse(readFileSync(values.file ?? 0, "utf8"));
  if (command === "seal") {
    const manifest = defaultManifest();
    manifest.anchor = values.anchor ?? manifest.anchor;
    console.log(JSON.stringify(createSeal(input, manifest), null, 2));
    return;
  }
  if (!verifySeal(input)) {
    throw new Error("Seal verification failed");
  }
  if (command === "glyphcard") {
    console.log(
      JSON.stringify(
        makeGlyphcard(input, { redact: !values["no-redact"] }),
        null,
        2,
      ),
    );
  } else {
    console.log(`SHA256 verified: ${input.seal.digest}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
