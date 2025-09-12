import { Mastra } from "@mastra/core";
import { MastraError } from "@mastra/core/error";
import { PinoLogger } from "@mastra/loggers";
import { LogLevel, MastraLogger } from "@mastra/core/logger";
import pino from "pino";
import { MCPServer } from "@mastra/mcp";
import { NonRetriableError } from "inngest";
import { z } from "zod";

import { sharedPostgresStorage } from "./storage";
import { inngest, inngestServe } from "./inngest";

// Import Aurora Agent and Workflow
import { auroraAgent } from "./agents/auroraAgent";
import { auroraSlackWorkflow } from "./workflows/auroraSlackWorkflow";

// Import Slack trigger system
import { getClient, registerSlackTrigger, type TriggerInfoSlackOnNewMessage } from "../triggers/slackTriggers";

// Import Aurora's tools for MCP server registration
import { symbolicCognitionTool } from "./tools/symbolicCognitionTool";
import { quantumModelingTool } from "./tools/quantumModelingTool";
import { simulationTool } from "./tools/simulationTool";
import { contextualAwarenessTool } from "./tools/contextualAwarenessTool";
import { crossPlatformTool } from "./tools/crossPlatformTool";
import { driftMonitoringTool } from "./tools/driftMonitoringTool";
import { useCaseAdaptationTool } from "./tools/useCaseAdaptationTool";

class ProductionPinoLogger extends MastraLogger {
  protected logger: pino.Logger;

  constructor(
    options: {
      name?: string;
      level?: LogLevel;
    } = {},
  ) {
    super(options);

    this.logger = pino({
      name: options.name || "app",
      level: options.level || LogLevel.INFO,
      base: {},
      formatters: {
        level: (label: string, _number: number) => ({
          level: label,
        }),
      },
      timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    });
  }

  debug(message: string, args: Record<string, any> = {}): void {
    this.logger.debug(args, message);
  }

  info(message: string, args: Record<string, any> = {}): void {
    this.logger.info(args, message);
  }

  warn(message: string, args: Record<string, any> = {}): void {
    this.logger.warn(args, message);
  }

  error(message: string, args: Record<string, any> = {}): void {
    this.logger.error(args, message);
  }
}

export const mastra = new Mastra({
  storage: sharedPostgresStorage,
  agents: { auroraAgent },
  workflows: { auroraSlackWorkflow },
  mcpServers: {
    allTools: new MCPServer({
      name: "allTools",
      version: "1.0.0",
      tools: {
        symbolicCognitionTool,
        quantumModelingTool,
        simulationTool,
        contextualAwarenessTool,
        crossPlatformTool,
        driftMonitoringTool,
        useCaseAdaptationTool,
      },
    }),
  },
  bundler: {
    // A few dependencies are not properly picked up by
    // the bundler if they are not added directly to the
    // entrypoint.
    externals: [
      "@slack/web-api",
      "inngest",
      "inngest/hono",
      "hono",
      "hono/streaming",
    ],
    // sourcemaps are good for debugging.
    sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    middleware: [
      async (c, next) => {
        const mastra = c.get("mastra");
        const logger = mastra?.getLogger();
        logger?.debug("[Request]", { method: c.req.method, url: c.req.url });
        try {
          await next();
        } catch (error) {
          logger?.error("[Response]", {
            method: c.req.method,
            url: c.req.url,
            error,
          });
          if (error instanceof MastraError) {
            if (error.id === "AGENT_MEMORY_MISSING_RESOURCE_ID") {
              // This is typically a non-retirable error. It means that the request was not
              // setup correctly to pass in the necessary parameters.
              throw new NonRetriableError(error.message, { cause: error });
            }
          } else if (error instanceof z.ZodError) {
            // Validation errors are never retriable.
            throw new NonRetriableError(error.message, { cause: error });
          }

          throw error;
        }
      },
    ],
    apiRoutes: [
      // This API route is used to register the Mastra workflow (inngest function) on the inngest server
      {
        path: "/api/inngest",
        method: "ALL",
        createHandler: async ({ mastra }) => inngestServe({ mastra, inngest }),
        // The inngestServe function integrates Mastra workflows with Inngest by:
        // 1. Creating Inngest functions for each workflow with unique IDs (workflow.${workflowId})
        // 2. Setting up event handlers that:
        //    - Generate unique run IDs for each workflow execution
        //    - Create an InngestExecutionEngine to manage step execution
        //    - Handle workflow state persistence and real-time updates
        // 3. Establishing a publish-subscribe system for real-time monitoring
        //    through the workflow:${workflowId}:${runId} channel
      },
      // Aurora Slack Integration
      ...registerSlackTrigger({
        triggerType: "slack/message.channels",
        handler: async (mastra: Mastra, triggerInfo: TriggerInfoSlackOnNewMessage) => {
          const logger = mastra.getLogger();
          const { slack, auth } = await getClient();
          
          logger?.info("🌟 [Aurora Slack Trigger] Received message", { 
            channel: triggerInfo.params.channel,
            channelName: triggerInfo.params.channelDisplayName 
          });

          // Aurora responds to direct messages and mentions with enhanced contextual awareness
          const isDirectMessage = triggerInfo.payload?.event?.channel_type === "im";
          const isMention = triggerInfo.payload?.event?.text?.includes(`<@${auth.user_id}>`);
          const shouldRespond = isDirectMessage || isMention;
          const channel = triggerInfo.payload?.event?.channel;
          const timestamp = triggerInfo.payload?.event?.ts;

          if (!shouldRespond) {
            logger?.info("🔇 [Aurora Slack Trigger] Not responding - not a DM or mention");
            return null;
          }

          // Add Aurora's symbolic reaction to indicate processing
          if (channel && timestamp) {
            try {
              await slack.reactions.add({
                channel,
                timestamp,
                name: "hourglass_flowing_sand",
              });
              logger?.info("⚛️ [Aurora Slack Trigger] Added processing reaction");
            } catch (error) {
              logger?.error("❌ [Aurora Slack Trigger] Error adding reaction", {
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          // Execute Aurora's workflow with enhanced context
          const run = await mastra.getWorkflow("auroraSlackWorkflow").createRunAsync();
          
          logger?.info("🚀 [Aurora Slack Trigger] Starting Aurora workflow", {
            threadId: `aurora-slack/${triggerInfo.payload.event.thread_ts || triggerInfo.payload.event.ts}`
          });
          
          return await run.start({
            inputData: {
              message: JSON.stringify(triggerInfo.payload),
              threadId: `aurora-slack/${triggerInfo.payload.event.thread_ts || triggerInfo.payload.event.ts}`,
            }
          });
        },
      }),
    ],
  },
  logger:
    process.env.NODE_ENV === "production"
      ? new ProductionPinoLogger({
          name: "Mastra",
          level: "info",
        })
      : new PinoLogger({
          name: "Mastra",
          level: "info",
        }),
});

/*  Sanity check 1: Throw an error if there are more than 1 workflows.  */
// !!!!!! Do not remove this check. !!!!!!
if (Object.keys(mastra.getWorkflows()).length > 1) {
  throw new Error(
    "More than 1 workflows found. Currently, more than 1 workflows are not supported in the UI, since doing so will cause app state to be inconsistent.",
  );
}

/*  Sanity check 2: Throw an error if there are more than 1 agents.  */
// !!!!!! Do not remove this check. !!!!!!
if (Object.keys(mastra.getAgents()).length > 1) {
  throw new Error(
    "More than 1 agents found. Currently, more than 1 agents are not supported in the UI, since doing so will cause app state to be inconsistent.",
  );
}
