# mcp-bench-router

MCP server that routes design tasks to designarena.ai's current top-ranked model via OpenRouter.

## Architecture

- **Transport:** stdio (MCP standard)
- **4 MCP tools:** `get_best_design_model`, `get_leaderboard`, `query_design_model`, `query_specific_model`
- **3 services:** `leaderboard.ts` (designarena.ai API + 2hr cache), `openrouter.ts` (chat completions + 24hr model list cache), `model-mapper.ts` (3-tier arena→OpenRouter ID mapping)

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | MCP server entry — registers 4 tools, stdio transport |
| `src/services/model-mapper.ts` | 3-tier mapping: static table (100+ entries) → dynamic provider-prefix lookup → fuzzy match |
| `src/services/leaderboard.ts` | `POST /api/leaderboard` with `{arenaType: "models", category}`, sorts by ELO desc, 2hr cache |
| `src/services/openrouter.ts` | Chat completions + model list fetch, 24hr model list cache |
| `src/config.ts` | API URLs, cache TTLs, 14 valid categories |
| `src/types/index.ts` | TypeScript interfaces for all data structures |
| `src/tools/*.ts` | Individual tool implementations |

## Commands

```bash
npm run build    # tsc → dist/
npm test         # vitest run (16 tests across 3 service suites)
npm run dev      # tsx src/index.ts (live reload)
npm run test:watch  # vitest watch mode
```

## Categories (14)

`allcategories`, `website`, `gamedev`, `3d`, `dataviz`, `uicomponent`, `image`, `logo`, `svg`, `video`, `imagetoimage`, `slides`, `graphicdesign`, `tts`

Each category has a `{displayName, description}` object in `src/config.ts` explaining what the benchmark tests (output format, evaluation criteria). Helper functions `categoryDisplayName()`, `categoryDescription()`, and `buildCategoryParamDescription()` surface these in tool schemas and outputs.

## Model Mapping Details

The mapper converts designarena.ai model names to OpenRouter IDs:

1. **Static table** — hardcoded for known mismatches (e.g. `claude-sonnet-4-5` → `anthropic/claude-sonnet-4.5`)
2. **Dynamic lookup** — tries provider prefixes (`openai/`, `anthropic/`, `google/`, etc.) against live OpenRouter model list
3. **Fuzzy match** — normalizes strings and compares slugs as fallback

OpenRouter IDs use **dot notation** (e.g. `anthropic/claude-sonnet-4.5`, not `claude-sonnet-4-5-20250514`).

Codename models (`riftrunner`, `candycane`, `mumble`, `rockhopper`, `macaroni`, `honeycomb`) return `null` — the tools automatically fall back to the next best available model.

## API Details

DesignArena leaderboard endpoint:
- `POST https://www.designarena.ai/api/leaderboard`
- Body: `{ arenaType: "models", category: "<category>" }`
- Response includes: `modelId`, `elo`, `wins`, `losses`, `battles`, `winRate`, `avgGenerationTimeMs`

## MCP Configuration

Config lives in `~/.claude.json` under:
```
projects["/home/codren/mcp_bench_router"].mcpServers
```

Requires `OPENROUTER_API_KEY` environment variable for `query_design_model` and `query_specific_model` tools.

## Dependencies

- `@modelcontextprotocol/sdk` — MCP protocol
- `zod` — tool argument validation
- `tsx` (dev) — TypeScript runner
- `vitest` (dev) — test framework

## Stack

TypeScript, ES2022, Node16 modules, strict mode. Build target: `dist/`. Entry binary: `bin/mcp-bench-router.js`.
