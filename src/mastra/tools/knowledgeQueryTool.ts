import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface KnowledgeDocument {
  id: string;
  title: string;
  domain: string;
  path: string;
  checksum: string;
  word_count: number;
  last_modified: string;
  tags: string[];
  summary: string;
}

interface KnowledgeIndex {
  version: string;
  source_repo: string;
  generated_at: string;
  documents: KnowledgeDocument[];
}

const KNOWLEDGE_INDEX_URLS = [
  "https://raw.githubusercontent.com/AUo959/aurora-cloudbank-symbolic/main/knowledge-indexes/aggregated-knowledge-index.json",
  "https://raw.githubusercontent.com/AUo959/qgia-knowledge-library/main/.aurora/knowledge-index.json",
  "https://raw.githubusercontent.com/AUo959/qgia-knowledge-spine/main/.aurora/knowledge-index.json",
];

async function fetchKnowledgeIndex(): Promise<KnowledgeDocument[]> {
  const allDocs: KnowledgeDocument[] = [];
  const seen = new Set<string>();

  for (const url of KNOWLEDGE_INDEX_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const index: KnowledgeIndex = await response.json();
      for (const doc of index.documents) {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          allDocs.push(doc);
        }
      }
      // If we got the aggregated index, that's sufficient
      if (url.includes("aggregated")) break;
    } catch {
      continue;
    }
  }

  return allDocs;
}

function scoreDocument(
  doc: KnowledgeDocument,
  query: string,
  domainFilter?: string,
  tagFilter?: string[],
): number {
  if (domainFilter && doc.domain !== domainFilter) return -1;
  if (tagFilter?.length && !tagFilter.some((t) => doc.tags.includes(t))) return -1;

  const queryTerms = query.toLowerCase().split(/\s+/);
  let score = 0;

  for (const term of queryTerms) {
    if (doc.title.toLowerCase().includes(term)) score += 3;
    if (doc.summary.toLowerCase().includes(term)) score += 2;
    if (doc.domain.toLowerCase().includes(term)) score += 1;
    if (doc.tags.some((t) => t.includes(term))) score += 1;
  }

  return score;
}

export const knowledgeQueryTool = createTool({
  id: "knowledge-query",
  description:
    "Search the QGIA knowledge base across the constellation. Queries the aggregated knowledge index from QGIA-CORPUS (domain knowledge) and QGIA-SPINE (methodologies) to find relevant intelligence documents, analytical frameworks, and methodological references.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Search query — natural language description of what you're looking for"),
    domain: z
      .string()
      .optional()
      .describe(
        "Filter by domain (e.g., 'theoretical-foundations', 'analytical-frameworks', 'regional-expertise', 'tier1-methodological-foundations')",
      ),
    tags: z.array(z.string()).optional().describe("Filter by tags"),
    max_results: z
      .number()
      .min(1)
      .max(20)
      .default(5)
      .describe("Maximum number of results to return"),
  }),
  outputSchema: z.object({
    query: z.string(),
    total_indexed: z.number(),
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        domain: z.string(),
        path: z.string(),
        word_count: z.number(),
        summary: z.string(),
        relevance_score: z.number(),
        source_repo: z.string(),
        tags: z.array(z.string()),
      }),
    ),
    index_freshness: z.string(),
  }),
  execute: async ({ context }) => {
    const documents = await fetchKnowledgeIndex();

    const scored = documents
      .map((doc) => ({
        doc,
        score: scoreDocument(doc, context.query, context.domain, context.tags),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, context.max_results ?? 5);

    return {
      query: context.query,
      total_indexed: documents.length,
      results: scored.map(({ doc, score }) => ({
        id: doc.id,
        title: doc.title,
        domain: doc.domain,
        path: doc.path,
        word_count: doc.word_count,
        summary: doc.summary,
        relevance_score: score,
        source_repo: doc.id.startsWith("qgia-library:")
          ? "qgia-knowledge-library"
          : "qgia-knowledge-spine",
        tags: doc.tags,
      })),
      index_freshness: new Date().toISOString(),
    };
  },
});
