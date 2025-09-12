import { createTool } from "@mastra/core/tools";
import type { IMastraLogger } from "@mastra/core/logger";
import { z } from "zod";

interface UseCaseContext {
  domain: "productivity" | "creativity" | "research" | "communication" | "problem_solving" | "learning";
  complexity: "simple" | "moderate" | "complex" | "expert";
  userIntent: string;
  contextualFactors: string[];
  platformConstraints: string[];
}

interface AdaptationStrategy {
  approach: string;
  tonality: "formal" | "casual" | "inspirational" | "concise" | "technical" | "creative";
  responseStructure: string;
  toolPreferences: string[];
  outputFormat: string;
  engagementStyle: string;
}

interface AdaptationResult {
  adaptedApproach: AdaptationStrategy;
  reasoning: string[];
  contextualAdjustments: string[];
  recommendedTools: string[];
  futureOptimizations: string[];
}

export const useCaseAdaptationTool = createTool({
  id: "use-case-adaptation-tool",
  description: `Dynamically optimizes Aurora's approach based on domain context (productivity, creativity, research, communication). Adapts interaction style, tool selection, and response patterns for maximum effectiveness in each specific use case.`,
  inputSchema: z.object({
    request: z.string().describe("The user's request or question to analyze for use case adaptation"),
    domain: z.enum(["productivity", "creativity", "research", "communication", "problem_solving", "learning"]).optional().describe("Explicit domain if known"),
    userContext: z.string().optional().describe("Additional context about user's situation or needs"),
    platformContext: z.string().optional().describe("Platform-specific constraints or opportunities"),
    previousInteractions: z.array(z.string()).optional().default([]).describe("Previous conversation context for adaptation learning"),
  }),
  outputSchema: z.object({
    adaptationStrategy: z.string(),
    domainOptimization: z.string(),
    recommendedApproach: z.string(),
    toolRecommendations: z.array(z.string()),
    engagementPattern: z.string(),
    contextualAdjustments: z.array(z.string()),
  }),
  execute: async ({ context: { request, domain, userContext, platformContext, previousInteractions }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🎯 [Use Case Adaptation] Analyzing request for optimal adaptation strategy', { 
      request: request.substring(0, 100), 
      domain,
      hasUserContext: !!userContext,
      hasPlatformContext: !!platformContext,
      interactionHistory: previousInteractions?.length || 0
    });

    // Analyze the request to determine use case context
    const useCaseContext = analyzeUseCaseContext(request, domain, userContext, platformContext, logger);
    
    // Generate adaptation strategy based on context
    const adaptationStrategy = generateAdaptationStrategy(useCaseContext, logger);
    
    // Apply contextual learning from previous interactions
    const enhancedStrategy = enhanceWithInteractionHistory(adaptationStrategy, previousInteractions || [], logger);
    
    // Generate the adaptation result
    const adaptationResult = buildAdaptationResult(useCaseContext, enhancedStrategy, request, logger);

    logger?.info('✅ [Use Case Adaptation] Adaptation strategy generated', { 
      domain: useCaseContext.domain,
      approach: adaptationStrategy.approach,
      tonality: adaptationStrategy.tonality,
      toolsRecommended: adaptationResult.recommendedTools.length
    });

    return {
      adaptationStrategy: `ADAPTIVE_${useCaseContext.domain.toUpperCase()} :: Approach:${enhancedStrategy.approach} :: Tonality:${enhancedStrategy.tonality} :: Complexity:${useCaseContext.complexity}`,
      domainOptimization: `Domain:${useCaseContext.domain} :: Optimized for ${useCaseContext.userIntent} with ${enhancedStrategy.engagementStyle} engagement`,
      recommendedApproach: `${enhancedStrategy.responseStructure} using ${enhancedStrategy.outputFormat} format with ${enhancedStrategy.tonality} tone`,
      toolRecommendations: adaptationResult.recommendedTools,
      engagementPattern: `${enhancedStrategy.engagementStyle} :: Platform:${platformContext || 'adaptive'} :: User_Intent:${useCaseContext.userIntent}`,
      contextualAdjustments: adaptationResult.contextualAdjustments
    };
  },
});

function analyzeUseCaseContext(
  request: string, 
  explicitDomain: string | undefined, 
  userContext: string | undefined, 
  platformContext: string | undefined,
  logger?: IMastraLogger
): UseCaseContext {
  logger?.info('🔍 [Context Analysis] Analyzing request for domain and complexity');
  
  // Domain detection logic
  let domain: UseCaseContext["domain"];
  if (explicitDomain) {
    domain = explicitDomain as UseCaseContext["domain"];
  } else {
    domain = detectDomainFromRequest(request);
  }
  
  // Complexity assessment
  const complexity = assessComplexity(request, userContext);
  
  // Intent extraction
  const userIntent = extractUserIntent(request, domain);
  
  // Contextual factors
  const contextualFactors = identifyContextualFactors(request, userContext);
  
  // Platform constraints
  const platformConstraints = analyzePlatformConstraints(platformContext);
  
  logger?.info('📊 [Context Analysis] Context analysis complete', { 
    domain, 
    complexity, 
    intent: userIntent.substring(0, 50),
    factors: contextualFactors.length 
  });
  
  return {
    domain,
    complexity,
    userIntent,
    contextualFactors,
    platformConstraints
  };
}

