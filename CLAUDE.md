# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a pnpm monorepo with three packages:
- **packages/api** (`@scuttle/api`): Backend Express API server
- **packages/bot** (`@scuttle/bot`): Discord bot
- **packages/web** (`@scuttle/web`): React frontend

## Development Commands

**API dev server**: `pnpm dev:api` (runs packages/api/server.ts with tsx watch on port 4000)
**Bot**: `pnpm dev:bot` (runs packages/bot/index.js)
**Web dev server**: `pnpm dev:web` (runs React dev server)
**Build all**: `pnpm build`
**Install deps**: `pnpm install` (from root)

## API Package (packages/api)

Scuttle API is a backend service for a Discord bot that tracks League of Legends player statistics. The API manages Discord guilds, summoners (League players), and their match data, integrating with the Riot Games API to fetch and cache player performance.

**Database**: Supabase (PostgreSQL)
**ORM**: Prisma
**Language**: TypeScript
**Deployment**: Vercel (configured via vercel.json)
**Authentication**: API key-based (x-api-key header, validated via middleware)

## Architecture

### Entry Point & Server Setup

- **packages/api/server.ts**: Express app entry point that:
  - Configures CORS for allowed origins (localhost, scuttle.gg domains)
  - Applies global API key verification middleware (`packages/api/middlewares/auth.ts`)
  - Mounts route handlers for all API endpoints
  - Initializes cron jobs after server starts listening

### Database & ORM

- **packages/api/utils/prisma.ts**: Singleton Prisma client instance
  - Database: Supabase PostgreSQL
  - Connection string from `DATABASE_URL` environment variable
  - All models import and use the shared `prisma` client
  - Schema defined in `packages/api/prisma/schema.prisma`

### Data Model Structure

The API package follows a model-route pattern where:
- **packages/api/models/**: Contains business logic and database operations using Prisma
- **packages/api/routes/**: Contains Express route handlers that call model functions
- **packages/api/types/**: Centralized TypeScript type definitions
- Paired files: `models/summoners.ts` ↔ `routes/summoners.ts`, etc.

**Key Database Tables** (see packages/api/prisma/schema.prisma):

- **guilds**: Discord server information
  - Fields: `id` (UUID), `name`, `guild_id` (BigInt), `main_channel_id`, `date_added`

- **summoners**: League of Legends player information
  - Fields: `id` (UUID), `name`, `puuid` (unique), `region`, `last_cached`

- **guild_summoners**: Many-to-many relationship between guilds and summoners
  - Fields: `guild_id`, `summoner_id` (composite primary key)

- **ranked_solo_match**: Cached match data for ranked solo queue (queueId=420)
  - Over 60 fields tracking detailed player performance
  - Fields include: `match_id`, `summoner_puuid`, `game_start_timestamp`, `game_duration`, `win`, kills/deaths/assists, vision score, damage dealt, CS stats, etc.
  - Indexed on `summoner_puuid` and `game_start_timestamp` for efficient queries

- **command_analytics**: Tracks command usage statistics
  - Fields: `command_name`, `times_called`

### Regional Architecture

The Riot API has two types of endpoints:
- **Platform endpoints** (region-specific): Use `na1`, `euw1`, `kr`, etc. for summoner data
- **Regional endpoints** (clustered): Use `americas`, `asia`, `europe`, `sea` for match data

**packages/api/utils/processing.ts** contains `getAreaFromRegion()` to map platform regions to regional endpoints.

### Cron Jobs (packages/api/jobs/index.ts)

Three scheduled tasks run after server initialization:
1. **Hourly (0 * * * *)**: Cache match data for all summoners across all guilds
   - Fetches last 30 days of ranked solo queue (queueId=420) matches
   - Skips summoners cached within last 24 hours (only fetches 1 day)
   - Uses 5-day increments to stay within API rate limits
   - Deduplicates before inserting into database
2. **Daily at 5 AM (0 5 * * *)**: Delete matches older than 31 days
3. **Sundays at 3 AM (0 3 * * 0)**: Delete orphaned matches for summoners no longer in any guild

### Match Data Processing

**packages/api/utils/processing.ts - processMatchData()**:
- Riot API returns match data with all 10 participants
- This function filters to keep only the requested summoner's participant data
- Returns structured data matching the RankedSoloMatch Prisma schema
- Extracts participant stats from both top-level participant object and nested challenges
- Field locations are critical:
  - `visionScore`, `enemyMissingPings`: On participant object directly
  - `controlWardsPlaced`, `soloKills`, etc.: Inside participant.challenges
  - `totalDamageDealtToChampions`, `kda`: On participant object
- Reduces document size significantly for storage optimization

### API Routes

All routes protected by API key middleware. Routes follow REST conventions:

- **/guilds**: Guild CRUD operations, guild count, main channel management
- **/summoners**: Summoner management (add/remove from guilds), caching status, unique summoner counts
- **/matches**: Fetch cached match data by PUUID and date range, with queue type filtering
- **/stats**: Player statistics calculations from cached matches
- **/riot**: Riot ID validation and PUUID fetching
- **/reports**: Match report generation
- **/rankings**: Leaderboard/ranking calculations
- **/topgg**: Top.gg integration endpoints
- **/hours**: Hours tracking and playtime calculations
- **/commands**: Command usage analytics

