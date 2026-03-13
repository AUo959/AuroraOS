import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface ConstellationManifest {
  constellation_version: string;
  node: {
    designation: string;
    symbolic_tag: string;
    repo: string;
    role: string;
    stack: string[];
    description: string;
  };
  health: {
    last_sync: string | null;
    status: string;
  };
}

const CONSTELLATION_NODES = [
  { repo: "aurora-cloudbank-symbolic", designation: "CONSTELLATION-PRIME", role: "hub" },
  { repo: "AuroraOS", designation: "AURORA-RUNTIME", role: "spoke" },
  { repo: "cloudbank-quantum-en", designation: "QUANTUM-VAULT", role: "spoke" },
  { repo: "qgia-knowledge-library", designation: "QGIA-CORPUS", role: "spoke" },
  { repo: "qgia-knowledge-spine", designation: "QGIA-SPINE", role: "spoke" },
  { repo: "zip_wizard", designation: "ZIPWIZ-ENGINE", role: "spoke" },
];

export const constellationStatusTool = createTool({
  id: "constellation-status",
  description:
    "Check the health and status of all Aurora Constellation nodes. Reports which nodes have registered their manifests, their current health status, and connectivity to the hub.",
  inputSchema: z.object({
    node_filter: z
      .string()
      .optional()
      .describe(
        "Filter by node designation (e.g., 'QGIA-CORPUS') or 'all' for all nodes",
      ),
  }),
  outputSchema: z.object({
    constellation_version: z.string(),
    checked_at: z.string(),
    nodes: z.array(
      z.object({
        designation: z.string(),
        repo: z.string(),
        role: z.string(),
        status: z.string(),
        manifest_present: z.boolean(),
        description: z.string(),
        stack: z.array(z.string()),
        last_sync: z.string().nullable(),
      }),
    ),
    summary: z.object({
      total_nodes: z.number(),
      active_nodes: z.number(),
      initializing_nodes: z.number(),
      unreachable_nodes: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    const filter = context.node_filter;
    const nodesToCheck =
      filter && filter !== "all"
        ? CONSTELLATION_NODES.filter((n) => n.designation === filter || n.repo === filter)
        : CONSTELLATION_NODES;

    const results = await Promise.all(
      nodesToCheck.map(async (node) => {
        try {
          const url = `https://raw.githubusercontent.com/AUo959/${node.repo}/main/.aurora/constellation.json`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const manifest: ConstellationManifest = await response.json();
          return {
            designation: manifest.node.designation,
            repo: node.repo,
            role: manifest.node.role,
            status: manifest.health.status,
            manifest_present: true,
            description: manifest.node.description,
            stack: manifest.node.stack,
            last_sync: manifest.health.last_sync,
          };
        } catch {
          return {
            designation: node.designation,
            repo: node.repo,
            role: node.role,
            status: "unreachable",
            manifest_present: false,
            description: "Manifest not found or unreachable",
            stack: [] as string[],
            last_sync: null,
          };
        }
      }),
    );

    const active = results.filter((r) => r.status === "active").length;
    const initializing = results.filter((r) => r.status === "initializing").length;
    const unreachable = results.filter((r) => r.status === "unreachable").length;

    return {
      constellation_version: "1.0.0-alpha",
      checked_at: new Date().toISOString(),
      nodes: results,
      summary: {
        total_nodes: results.length,
        active_nodes: active,
        initializing_nodes: initializing,
        unreachable_nodes: unreachable,
      },
    };
  },
});
