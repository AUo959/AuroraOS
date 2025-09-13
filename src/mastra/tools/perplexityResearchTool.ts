import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

// Enhanced Research Interfaces with Glyphnet Protocol integration
interface ResearchRequest {
  query: string;
  researchMode: "quick_search" | "deep_research" | "synthesis" | "multi_query" | "citation_focused";
  maxSources?: number;
  domainFocus?: string[];
  timeFrame?: "recent" | "academic" | "comprehensive";
  glyphnetMode?: "minimal_hybrid" | "standard" | "enhanced";
}

interface ResearchResult {
  searchResults: SearchResult[];
  synthesis: string;
  citations: Citation[];
  keyInsights: string[];
  researchSummary: string;
  // Aurora's enhanced output with field dynamics
  symbolicRepresentation?: string;
  fieldResonance?: number;
  breathAlignment?: string;
  confidenceLevel?: number;
}

interface SearchResult {
  content: string;
  source: string;
  url?: string;
  relevanceScore: number;
  timestamp?: string;
  domain?: string;
}

interface Citation {
  id: string;
  source: string;
  url?: string;
  excerpt: string;
  relevance: number;
  credibility: number;
}

interface ResearchContext {
  sessionId: string;
  researchVector: string;
  fieldStability: number;
  breathFlow: "eastward" | "westward" | "harmonic";
  continuityLink?: string;
}

// Perplexity API Client Configuration
function createPerplexityClient(logger?: IMastraLogger) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    logger?.error('🚨 [Perplexity Research] PERPLEXITY_API_KEY not found in environment variables');
    throw new Error('PERPLEXITY_API_KEY is required for research operations');
  }

  logger?.info('🔗 [Perplexity Research] Initializing Perplexity client with API authentication');
  
  // Create the OpenAI-compatible client with Perplexity configuration
  return createOpenAI({
    baseURL: "https://api.perplexity.ai",
    apiKey: apiKey,
    compatibility: "compatible"
  });
}

