# AuroraOS

Aurora's TypeScript/Mastra agent spoke. This repository is separate from the
Aurora / ORIONCORE workspace control plane and the CloudBank API.

## Development

Use Node.js 22 LTS and npm 10 or later.

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
```

`check` runs TypeScript without emitting files. CI checks types, runs the
symbolic export tests, and builds the production bundle in `.mastra/output`.

The lockfile includes optional native packages for all supported platforms so
`npm ci` works from a fresh checkout, including Linux CI.

## Symbolic exports

The [symbolic export tools](docs/symbolic-exports.md) seal JSON snapshots, index
T1 and SRB references, and generate optional glyphcards. Callers opt in through
the public TypeScript API or the CLI.

## Runtime configuration

Configure secrets locally in an ignored `.env` file or through your runtime's
secret manager. Do not commit credentials.

- `OPENAI_API_KEY` and optional `OPENAI_BASE_URL`: agent model access.
- `DATABASE_URL`: PostgreSQL storage; defaults to `postgresql://localhost:5432/mastra`.
- `PERPLEXITY_API_KEY`: the Perplexity research tool.
- Telegram and Slack triggers have separate integration settings; inspect
  `src/triggers/` before enabling them. Slack currently uses Replit connectors.
- Inngest production serving depends on the deployment environment; see
  `src/mastra/inngest/`.

Type checking and bundling do not verify live model, database, webhook, Slack,
Telegram, or Inngest connectivity. Configure and verify those integrations
before treating the spoke as operational. `replit.md` contains the earlier
Replit-specific development notes.