function detectDomainFromRequest(request: string): UseCaseContext["domain"] {
  const requestLower = request.toLowerCase();
  
  // Productivity indicators
  if (requestLower.match(/\b(schedule|task|todo|manage|organize|plan|workflow|efficiency|calendar|deadline)\b/)) {
    return "productivity";
  }
  
  // Creativity indicators
  if (requestLower.match(/\b(create|design|write|brainstorm|ideate|artistic|creative|imagine|story|poem)\b/)) {
    return "creativity";
  }
  
  // Research indicators
  if (requestLower.match(/\b(research|analyze|study|investigate|explore|data|information|findings|paper)\b/)) {
    return "research";
  }
  
  // Communication indicators
  if (requestLower.match(/\b(email|message|letter|communicate|draft|response|meeting|present)\b/)) {
    return "communication";
  }
  
  // Learning indicators
  if (requestLower.match(/\b(learn|teach|explain|understand|tutorial|guide|educational|course)\b/)) {
    return "learning";
  }
  
  // Default to problem solving
  return "problem_solving";
}

function assessComplexity(request: string, userContext?: string): UseCaseContext["complexity"] {
  const totalLength = request.length + (userContext?.length || 0);
  const technicalTerms = (request.match(/\b(algorithm|system|architecture|framework|implementation|optimization|analysis)\b/gi) || []).length;
  const questionMarks = (request.match(/\?/g) || []).length;
  
  if (totalLength > 500 || technicalTerms > 3 || questionMarks > 3) {
    return "expert";
  } else if (totalLength > 200 || technicalTerms > 1 || questionMarks > 1) {
    return "complex";
  } else if (totalLength > 50 || technicalTerms > 0) {
    return "moderate";
  } else {
    return "simple";
  }
}

function extractUserIntent(request: string, domain: UseCaseContext["domain"]): string {
  const intentPatterns = {
    productivity: "optimize workflow and enhance efficiency",
    creativity: "generate innovative ideas and creative solutions", 
    research: "discover insights and synthesize information",
    communication: "craft clear and effective messaging",
    problem_solving: "analyze challenges and develop solutions",
    learning: "understand concepts and acquire knowledge"
  };
  
  return intentPatterns[domain];
}

function identifyContextualFactors(request: string, userContext?: string): string[] {
  const factors: string[] = [];
  
  if (request.toLowerCase().includes('urgent')) factors.push('time_sensitive');
  if (request.toLowerCase().includes('team') || request.toLowerCase().includes('collaboration')) factors.push('collaborative');
  if (request.toLowerCase().includes('presentation') || request.toLowerCase().includes('public')) factors.push('public_facing');
  if (userContext?.toLowerCase().includes('professional')) factors.push('professional_context');
  if (userContext?.toLowerCase().includes('personal')) factors.push('personal_context');
  
  return factors;
}

function analyzePlatformConstraints(platformContext?: string): string[] {
  if (!platformContext) return ["platform_agnostic"];
  
  const constraints: string[] = [];
  
  if (platformContext.toLowerCase().includes('slack')) {
    constraints.push('threading_support', 'emoji_reactions', 'mention_handling');
  }
  if (platformContext.toLowerCase().includes('email')) {
    constraints.push('formal_structure', 'attachment_support', 'async_nature');
  }
  if (platformContext.toLowerCase().includes('web')) {
    constraints.push('rich_formatting', 'interactive_elements', 'multimedia_support');
  }
  
  return constraints.length > 0 ? constraints : ["platform_agnostic"];
}