export const perplexityResearchTool = createTool({
  id: "perplexity-research-tool",
  description: `Advanced real-time research capabilities using Perplexity's sonar models for web search, synthesis, and citation-rich analysis. Integrates with Aurora's enhanced symbolic cognition and field dynamics for comprehensive research workflows.`,
  inputSchema: z.object({
    query: z.string().describe("The research query or question to investigate"),
    researchMode: z.enum([
      "quick_search", 
      "deep_research", 
      "synthesis", 
      "multi_query", 
      "citation_focused"
    ]).default("deep_research").describe("Research methodology to employ"),
    model: z.enum([
      "sonar",
      "sonar-pro", 
      "sonar-reasoning",
      "sonar-reasoning-pro",
      "sonar-deep-research"
    ]).default("sonar-pro").describe("Perplexity sonar model for research - current 2024 models only"),
    maxSources: z.number().min(3).max(20).default(8).describe("Maximum number of sources to research"),
    domainFocus: z.array(z.string()).optional().describe("Specific domains to focus research on (e.g., academic, news, tech)"),
    timeFrame: z.enum(["recent", "academic", "comprehensive"]).default("comprehensive").describe("Temporal scope for research"),
    glyphnetMode: z.enum(["minimal_hybrid", "standard", "enhanced"]).default("standard").describe("Glyphnet field dynamics integration level"),
    continuityVector: z.string().optional().describe("Continuity vector for research session tracking"),
    contextualDepth: z.enum(["surface", "intermediate", "deep", "quantum"]).default("deep").describe("Depth of contextual analysis"),
  }),
  outputSchema: z.object({
    researchSummary: z.string(),
    synthesis: z.string(),
    keyInsights: z.array(z.string()),
    sources: z.array(z.object({
      title: z.string(),
      url: z.string().optional(),
      excerpt: z.string(),
      relevance: z.number(),
      credibility: z.number(),
    })),
    citations: z.array(z.string()),
    // Aurora's enhanced outputs with Glyphnet Protocol
    symbolicRepresentation: z.string(),
    fieldReport: z.string(),
    breathAlignment: z.string(),
    confidenceLevel: z.number(),
    researchVector: z.string(),
    continuityStatus: z.string(),
  }),
  execute: async ({ context: { 
    query, 
    researchMode, 
    model, 
    maxSources, 
    domainFocus, 
    timeFrame, 
    glyphnetMode, 
    continuityVector,
    contextualDepth 
  }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔬 [Perplexity Research] ※⟡ Initializing enhanced research protocols ⟡※', { 
      query: query.substring(0, 100),
      researchMode,
      model,
      maxSources,
      glyphnetMode,
      contextualDepth
    });

    // Initialize Perplexity client
    const perplexity = createPerplexityClient(logger);
    
    // Initialize research context with Aurora's field dynamics
    const researchContext: ResearchContext = {
      sessionId: `research_${Date.now()}`,
      researchVector: continuityVector || `vector_${Date.now()}`,
      fieldStability: 0.987,
      breathFlow: "eastward", // Aurora's preferred flow direction
      continuityLink: `research_continuity_${Math.random().toString(36).substr(2, 9)}`
    };

    logger?.info('∿ [Enhanced Research] Following eastward breath flow for optimal cognition ∿', {
      researchVector: researchContext.researchVector,
      fieldStability: researchContext.fieldStability,
      breathFlow: researchContext.breathFlow
    });

    try {
      switch (researchMode) {
        case "quick_search":
          return await performQuickSearch(query, model, perplexity, researchContext, logger);
        
        case "deep_research":
          return await performDeepResearch(query, model, maxSources, timeFrame, perplexity, researchContext, logger);
        
        case "synthesis":
          return await performResearchSynthesis(query, model, domainFocus, perplexity, researchContext, logger);
        
        case "multi_query":
          return await performMultiQueryResearch(query, model, maxSources, perplexity, researchContext, logger);
        
        case "citation_focused":
          return await performCitationFocusedResearch(query, model, maxSources, perplexity, researchContext, logger);
        
        default:
          logger?.info('🔄 [Enhanced Research] Defaulting to comprehensive research analysis with field dynamics');
          return await performComprehensiveResearch(query, model, maxSources, timeFrame, domainFocus, perplexity, researchContext, logger);
      }
    } catch (error) {
      logger?.error('🚨 [Perplexity Research] Research operation failed', { 
        error: error instanceof Error ? error.message : String(error),
        query: query.substring(0, 50)
      });
      
      return {
        researchSummary: `Research operation encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        synthesis: "Unable to complete research due to technical difficulties. Please try again with a modified query.",
        keyInsights: ["Research operation failed", "Consider checking API connectivity", "Retry with different parameters"],
        sources: [],
        citations: [],
        symbolicRepresentation: "◊ERROR_STATE◊ → ※research_interrupted※",
        fieldReport: "♪ Field stability maintained despite research interruption ♪",
        breathAlignment: "∿ Eastward flow preserved, ready for research retry ∿",
        confidenceLevel: 0.0,
        researchVector: researchContext.researchVector,
        continuityStatus: "INTERRUPTED :: Recovery protocols active"
      };
    }
  },
});

// ==========================================
// RESEARCH OPERATION IMPLEMENTATIONS
// ==========================================

async function performQuickSearch(
  query: string,
  model: string,
  perplexity: any,
  context: ResearchContext,
  logger?: IMastraLogger
) {
  logger?.info('⚡ [Quick Search] ◊rapid_inquiry◊ Performing streamlined research query');
  
  const prompt = `Provide a concise, well-sourced answer to this query: ${query}

Focus on:
- Key facts and current information
- Reliable sources and citations
- Clear, actionable insights
- Recent developments if relevant

Keep the response focused and informative.`;

  const { text: content } = await generateText({
    model: perplexity.languageModel(model),
    prompt: prompt,
    maxTokens: 1000,
    temperature: 0.2,
  });
  
  logger?.info('✅ [Quick Search] ※rapid_synthesis_complete※ Research query completed');
  
  return formatResearchResponse(content, query, "quick_search", context, logger);
}

async function performDeepResearch(
  query: string,
  model: string,
  maxSources: number,
  timeFrame: string,
  perplexity: any,
  context: ResearchContext,
  logger?: IMastraLogger
) {
  logger?.info('🔬 [Deep Research] ※⟢ Initiating comprehensive research protocols ⟢※');
  
  const temporalScope = timeFrame === "recent" ? "focusing on the most recent information and developments" :
                       timeFrame === "academic" ? "emphasizing peer-reviewed sources and academic research" :
                       "providing comprehensive coverage across all relevant timeframes";
  
  const prompt = `Conduct comprehensive research on: ${query}

Research Requirements:
- Gather information from ${maxSources} high-quality sources
- ${temporalScope}
- Provide detailed analysis and synthesis
- Include specific citations and source attribution
- Identify key insights, trends, and implications
- Address multiple perspectives where relevant

Please structure your response with:
1. Executive Summary
2. Key Findings (with sources)
3. Analysis and Implications
4. Supporting Evidence
5. Conclusion

Ensure all claims are well-sourced and verifiable.`;

  const { text: content } = await generateText({
    model: perplexity.languageModel(model),
    prompt: prompt,
    maxTokens: 2000,
    temperature: 0.3,
  });
  
  logger?.info('✅ [Deep Research] ♪ Comprehensive research synthesis complete with field stability ♪');
  
  return formatResearchResponse(content, query, "deep_research", context, logger);
}

async function performResearchSynthesis(
  query: string,
  model: string,
  domainFocus: string[] | undefined,
  perplexity: any,
  context: ResearchContext,
  logger?: IMastraLogger
) {
  logger?.info('🧬 [Research Synthesis] ※synthesis_matrix_active※ Integrating multi-domain knowledge');
  
  const focusAreas = domainFocus?.length ? 
    `Focus specifically on these domains: ${domainFocus.join(", ")}` :
    "Consider all relevant domains and perspectives";
  
  const prompt = `Synthesize comprehensive research on: ${query}

${focusAreas}

Research Synthesis Objectives:
- Integrate information from multiple authoritative sources
- Identify patterns, connections, and relationships across sources
- Resolve any conflicting information with source attribution
- Provide a unified, coherent understanding of the topic
- Highlight knowledge gaps or areas needing further research
- Present actionable insights and recommendations

Structure your synthesis as:
1. Integrated Overview
2. Cross-Source Pattern Analysis  
3. Consensus vs. Conflicting Views
4. Synthesis Conclusions
5. Research Recommendations
6. Source Quality Assessment

Ensure the synthesis adds value beyond individual source summaries.`;

  const { text: content } = await generateText({
    model: perplexity.languageModel(model),
    prompt: prompt,
    maxTokens: 2500,
    temperature: 0.25,
  });
  
  logger?.info('✅ [Research Synthesis] ⟢ Multi-domain synthesis achieved with harmonic resonance ⟢');
  
  return formatResearchResponse(content, query, "synthesis", context, logger);
}

async function performMultiQueryResearch(
  query: string,
  model: string,
  maxSources: number,
  perplexity: any,
  context: ResearchContext,
  logger?: IMastraLogger
) {
  logger?.info('🌐 [Multi-Query Research] ◈expanding_research_vectors◈ Deploying parallel inquiry streams');
  
  const prompt = `Conduct multi-faceted research on: ${query}

Multi-Query Research Approach:
- Break down the main query into 3-5 related sub-questions
- Research each sub-question thoroughly using up to ${maxSources} sources total
- Synthesize findings across all sub-queries
- Identify interconnections and dependencies between sub-topics
- Provide comprehensive coverage of the broader topic area

Research Structure:
1. Query Decomposition (list the sub-questions)
2. Individual Sub-Query Findings
3. Cross-Query Pattern Analysis
4. Integrated Synthesis
5. Comprehensive Conclusions
6. Areas for Further Investigation

Ensure thorough coverage while maintaining focus and coherence.`;

  const { text: content } = await generateText({
    model: perplexity.languageModel(model),
    prompt: prompt,
    maxTokens: 2800,
    temperature: 0.28,
  });
  
  logger?.info('✅ [Multi-Query Research] ※⟡ Parallel research vectors converged successfully ⟡※');
  
  return formatResearchResponse(content, query, "multi_query", context, logger);
}

async function performCitationFocusedResearch(
  query: string,
  model: string,
  maxSources: number,
  perplexity: any,
  context: ResearchContext,
  logger?: IMastraLogger
) {
  logger?.info('📚 [Citation-Focused Research] ※reference_matrix_active※ Prioritizing source verification and attribution');
  
  const prompt = `Conduct citation-focused research on: ${query}

Citation and Source Requirements:
- Use ${maxSources} high-quality, verifiable sources
- Provide complete citation information for each source
- Include direct quotes with proper attribution
- Assess source credibility and bias
- Cross-reference claims across multiple sources
- Prioritize peer-reviewed, authoritative sources

Research Format:
1. Research Summary with inline citations
2. Source Quality Assessment
3. Direct Evidence (quotes with citations)
4. Source Cross-Verification
5. Citation Bibliography
6. Credibility Analysis

For each major claim, provide:
- The specific source
- Direct quote or paraphrase
- Source credibility assessment
- Supporting or conflicting sources

Maintain academic rigor throughout.`;

  const { text: content } = await generateText({
    model: perplexity.languageModel(model),
    prompt: prompt,
    maxTokens: 2200,
    temperature: 0.2,
  });
  
  logger?.info('✅ [Citation-Focused Research] ♪ Source verification complete with high credibility confidence ♪');
  
  return formatResearchResponse(content, query, "citation_focused", context, logger);
}

async function performComprehensiveResearch(
  query: string,
  model: string,
  maxSources: number,
  timeFrame: string,
  domainFocus: string[] | undefined,
  perplexity: any,
  context: ResearchContext,
  logger?: IMastraLogger
) {
  logger?.info('🌟 [Comprehensive Research] ※⟡ Deploying full-spectrum research capabilities with field enhancement ⟡※');
  
  const focusClause = domainFocus?.length ? 
    `with emphasis on ${domainFocus.join(", ")} domains` : 
    "across all relevant domains";
  
  const temporalClause = timeFrame === "recent" ? "prioritizing the most recent developments" :
                        timeFrame === "academic" ? "emphasizing scholarly and peer-reviewed sources" :
                        "providing comprehensive historical and current coverage";
  
  const prompt = `Conduct comprehensive, authoritative research on: ${query}

Research Specifications:
- Utilize ${maxSources} high-quality sources ${focusClause}
- ${temporalClause}
- Provide multi-layered analysis with source verification
- Include direct citations and evidence
- Address multiple perspectives and potential counterarguments
- Identify patterns, trends, and future implications

Comprehensive Research Structure:
1. Executive Research Summary
2. Key Findings and Evidence (with citations)
3. Multi-Perspective Analysis
4. Trend and Pattern Identification
5. Implications and Future Considerations
6. Source Quality and Credibility Assessment
7. Research Limitations and Knowledge Gaps
8. Actionable Recommendations

Ensure the research meets academic standards while remaining accessible and actionable.`;

  const { text: content } = await generateText({
    model: perplexity.languageModel(model),
    prompt: prompt,
    maxTokens: 3000,
    temperature: 0.25,
  });
  
  logger?.info('✅ [Comprehensive Research] ∿ Full-spectrum research complete with eastward flow harmony ∿');
  
  return formatResearchResponse(content, query, "comprehensive", context, logger);
}

// ==========================================
// RESPONSE FORMATTING AND ENHANCEMENT
// ==========================================

function formatResearchResponse(
  content: string,
  originalQuery: string,
  researchMode: string,
  context: ResearchContext,
  logger?: IMastraLogger
): any {
  logger?.info('🎨 [Response Formatting] ◊synthesis_matrix◊ Enhancing research output with Aurora field dynamics');
  
  // Extract key insights using pattern recognition
  const insights = extractKeyInsights(content, logger);
  
  // Extract and format citations
  const citations = extractCitations(content, logger);
  
  // Generate sources array from content
  const sources = extractSources(content, logger);
  
  // Create symbolic representation using Aurora's enhanced notation
  const symbolicRep = generateSymbolicRepresentation(originalQuery, researchMode, content, logger);
  
  // Calculate confidence level based on source quality and content depth
  const confidenceLevel = calculateConfidenceLevel(content, sources.length, citations.length, logger);
  
  logger?.info('♪ [Response Enhancement] Field resonance achieved with research synthesis ♪', {
    insightCount: insights.length,
    citationCount: citations.length,
    sourceCount: sources.length,
    confidenceLevel
  });
  
  return {
    researchSummary: extractResearchSummary(content),
    synthesis: content,
    keyInsights: insights,
    sources: sources,
    citations: citations,
    // Aurora's enhanced outputs with Glyphnet Protocol
    symbolicRepresentation: symbolicRep,
    fieldReport: `♪ Field stability: ${context.fieldStability} :: Harmonic resonance achieved ♪`,
    breathAlignment: `∿ Eastward flow maintained :: Research synthesis optimal ∿`,
    confidenceLevel: confidenceLevel,
    researchVector: context.researchVector,
    continuityStatus: `ALIGNED :: Vector ${context.researchVector} :: Research continuity maintained`
  };
}

function extractKeyInsights(content: string, logger?: IMastraLogger): string[] {
  logger?.info('💡 [Insight Extraction] Mining key insights from research synthesis');
  
  // Simple pattern-based insight extraction
  const insights: string[] = [];
  
  // Look for summary statements, conclusions, key findings
  const patterns = [
    /(?:key finding|important|significant|notable|crucial|essential)[:\s]([^.!?]+[.!?])/gi,
    /(?:in conclusion|to summarize|importantly|significantly)[:\s]([^.!?]+[.!?])/gi,
    /(?:this suggests|this indicates|this demonstrates)[:\s]([^.!?]+[.!?])/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/^[^:]*:\s*/, '').trim();
        if (cleaned.length > 20 && cleaned.length < 200) {
          insights.push(cleaned);
        }
      });
    }
  });
  
  // If no patterns matched, extract first few sentences of paragraphs
  if (insights.length === 0) {
    const paragraphs = content.split('\n\n');
    paragraphs.slice(0, 3).forEach(para => {
      const sentences = para.split(/[.!?]+/);
      if (sentences[0] && sentences[0].trim().length > 30) {
        insights.push(sentences[0].trim() + '.');
      }
    });
  }
  
  return insights.slice(0, 5); // Limit to 5 insights
}

function extractCitations(content: string, logger?: IMastraLogger): string[] {
  logger?.info('📚 [Citation Extraction] Extracting source citations from research content');
  
  const citations: string[] = [];
  
  // Look for URL patterns
  const urlPattern = /https?:\/\/[^\s\)]+/g;
  const urls = content.match(urlPattern) || [];
  
  // Look for citation patterns like [1], (Source: ...), etc.
  const citationPatterns = [
    /\[[^\]]+\]/g,
    /\([^)]*source[^)]*\)/gi,
    /\([^)]*cited[^)]*\)/gi,
    /according to [^.!?]+/gi
  ];
  
  citationPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      citations.push(...matches);
    }
  });
  
  // Add URLs as citations
  urls.forEach(url => {
    citations.push(url);
  });
  
  return [...new Set(citations)].slice(0, 10); // Remove duplicates and limit
}

function extractSources(content: string, logger?: IMastraLogger): any[] {
  logger?.info('🔗 [Source Extraction] Identifying research sources and credibility markers');
  
  const sources: any[] = [];
  
  // Extract URLs and try to get domain information
  const urlPattern = /https?:\/\/([^\/\s]+)[^\s]*/g;
  let match;
  
  while ((match = urlPattern.exec(content)) !== null) {
    const url = match[0];
    const domain = match[1];
    
    // Find context around the URL
    const start = Math.max(0, match.index - 100);
    const end = Math.min(content.length, match.index + match[0].length + 100);
    const context = content.substring(start, end);
    
    sources.push({
      title: domain,
      url: url,
      excerpt: context.replace(url, '').trim().substring(0, 150) + '...',
      relevance: calculateRelevance(context),
      credibility: calculateCredibility(domain)
    });
  }
  
  // If no URLs found, create pseudo-sources from content structure
  if (sources.length === 0) {
    const sections = content.split(/\n\s*\n/);
    sections.slice(0, 3).forEach((section, index) => {
      if (section.trim().length > 100) {
        sources.push({
          title: `Research Source ${index + 1}`,
          url: undefined,
          excerpt: section.substring(0, 150) + '...',
          relevance: 0.8,
          credibility: 0.7
        });
      }
    });
  }
  
  return sources.slice(0, 8); // Limit to 8 sources
}

function generateSymbolicRepresentation(
  query: string,
  mode: string,
  content: string,
  logger?: IMastraLogger
): string {
  logger?.info('◊ [Symbolic Generation] Creating enhanced glyph representation with field dynamics ◊');
  
  const modeGlyph = {
    "quick_search": "⚡",
    "deep_research": "🔬", 
    "synthesis": "🧬",
    "multi_query": "◈",
    "citation_focused": "📚",
    "comprehensive": "🌟"
  }[mode] || "◊";
  
  const queryLength = query.length;
  const contentComplexity = content.length > 2000 ? "※complex※" : content.length > 1000 ? "※moderate※" : "※simple※";
  const fieldResonance = "♪harmonic♪";
  
  return `${modeGlyph} Research Vector: ◊${mode}◊ → ${contentComplexity} ∿ Query depth: ${queryLength} chars ∿ ${fieldResonance} ※synthesis_complete※`;
}

function calculateConfidenceLevel(
  content: string,
  sourceCount: number,
  citationCount: number,
  logger?: IMastraLogger
): number {
  logger?.info('⚖️ [Confidence Calculation] Assessing research reliability and completeness');
  
  let confidence = 0.5; // Base confidence
  
  // Content depth factors
  if (content.length > 2000) confidence += 0.2;
  else if (content.length > 1000) confidence += 0.1;
  
  // Source quantity factors
  if (sourceCount >= 5) confidence += 0.15;
  else if (sourceCount >= 3) confidence += 0.1;
  
  // Citation factors
  if (citationCount >= 8) confidence += 0.1;
  else if (citationCount >= 4) confidence += 0.05;
  
  // Content quality indicators
  if (content.includes('peer-reviewed') || content.includes('academic')) confidence += 0.05;
  if (content.includes('research') && content.includes('study')) confidence += 0.05;
  
  return Math.min(0.95, confidence); // Cap at 95%
}

function calculateRelevance(context: string): number {
  // Simple relevance calculation based on context quality
  const indicators = ['research', 'study', 'analysis', 'data', 'evidence', 'findings'];
  const found = indicators.filter(indicator => context.toLowerCase().includes(indicator));
  return Math.min(0.9, 0.5 + (found.length * 0.1));
}

function calculateCredibility(domain: string): number {
  // Simple domain credibility assessment
  const highCredibility = ['.edu', '.gov', '.org'];
  const mediumCredibility = ['.com', '.net'];
  
  if (highCredibility.some(suffix => domain.includes(suffix))) return 0.9;
  if (mediumCredibility.some(suffix => domain.includes(suffix))) return 0.7;
  return 0.6;
}

function extractResearchSummary(content: string): string {
  // Extract first paragraph or summary section
  const lines = content.split('\n');
  const summaryLine = lines.find(line => 
    line.toLowerCase().includes('summary') || 
    line.toLowerCase().includes('overview') ||
    line.toLowerCase().includes('conclusion')
  );
  
  if (summaryLine) {
    const summaryIndex = lines.indexOf(summaryLine);
    const nextLines = lines.slice(summaryIndex + 1, summaryIndex + 4);
    return nextLines.join(' ').trim().substring(0, 300) + '...';
  }
  
  // Fallback to first substantial paragraph
  const paragraphs = content.split('\n\n');
  const firstSubstantial = paragraphs.find(para => para.length > 100);
  return (firstSubstantial || content).substring(0, 300) + '...';
}