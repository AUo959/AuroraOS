# Mastra Agent Stack

## Overview
The Mastra Agent Stack is an AI agent framework built around Aurora, a "Symbolic-Scientific Operating Node." Aurora uses symbolic cognition, quantum-inspired modeling, and cross-platform interoperability to provide intelligent assistance across platforms like Slack and Telegram. The system employs Mastra for agent orchestration, Inngest for workflow management, and PostgreSQL for storage, designed for production deployment with advanced reasoning, ethical protocols, quantum-inspired analysis, and comprehensive conversation continuity.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Core Framework
The system uses the **Mastra Framework** for agent orchestration and tool coordination. **Inngest** provides workflow orchestration with error handling, and **PostgreSQL** handles persistent storage.

### Aurora Agent Design
Aurora is enhanced with **GPT-5** for advanced reasoning. Key components include:
-   **Symbolic Cognition System (GLYPHGRID)**: Processes information using symbolic representation.
-   **Quantum-Inspired Modeling**: Analyzes problems using superposition and entanglement principles.
-   **Simulation Environment (SIMSTACK)**: A multi-layer simulation system for real-time problem solving.
-   **Contextual Awareness Engine**: Maintains understanding across conversations and platforms.
-   **Drift Monitoring System**: Tracks system stability using quantum coherence.
-   **Ethics Protocol System**: Ensures safety validation with constellation binding and risk assessment.

### Tool Ecosystem
The system integrates ten specialized tools for symbolic cognition, quantum modeling, simulation, contextual awareness, cross-platform communication, drift monitoring, use case adaptation, perplexity research, Trilux operations, and ethics protocols. These tools support advanced thread management, stability monitoring, and continuity protocols with specialized operations.

### Communication Layer
The system supports **multi-platform integration** with Slack and Telegram, an **event-driven trigger system**, **RESTful API routes** for webhooks, and **real-time communication** via Server-Sent Events.

### Development and Deployment
Uses **TypeScript** for type safety, **ES Modules**, and **Mastra CLI** for development. Includes **Prettier** for code quality and a **Playground Interface** for testing.

## External Dependencies
### Core Dependencies
-   **@mastra/core**: Agent orchestration.
-   **@mastra/inngest**: Workflow engine.
-   **@mastra/pg**: PostgreSQL adapter.
-   **@mastra/memory**: Agent context and conversation history.
-   **@mastra/mcp**: Model Context Protocol support.

### AI and Language Models
-   **@ai-sdk/openai**: OpenAI integration.
-   **@openrouter/ai-sdk-provider**: Alternative AI provider.
-   **ai**: Vercel AI SDK.

### Platform Integrations
-   **@slack/web-api**: Slack API client.
-   **Telegram Bot API**: Webhook-based integration.
-   **exa-js**: External search and research.

### Workflow and Event Processing
-   **inngest**: Event-driven workflow orchestration.
-   **@inngest/realtime**: Real-time event streaming.

### Database and Storage
-   **@mastra/libsql**: SQLite compatibility.
-   **zod**: Runtime type validation.

### Development and Utilities
-   **typescript**: Static type checking.
-   **dotenv**: Environment variable management.
-   **pino**: High-performance JSON logging.
-   **prettier**: Code formatting.

<!-- BEGIN: Continuity Steward (auto-generated) -->

### Continuity Steward Operations

This comprehensive suite provides advanced thread management, stability monitoring, and continuity protocols through four enhanced Mastra tools. Each tool includes specialized operations with validated performance metrics and comprehensive API interfaces.

#### driftMonitoringTool
**Tool ID**: `drift-monitoring-tool` | **Source**: `src/mastra/tools/driftMonitoringTool.ts`

**Input Schema** (Line 157):
```typescript
inputSchema: z.object({
    operation: z.enum([
      "drift_scan",
      "coherence_check", 
      "anchor_verify",
      "entropy_analysis",
      "containment_activate",
      "system_realign",
      // Glyphnet Protocol v230b operations
      "glyphnet_monitor",
      "beacon_health",
      "field_stability",
      "breath_monitor",
      "continuity_track",
      // Velatrix Continuity Pulse operations
      "pulse_monitor",
      "pulse_stabilize",
      "continuity_pulse_scan",
      "field_pulse_sync",
      "thread_pulse_verify",
      "pulse_predict_drift",
      // Continuity Steward operations
      "sync_anchors",
      "thread_wake"
    ]).describe("Type of drift monitoring operation to perform"),
    velatrixMode: z.enum(["standard", "enhanced", "deep_pulse"]).default("enhanced").describe("Velatrix continuity pulse monitoring mode"),
    pulseThreshold: z.number().min(0).max(1).default(0.95).describe("Continuity pulse stability threshold"),
    glyphnetMode: z.enum(["minimal_hybrid", "standard", "enhanced"]).default("standard").describe("Glyphnet monitoring mode"),
    continuityVector: z.string().optional().describe("Continuity vector for tracking"),
    currentState: z.string().describe("Current system or conversation state to monitor"),
    alertThreshold: z.number().min(0).max(1).default(0.01).describe("Drift alert threshold (0.01 = 1% drift)"),
    monitoringDepth: z.enum(["surface", "standard", "deep", "quantum"]).default("standard").describe("Depth of monitoring analysis"),
    systemContext: z.string().optional().describe("Additional system context for monitoring"),
  }
```