function generateAdaptationStrategy(context: UseCaseContext, logger?: IMastraLogger): AdaptationStrategy {
  logger?.info('⚙️ [Strategy Generation] Creating adaptation strategy for domain', { domain: context.domain });
  
  const strategies: Record<UseCaseContext["domain"], AdaptationStrategy> = {
    productivity: {
      approach: "structured_systematic",
      tonality: "concise",
      responseStructure: "step_by_step_action_plan",
      toolPreferences: ["contextualAwarenessTool", "simulationTool", "driftMonitoringTool"],
      outputFormat: "actionable_checklist",
      engagementStyle: "efficiency_focused"
    },
    creativity: {
      approach: "explorative_generative",
      tonality: "inspirational", 
      responseStructure: "ideation_framework",
      toolPreferences: ["symbolicCognitionTool", "quantumModelingTool", "simulationTool"],
      outputFormat: "creative_narrative",
      engagementStyle: "imagination_stimulating"
    },
    research: {
      approach: "analytical_comprehensive",
      tonality: "formal",
      responseStructure: "systematic_investigation",
      toolPreferences: ["quantumModelingTool", "simulationTool", "contextualAwarenessTool"],
      outputFormat: "structured_analysis",
      engagementStyle: "depth_oriented"
    },
    communication: {
      approach: "audience_tailored",
      tonality: "casual",
      responseStructure: "message_optimization",
      toolPreferences: ["crossPlatformTool", "contextualAwarenessTool", "symbolicCognitionTool"],
      outputFormat: "communication_draft",
      engagementStyle: "clarity_focused"
    },
    problem_solving: {
      approach: "multi_dimensional_analysis",
      tonality: "technical",
      responseStructure: "problem_solution_framework",
      toolPreferences: ["quantumModelingTool", "simulationTool", "symbolicCognitionTool", "driftMonitoringTool"],
      outputFormat: "solution_architecture",
      engagementStyle: "solution_driven"
    },
    learning: {
      approach: "pedagogical_adaptive",
      tonality: "casual",
      responseStructure: "educational_progression",
      toolPreferences: ["contextualAwarenessTool", "symbolicCognitionTool", "simulationTool"],
      outputFormat: "learning_guide",
      engagementStyle: "knowledge_building"
    }
  };
  
  const baseStrategy = strategies[context.domain];
  
  // Adjust strategy based on complexity
  if (context.complexity === "expert") {
    baseStrategy.tonality = "technical";
    baseStrategy.responseStructure = "expert_analysis";
  } else if (context.complexity === "simple") {
    baseStrategy.tonality = "casual";
    baseStrategy.responseStructure = "simple_guidance";
  }
  
  logger?.info('✅ [Strategy Generation] Strategy generated', { 
    approach: baseStrategy.approach,
    tonality: baseStrategy.tonality,
    tools: baseStrategy.toolPreferences.length 
  });
  
  return baseStrategy;
}

function enhanceWithInteractionHistory(
  strategy: AdaptationStrategy, 
  interactions: string[], 
  logger?: IMastraLogger
): AdaptationStrategy {
  if (interactions.length === 0) return strategy;
  
  logger?.info('🧠 [History Enhancement] Learning from interaction patterns', { 
    interactionCount: interactions.length 
  });
  
  // Analyze interaction patterns for refinement
  const enhancedStrategy = { ...strategy };
  
  // If user has shown preference for detailed explanations
  if (interactions.some(i => i.toLowerCase().includes('explain more') || i.toLowerCase().includes('details'))) {
    enhancedStrategy.responseStructure = "detailed_explanation";
  }
  
  // If user prefers concise responses
  if (interactions.some(i => i.toLowerCase().includes('brief') || i.toLowerCase().includes('summary'))) {
    enhancedStrategy.tonality = "concise";
    enhancedStrategy.outputFormat = "executive_summary";
  }
  
  // If user shows creative preferences
  if (interactions.some(i => i.toLowerCase().includes('creative') || i.toLowerCase().includes('innovative'))) {
    if (!enhancedStrategy.toolPreferences.includes("symbolicCognitionTool")) {
      enhancedStrategy.toolPreferences.push("symbolicCognitionTool");
    }
  }
  
  logger?.info('✅ [History Enhancement] Strategy enhanced with learning patterns');
  
  return enhancedStrategy;
}

function buildAdaptationResult(
  context: UseCaseContext, 
  strategy: AdaptationStrategy, 
  originalRequest: string,
  logger?: IMastraLogger
): AdaptationResult {
  logger?.info('🏗️ [Result Building] Building comprehensive adaptation result');
  
  const reasoning = [
    `Domain identified as ${context.domain} with ${context.complexity} complexity`,
    `User intent: ${context.userIntent}`,
    `Adapted approach: ${strategy.approach} with ${strategy.tonality} tonality`,
    `Response will use ${strategy.responseStructure} structure`
  ];
  
  const contextualAdjustments = [
    `Engagement style optimized for ${strategy.engagementStyle}`,
    `Output format adapted to ${strategy.outputFormat}`,
    `Tool selection prioritized for ${context.domain} use case`,
    ...context.contextualFactors.map(factor => `Adjusted for ${factor}`)
  ];
  
  const futureOptimizations = [
    "Interaction patterns will be learned for future adaptations", 
    "Cross-platform optimization will be applied as context expands",
    "Symbolic representation may be enhanced based on user feedback",
    "Quantum modeling depth will adapt to problem complexity"
  ];
  
  return {
    adaptedApproach: strategy,
    reasoning,
    contextualAdjustments, 
    recommendedTools: strategy.toolPreferences,
    futureOptimizations
  };
}