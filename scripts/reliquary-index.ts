#!/usr/bin/env tsx
/**
 * SRB: AURORA_CORE | T1
 * Index T1 and SRB tags across repo and output a sealed index.
 * Usage: npm run reliquary:index
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { createSeal } from "../src/symbolic/seal.js";
import { defaultManifest } from "../src/symbolic/manifest.js";

interface AnchorMatch {
  file: string;
  line: number;
  content: string;
  type: "T1_ANCHOR" | "SRB_TAG";
  value: string;
}

function scanFile(filePath: string): AnchorMatch[] {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const matches: AnchorMatch[] = [];
    
    lines.forEach((line, index) => {
      // Look for T1 anchors
      const t1Match = line.match(/T1_[A-Z_]+/g);
      if (t1Match) {
        t1Match.forEach((anchor) => {
          matches.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            type: "T1_ANCHOR",
            value: anchor
          });
        });
      }
      
      // Look for SRB tags
      const srbMatch = line.match(/SRB_[A-Z_]+/g);
      if (srbMatch) {
        srbMatch.forEach((tag) => {
          matches.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            type: "SRB_TAG",
            value: tag
          });
        });
      }
    });
    
    return matches;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dirPath: string, extensions: string[] = [".ts", ".js", ".md"]): AnchorMatch[] {
  const matches: AnchorMatch[] = [];
  
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (entry === "node_modules" || entry === ".git" || entry.startsWith(".")) {
          continue;
        }
        matches.push(...scanDirectory(fullPath, extensions));
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (extensions.includes(ext)) {
          matches.push(...scanFile(fullPath));
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return matches;
}

async function main() {
  const repoRoot = process.cwd();
  console.error("Scanning repository for T1 anchors and SRB tags...");
  
  const matches = scanDirectory(repoRoot);
  
  // Group by type and value
  const anchors = new Map<string, AnchorMatch[]>();
  const srbTags = new Map<string, AnchorMatch[]>();
  
  matches.forEach((match) => {
    if (match.type === "T1_ANCHOR") {
      if (!anchors.has(match.value)) {
        anchors.set(match.value, []);
      }
      anchors.get(match.value)!.push(match);
    } else {
      if (!srbTags.has(match.value)) {
        srbTags.set(match.value, []);
      }
      srbTags.get(match.value)!.push(match);
    }
  });
  
  const index = {
    scan_time: new Date().toISOString(),
    repository: repoRoot,
    anchors: Object.fromEntries(anchors),
    srb_tags: Object.fromEntries(srbTags),
    total_files_scanned: new Set(matches.map(m => m.file)).size,
    total_matches: matches.length
  };
  
  console.error(`Found ${anchors.size} unique anchors and ${srbTags.size} unique SRB tags`);
  console.error(`Total matches: ${matches.length} across ${index.total_files_scanned} files`);
  
  // Seal the index
  const manifest = defaultManifest({ 
    anchor: "T1_AURORA_CORE",
    srb_tags: ["SRB_AURORA_CORE", "SRB_RELIQUARY_INDEX"],
    dlp: { classification: "DLP_L1_OK", context_tag: "RELIQUARY_INDEX" }
  });
  
  const sealed = await createSeal(index, manifest);
  console.log(JSON.stringify(sealed, null, 2));
}

main().catch(console.error);