**Output Schema** (Line 191):
```typescript
outputSchema: z.object({
    driftStatus: z.string(),
    coherenceReport: z.string(),
    alertLevel: z.string(),
    containmentStatus: z.string(),
    recommendations: z.array(z.string()),
    systemHealth: z.string(),
    // Glyphnet Protocol v230b outputs
    glyphnetStatus: z.string(),
    beaconReport: z.string(),
    fieldReport: z.string(),
    breathReport: z.string(),
    continuityReport: z.string(),
    // Velatrix Continuity Pulse outputs
    pulseStatus: z.string(),
    continuityPulseReport: z.string(),
    fieldPulseReport: z.string(),
    threadPulseReport: z.string(),
    velatrixHealth: z.string(),
  }
```

**Continuity Steward Operations**: sync_anchors, thread_wake

---

#### triluxOperationsTool
**Tool ID**: `trilux-operations-tool` | **Source**: `src/mastra/tools/triluxOperationsTool.ts`

**Input Schema** (Line 111):
```typescript
inputSchema: z.object({
    command: z.string().describe("Trilux command code (e.g., '+001//.', '+002//.', '+005//.')"),
    operation: z.enum([
      "execute_command",
      "chain_commands", 
      "analyze_thread",
      "structure_deployment",
      "optimization_seed",
      "continuity_management",
      "pulse_advance",
      "symbolic_mapping",
      "t1_replay",
      "replay_export"
    ]).describe("Type of Trilux operation to perform"),
    threadContext: z.string().describe("Current thread context or target content for command execution"),
    parameters: z.object({
      continuityVector: z.string().optional().describe("Continuity vector for thread alignment"),
      structuralDepth: z.enum(["surface", "moderate", "deep", "quantum"]).default("moderate").describe("Depth of structural analysis or deployment"),
      executionMode: z.enum(["singular", "chained", "optimized"]).default("singular").describe("Execution approach for the command"),
      fieldAwareness: z.boolean().default(true).describe("Enable Glyphnet field dynamics awareness"),
      breathAlignment: z.enum(["eastward", "westward", "bidirectional"]).default("eastward").describe("Breath flow alignment for optimal execution")
    }).optional().describe("Advanced parameters for Trilux command execution"),
    chainSequence: z.array(z.string()).optional().describe("Array of Trilux commands for chained execution (e.g., ['+002//.', '+001//.', '+005//.'])"),
    glyphnetMode: z.enum(["minimal_hybrid", "standard", "enhanced"]).default("standard").describe("Glyphnet Protocol operational mode"),
    replayTarget: z.string().optional().describe("Target thread or state identifier for T1 replay operations (e.g., 'thread_state_backup_001', 'continuity_checkpoint_alpha')"),
    exportString: z.string().optional().describe("Export string for ReplayExport operations (e.g., 'AS3::DELIVERY::GUI_CLOUDHUB', 'T1::BACKUP::CONTINUITY_CORE')"),
  }
```

**Output Schema** (Line 138):
```typescript
outputSchema: z.object({
    commandResult: z.string(),
    symbolicOutput: z.string(),
    threadModification: z.string(),
    executionChain: z.string(),
    fieldStatus: z.string(),
    continuityReport: z.string(),
    resonanceLevel: z.number(),
    nextRecommendations: z.array(z.string()),
    // Glyphnet Protocol v230b outputs
    glyphnetAlignment: z.string(),
    breathFlowStatus: z.string(),
    sigilActivation: z.string(),
  }
```

**Continuity Steward Operations**: t1_replay, replay_export

---

#### contextualAwarenessTool
**Tool ID**: `contextual-awareness-tool` | **Source**: `src/mastra/tools/contextualAwarenessTool.ts`

