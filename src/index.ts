import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  getBestDesignModelSchema,
  getBestDesignModel,
} from "./tools/get-best-design-model.js";
import {
  getLeaderboardSchema,
  getLeaderboard,
} from "./tools/get-leaderboard.js";
import {
  queryDesignModelSchema,
  queryDesignModel,
} from "./tools/query-design-model.js";
import {
  querySpecificModelSchema,
  querySpecificModel,
} from "./tools/query-specific-model.js";

const server = new McpServer({
  name: "mcp-bench-router",
  version: "1.0.0",
});

server.tool(
  "get_best_design_model",
  "Get the current #1 design model from designarena.ai's crowdsourced leaderboard, optionally filtered by category. Returns model info and OpenRouter availability.",
  getBestDesignModelSchema,
  async (args) => {
    try {
      const text = await getBestDesignModel(args);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [
          { type: "text", text: `Error: ${(err as Error).message}` },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_leaderboard",
  "Browse the full designarena.ai design model rankings with optional category filter and pagination. Shows Elo ratings, win rates, and OpenRouter availability.",
  getLeaderboardSchema,
  async (args) => {
    try {
      const text = await getLeaderboard(args);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [
          { type: "text", text: `Error: ${(err as Error).message}` },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "query_design_model",
  "Send a design prompt to the best available model on OpenRouter, automatically selected from designarena.ai rankings. Skips models not available on OpenRouter. Requires OPENROUTER_API_KEY.",
  queryDesignModelSchema,
  async (args) => {
    try {
      const text = await queryDesignModel(args);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [
          { type: "text", text: `Error: ${(err as Error).message}` },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "query_specific_model",
  "Send a design prompt to a specific model via OpenRouter. Accepts either an OpenRouter model ID (e.g. 'anthropic/claude-sonnet-4-5-20250514') or a Design Arena model name (e.g. 'claude-sonnet-4-5'). Requires OPENROUTER_API_KEY.",
  querySpecificModelSchema,
  async (args) => {
    try {
      const text = await querySpecificModel(args);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [
          { type: "text", text: `Error: ${(err as Error).message}` },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
