# mcp-bench-router

MCP server that delegates design tasks to whichever model currently tops [designarena.ai](https://www.designarena.ai)'s crowdsourced leaderboard, via [OpenRouter](https://openrouter.ai).

## Why?

AI coding assistants produce mediocre frontend/design output. designarena.ai maintains a live leaderboard of the best design models, updated every 2 hours. This MCP server lets Claude (or any MCP client) automatically route design tasks to the current best model.

## Tools

| Tool | Description |
|------|-------------|
| `get_best_design_model` | Get the current #1 design model, optionally by category |
| `get_leaderboard` | Browse full rankings with category filter and pagination |
| `query_design_model` | Send a prompt to the best available model via OpenRouter |
| `query_specific_model` | Send a prompt to a specific model via OpenRouter |

## Setup

### Prerequisites

- Node.js >= 18
- An [OpenRouter API key](https://openrouter.ai/keys) (required for `query_design_model` and `query_specific_model`)

### Claude Code (CLI)

```bash
claude mcp add mcp-bench-router -s user -e OPENROUTER_API_KEY=sk-or-... -- npx -y mcp-bench-router
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "mcp-bench-router": {
      "command": "npx",
      "args": ["-y", "mcp-bench-router"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-..."
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "mcp-bench-router": {
      "command": "npx",
      "args": ["-y", "mcp-bench-router"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-..."
      }
    }
  }
}
```

### Other MCP clients

```bash
OPENROUTER_API_KEY=sk-or-... npx -y mcp-bench-router
```

### From source

```bash
git clone https://github.com/K1ta141k/mcp-bench-router.git
cd mcp-bench-router
npm install
npm run build
```

## Categories

Filter by design category: `allcategories`, `website`, `gamedev`, `3d`, `dataviz`, `uicomponent`, `image`, `logo`, `svg`, `video`, `imagetoimage`, `slides`, `graphicdesign`, `tts`.

## Usage Examples

**Check who's #1:**
> "Use get_best_design_model to see the current top design model"

**Browse rankings:**
> "Show me the top 20 design models for websites"

**Generate a design:**
> "Use query_design_model to create a landing page for a SaaS product"

**Use a specific model:**
> "Use query_specific_model with claude-sonnet-4-5 to design a dashboard"

## How It Works

1. Fetches live rankings from designarena.ai's API (cached 2hr)
2. Maps arena model names to OpenRouter IDs (static + dynamic + fuzzy matching)
3. Skips codename/unreleased models and picks the best available one
4. Routes the prompt through OpenRouter's API

## License

MIT