### Environment Variables

Required in `packages/api/.env`:
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `RIOT_API_KEY`: Riot Games API key (RGAPI-*)
- `SCUTTLE_API_KEY`: API key for authenticating incoming requests
- `TOPGG_ID`: Top.gg bot ID
- `TOPGG_TOKEN`: Top.gg authentication token
- `PORT`: Optional server port (defaults to 4000)

**IMPORTANT**: Never commit `.env` file. It's gitignored but contains sensitive credentials.

### BigInt Handling

Discord IDs (guild_id, main_channel_id) are stored as PostgreSQL BIGINT to preserve full 64-bit precision:
- Prisma represents these as `BigInt` type in TypeScript
- Convert to BigInt using `BigInt(stringValue)`
- Convert to string for API responses using `.toString()`

### Riot API Integration

**packages/api/models/riot.ts** provides core Riot API utilities:
- `checkRiotIdFormat(riotId)`: Validates "GameName #Tag" format
- `fetchSummonerPuuidByRiotId(riotId)`: Gets PUUID from Riot ID (uses americas endpoint)
- `getSummonerRegion(puuid)`: Iterates through all regions to find summoner's home region

### Queue Type Mapping

**packages/api/models/matches.ts** exports `QUEUE_ID_MAP` object mapping friendly queue names to Riot queue IDs:
- `ranked_solo: 420` (most commonly used, stored in `ranked_solo_match` table)
- `ranked_flex: 440`
- `normal_draft: 400`
- `aram: 450`
- Plus 50+ special/event queue types

Use this when filtering matches by queue type in queries.

## Common Patterns

### Adding a New Summoner Flow

1. Validate Riot ID format (`models/riot.ts - checkRiotIdFormat()`)
2. Fetch PUUID from Riot API (`fetchSummonerPuuidByRiotId()`)
3. Determine region by checking all region endpoints (`getSummonerRegion()`)
4. Create or find summoner record using Prisma upsert
5. Create guild_summoner relationship to link summoner to guild

### Fetching Match Data

Two primary query patterns in `models/matches.ts`:
- `fetchAllSummonerMatchDataByRange(puuid, range, queueType)`: Last N days
- `fetchAllSummonerMatchDataSinceDate(puuid, startDate, queueType)`: From specific date

Both use Prisma's indexed queries on `summoner_puuid` and `game_start_timestamp` for performance.

### Error Handling

Routes use try-catch blocks returning appropriate HTTP status codes with user-friendly messages on failure. Console.error logs technical details for debugging. All route handlers must explicitly return from all code paths (enforced by TypeScript strict mode).

## Code Style

- TypeScript with strict mode enabled (noImplicitReturns, noUnusedParameters, noUnusedLocals)
- ES6 modules (type: "module" in package.json)
- Import syntax with .js extensions required for compiled output
- Async/await throughout (no Promise chains)
- Comprehensive JSDoc comments on all exported functions
- Chalk library used for colorful console logging in cron jobs
- All Express route handlers must explicitly `return` from all code paths
- Unused parameters prefixed with underscore (e.g., `_req`)

## Database Schema Management

### Prisma Migrations

- **Generate migration**: `npx prisma migrate dev --name migration_name`
- **Apply migrations**: `npx prisma migrate deploy`
- **Reset database**: `npx prisma migrate reset` (WARNING: deletes all data)
- **View schema**: `npx prisma studio` (opens GUI at http://localhost:5555)

### Adding New Fields

1. Update `packages/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name` (from packages/api/)
3. Prisma Client types automatically update
4. Update TypeScript models and routes as needed

### Type Safety

Prisma generates TypeScript types from schema.prisma:
- Import types: `import { RankedSoloMatch, Summoner } from '@prisma/client'`
- Use `Prisma.SummonerCreateInput` for input types
- Prisma Client provides full autocomplete and type checking
