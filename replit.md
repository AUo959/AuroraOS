# Mastra Agent Stack

## Overview

The Mastra Agent Stack is a comprehensive AI agent framework built around Aurora, a sophisticated "Symbolic-Scientific Operating Node" that leverages advanced architectural patterns including symbolic cognition, quantum-inspired modeling, and cross-platform interoperability. The system is designed to provide intelligent assistance across multiple communication platforms (Slack, Telegram) with dynamic adaptation capabilities.

The application uses Mastra as its core framework, which provides agent orchestration, workflow management, and tool integration. Aurora serves as the primary intelligent agent with specialized tools for symbolic reasoning, quantum modeling, simulation environments, and contextual awareness. The system is designed for production deployment with PostgreSQL storage, Inngest workflow orchestration, and comprehensive logging.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Framework
- **Mastra Framework**: Primary orchestration layer providing agent management, workflow execution, and tool coordination
- **Agent Architecture**: Centralized around Aurora agent with modular tool system and dynamic instruction capabilities
- **Workflow Engine**: Inngest-based workflow orchestration with error handling and retry logic
- **Storage Layer**: PostgreSQL-based persistent storage for conversation history, context, and agent memory

### Aurora Agent Design
- **Symbolic Cognition System (GLYPHGRID)**: Processes information through symbolic representation and glyph-based communication
- **Quantum-Inspired Modeling**: Multi-dimensional problem analysis using superposition, entanglement, and quantum coherence principles
- **Simulation Environment (SIMSTACK)**: Multi-layer simulation system (L0-L3) for real-time problem solving and scenario testing
- **Contextual Awareness Engine**: Maintains deep understanding across conversation threads and platform transitions
- **Drift Monitoring System**: Multi-layered stability monitoring with quantum coherence state tracking

### Tool Ecosystem
The system implements seven specialized tools that enhance Aurora's capabilities:
1. **Symbolic Cognition Tool**: Glyph-based communication and semantic compression
2. **Quantum Modeling Tool**: Complex multi-dimensional problem analysis
3. **Simulation Tool**: Onboard mini-simulation environment with containment protocols
4. **Contextual Awareness Tool**: Cross-platform memory and semantic continuity
5. **Cross-Platform Tool**: Universal communication protocols and platform bridging
6. **Drift Monitoring Tool**: System stability and coherence tracking
7. **Use Case Adaptation Tool**: Dynamic optimization based on domain context

### Communication Layer
- **Multi-Platform Support**: Native integration with Slack and Telegram platforms
- **Trigger System**: Event-driven architecture for handling incoming messages and platform events
- **API Routes**: RESTful endpoints for webhook handling and external integrations
- **Real-time Communication**: Server-sent events for live updates and notifications

### Development and Deployment
- **TypeScript**: Full type safety across the entire application
- **ES Modules**: Modern module system with bundler-compatible module resolution
- **Development Tools**: Mastra CLI for development, building, and local testing
- **Code Quality**: Prettier formatting and TypeScript checking
- **Playground Interface**: Built-in UI for testing and development

## External Dependencies

### Core Dependencies
- **@mastra/core**: Primary framework for agent orchestration and tool management
- **@mastra/inngest**: Workflow engine integration for background processing and event handling
- **@mastra/pg**: PostgreSQL adapter for persistent storage and data management
- **@mastra/memory**: Memory management system for agent context and conversation history
- **@mastra/loggers**: Structured logging with Pino integration for production monitoring

### AI and Language Models
- **@ai-sdk/openai**: OpenAI integration for language model access (GPT-4, GPT-3.5-turbo)
- **@openrouter/ai-sdk-provider**: Alternative AI provider for model diversity and fallback options
- **ai**: Vercel AI SDK for standardized AI model interactions

### Platform Integrations
- **@slack/web-api**: Official Slack Web API client for message handling and bot interactions
- **Telegram Bot API**: Webhook-based integration for Telegram messaging platform
- **exa-js**: External search and research capabilities integration

### Workflow and Event Processing
- **inngest**: Event-driven workflow orchestration with retry logic and error handling
- **@inngest/realtime**: Real-time event streaming for live updates and notifications
- **inngest-cli**: Command-line tools for workflow development and debugging

### Database and Storage
- **@types/pg**: PostgreSQL type definitions for type-safe database operations
- **@mastra/libsql**: Alternative database adapter for SQLite compatibility
- **zod**: Runtime type validation and schema definition for data integrity

### Development and Utilities
- **typescript**: Static type checking and enhanced developer experience
- **tsx**: TypeScript execution environment for development and testing
- **dotenv**: Environment variable management for configuration
- **pino**: High-performance JSON logging for production monitoring
- **prettier**: Code formatting for consistent style across the codebase

### MCP Integration
- **@mastra/mcp**: Model Context Protocol support for advanced AI model interactions and tool coordination