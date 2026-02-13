# Scuttle

Monorepo for the Scuttle Discord bot, API, and web app.

Scuttle is a Discord bot that tracks League of Legends player statistics, providing match history, rankings, and performance insights.

## Packages

| Package | Description |
|---------|-------------|
| [`@scuttle/api`](packages/api) | Express backend API — fetches and caches Riot Games data |
| [`@scuttle/bot`](packages/bot) | Discord bot — slash commands for player stats and rankings |
| [`@scuttle/web`](packages/web) | React frontend — web dashboard at scuttle.gg |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the API server (port 4000)
pnpm dev:api

# Start the Discord bot
pnpm dev:bot

# Start the web dev server
pnpm dev:web

# Build all packages
pnpm build
```

## Tech Stack

- **API**: Express, TypeScript, Prisma, Supabase (PostgreSQL)
- **Bot**: Discord.js
- **Web**: React, Tailwind CSS
- **Tooling**: pnpm workspaces
