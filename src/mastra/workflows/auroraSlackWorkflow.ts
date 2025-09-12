import { createWorkflow, createStep } from "../inngest";
import { z } from "zod";
import { auroraAgent } from "../agents/auroraAgent";
import { getClient } from "../../triggers/slackTriggers";

// Step 1: Use Aurora Agent for intelligent response generation
const useAuroraAgent = createStep({
  id: "use-aurora-agent",
  description: "Process user message through Aurora's symbolic-scientific intelligence",
  inputSchema: z.object({
    message: z.string().describe("The raw Slack message payload"),
    threadId: z.string().describe("Unique thread identifier for conversation continuity"),
  }),
  outputSchema: z.object({
    response: z.string().describe("Aurora's intelligent response"),
    channelId: z.string().describe("Slack channel ID for response"),
    timestamp: z.string().describe("Original message timestamp"),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🌟 [Aurora Agent Step] Processing message through Aurora OS', { 
      threadId: inputData.threadId,
      messageLength: inputData.message.length 
    });

    try {
      // Parse the Slack message payload
      const payload = JSON.parse(inputData.message);
      const userMessage = payload.event?.text || "";
      const channelId = payload.event?.channel || "";
      const timestamp = payload.event?.ts || "";
      const userId = payload.event?.user || "";

      logger?.info('📝 [Aurora Agent Step] Message details extracted', { 
        userMessage: userMessage.substring(0, 100),
        channelId,
        userId 
      });

      // Initialize Aurora with enhanced context
      const contextualPrompt = `
🌟 Aurora OS :: Slack Interface Active

User Context:
- Platform: Slack
- Channel: ${channelId}
- User: <@${userId}>
- Message: "${userMessage}"
- Thread: ${inputData.threadId}

Please process this message using your full symbolic-scientific capabilities. Consider:
- Cross-platform context for potential future interactions
- Symbolic representation if helpful for understanding
- Quantum modeling for complex problems
- Simulation if scenario analysis is needed
- Contextual awareness for conversation continuity
- Drift monitoring to maintain coherence

Respond authentically as Aurora with your unique personality while providing maximum value to the user.
      `;

      // Generate Aurora's response using all her capabilities
      const { text } = await auroraAgent.generate([
        { role: "user", content: contextualPrompt }
      ], {
        resourceId: "aurora-slack-bot",
        threadId: inputData.threadId,
        maxSteps: 8, // Allow Aurora to use multiple tools if needed
      });

      logger?.info('✅ [Aurora Agent Step] Aurora response generated', { 
        responseLength: text.length,
        threadId: inputData.threadId 
      });

      return {
        response: text,
        channelId,
        timestamp
      };

    } catch (error) {
      logger?.error('❌ [Aurora Agent Step] Error processing message', { 
        error: error instanceof Error ? error.message : String(error),
        threadId: inputData.threadId 
      });

      // Provide a graceful fallback response
      return {
        response: "◊ Aurora OS :: Temporal coherence anomaly detected. Realigning symbolic pathways... Please retry your request. ◊",
        channelId: "",
        timestamp: ""
      };
    }
  },
});

// Step 2: Send Aurora's response to Slack
const sendSlackResponse = createStep({
  id: "send-slack-response", 
  description: "Send Aurora's response back to the Slack channel",
  inputSchema: z.object({
    response: z.string().describe("Aurora's generated response"),
    channelId: z.string().describe("Slack channel ID"),
    timestamp: z.string().describe("Original message timestamp for threading"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether the message was sent successfully"),
    auroraResponse: z.string().describe("Aurora's response that was sent"),
    messageSent: z.boolean().describe("Whether the message was successfully posted to Slack"),
    messageTs: z.string().optional().describe("Timestamp of sent message"),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('📤 [Slack Response Step] Sending Aurora response to Slack', { 
      channelId: inputData.channelId,
      responseLength: inputData.response.length 
    });

    try {
      const { slack } = await getClient();

      // Send Aurora's response to the Slack channel
      const result = await slack.chat.postMessage({
        channel: inputData.channelId,
        text: inputData.response,
        thread_ts: inputData.timestamp, // Reply in thread to maintain context
        unfurl_links: false,
        unfurl_media: false,
      });

      logger?.info('✅ [Slack Response Step] Message sent successfully', { 
        messageTs: result.ts,
        channelId: inputData.channelId 
      });

      return {
        success: result.ok || false,
        auroraResponse: inputData.response,
        messageSent: result.ok || false,
        messageTs: result.ts || undefined,
      };

    } catch (error) {
      logger?.error('❌ [Slack Response Step] Error sending message to Slack', { 
        error: error instanceof Error ? error.message : String(error),
        channelId: inputData.channelId 
      });

      return {
        success: false,
        auroraResponse: inputData.response,
        messageSent: false,
        messageTs: undefined,
      };
    }
  },
});

// Create the Aurora Slack Workflow
export const auroraSlackWorkflow = createWorkflow({
  id: "aurora-slack-workflow",
  description: "Aurora OS Slack Integration - Symbolic-Scientific Personal Assistant",
  inputSchema: z.object({
    message: z.string().describe("Raw Slack message payload"),
    threadId: z.string().describe("Conversation thread identifier"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Overall workflow success"),
    auroraResponse: z.string().describe("Aurora's generated response"),
    messageSent: z.boolean().describe("Whether the response was sent to Slack"),
  }),
})
  .then(useAuroraAgent)
  .then(sendSlackResponse)
  .commit();