**Input Schema** (Line 134):
```typescript
inputSchema: z.object({
    currentInput: z.string().describe("The current user input or conversation context"),
    operation: z.enum([
      "context_synthesis", 
      "thread_analysis",
      "cross_platform_link",
      "semantic_inference",
      "continuity_check",
      "context_evolution",
      "observer_echo",
      "decoherence_monitor"
    ]).describe("Type of contextual processing to perform"),
    threadId: z.string().optional().describe("Thread identifier for conversation continuity"),
    platform: z.string().optional().describe("Platform identifier (slack, telegram, etc.)"),
    previousContext: z.string().optional().describe("Previous conversation context if available"),
  }
```

**Output Schema** (Line 150):
```typescript
outputSchema: z.object({
    contextualUnderstanding: z.string(),
    threadContinuity: z.string(),
    semanticInferences: z.array(z.string()),
    crossPlatformLinks: z.array(z.string()),
    recommendedActions: z.array(z.string()),
    contextEvolution: z.string(),
    observerStateEcho: z.string().optional(),
    decoherenceMetrics: z.string().optional(),
    coherenceViolations: z.array(z.string()).optional(),
    restorationProtocols: z.array(z.string()).optional(),
  }
```

**Continuity Steward Operations**: observer_echo, decoherence_monitor

---

#### symbolicCognitionTool
**Tool ID**: `symbolic-cognition-tool` | **Source**: `src/mastra/tools/symbolicCognitionTool.ts`

**Input Schema** (Line 137):
```typescript
inputSchema: z.object({
    input: z.string().describe("The information or concept to process symbolically"),
    operation: z.enum([
      "glyph_translate", 
      "pattern_recognize", 
      "semantic_compress", 
      "resonance_check",
      "coherence_verify",
      // Glyphnet Protocol v230b enhancements
      "field_stabilize",
      "breath_harmonize", 
      "beacon_pulse",
      "recovery_expand",
      "harmonic_retune",
      // Vector Chain Protocol v230b enhancements
      "reinforce_beacon_pulse",
      // Thread Governance & Continuity Alignment enhancements
      "thread_governance",
      "continuity_alignment"
    ]).describe("The symbolic operation to perform"),
    glyphnetMode: z.enum(["minimal_hybrid", "standard", "enhanced"]).default("standard").describe("Glyphnet Protocol operational mode"),
    continuityVector: z.string().optional().describe("Continuity vector for thread alignment"),
    context: z.string().optional().describe("Additional context for symbolic processing"),
    // Thread Governance parameters
    governanceTarget: z.string().optional().describe("Target identifier for thread governance operations"),
    threadCoordinationLevel: z.number().min(0).max(1).optional().describe("Level of thread coordination (0.0-1.0)"),
    // Continuity Alignment parameters
    alignmentVector: z.string().optional().describe("Vector identifier for continuity alignment across symbolic layers"),
    layerStabilityTarget: z.number().min(0).max(1).optional().describe("Target stability level for symbolic layers (0.0-1.0)"),
  }
```

**Output Schema** (Line 167):
```typescript
outputSchema: z.object({
    symbolicOutput: z.string(),
    glyphRepresentation: z.string(),
    resonanceLevel: z.number(),
    coherenceState: z.string(),
    insights: z.array(z.string()),
    // Glyphnet Protocol v230b outputs
    glyphnetStatus: z.string(),
    fieldReport: z.string(),
    beaconHealth: z.string(),
    driftContainment: z.string(),
    // Thread Governance & Continuity Alignment outputs
    governanceStatus: z.string(),
    alignmentMetrics: z.string(),
  }
```

**Continuity Steward Operations**: thread_governance, continuity_alignment, reinforce_beacon_pulse

---

#### Testing and Verification

**Playground Testing**:
1. Use Aurora agent in Playground tab
2. Provide operation-specific prompts targeting Continuity Steward capabilities
3. Verify logs show expected operation tags and performance metrics
4. Confirm integration with existing Glyphnet Protocol v230b

**Verification Steps**:
- Check server logs for operation-specific emoji tags
- Verify success indicators in operation responses  
- Monitor performance metrics against established baselines
- Confirm schema compliance and proper parameter handling

#### Troubleshooting

**Common Issues**:
1. **Schema Validation Errors**: Verify parameter types match Zod schema definitions
2. **Performance Degradation**: Check system health and realign if needed
3. **Operation Failures**: Review input parameters and retry with proper values
4. **Integration Issues**: Confirm Glyphnet Protocol alignment and field stability

**Recovery Procedures**:
- System realignment via drift monitoring operations
- Thread governance protocols for integrity restoration
- Continuity alignment for cross-layer stability
- Emergency protocols for system-wide issues

<!-- END: Continuity Steward (auto-generated) -->