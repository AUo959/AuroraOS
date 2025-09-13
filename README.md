# AuroraOS

Advanced AI Operating System with symbolic reasoning capabilities.

## Features

- **Mastra Integration**: Built on the Mastra framework for scalable AI workflows
- **Symbolic Cognition**: Advanced symbolic reasoning and pattern recognition
- **Multi-platform Support**: Slack, Telegram, and web integrations
- **Aurora Agent**: Intelligent assistant with contextual awareness

## Glyphcards & Export Policy

AuroraOS includes opt-in security features for export control and audit trails:

### Export Guard

Export Guard provides policy-driven validation for outbound data:

```typescript
import { guardExport } from "@auroraos/core";

const result = await guardExport(data, {
  policy: "warn", // off | warn | strict
  makeGlyphcard: true
});
```

### Environment Flags

```bash
# Export policy: off|warn|strict (default: warn)
AURORA_EXPORT_POLICY=warn

# Enable glyphcard generation: 0|1 (default: 0)
AURORA_GLYPHCARDS=1

# Redact sensitive content: 0|1 (default: 1)
AURORA_GLYPHCARD_REDACT=1
```

### Policy Levels

- **off**: No validation or requirements
- **warn**: Validation with warnings, auto-attach missing manifests
- **strict**: Explicit manifests required, fail on validation errors

### Usage Examples

```bash
# Create snapshot with glyphcard
npm run snapshot --glyphcard '{"data": "example"}'

# Generate glyphcard from sealed bundle
echo '{"artifact":{},"manifest":{},"seal":{}}' | npm run glyphcard

# Read from file
npm run glyphcard --file sealed-bundle.json
```

See [docs/GLYPHCARDS.md](docs/GLYPHCARDS.md) for detailed documentation.

## Installation

```bash
npm install
npm run dev
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Development

```bash
# Type checking
npm run check

# Format code
npm run format

# Run tests
npm test
```

## Architecture

- `src/mastra/`: Mastra framework integration
- `src/symbolic/`: Symbolic reasoning modules
- `src/triggers/`: Platform integrations
- `scripts/`: CLI utilities
- `tests/`: Test suites