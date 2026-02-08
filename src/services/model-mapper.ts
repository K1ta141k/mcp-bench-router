import type { LeaderboardEntry, ModelMapping, OpenRouterModel } from "../types/index.js";
import { fetchModelList } from "./openrouter.js";

// Tier 1: Static map for known naming mismatches
const STATIC_MAP: Record<string, string> = {
  // Anthropic
  "claude-opus-4-5": "anthropic/claude-opus-4.5",
  "claude-sonnet-4-5": "anthropic/claude-sonnet-4.5",
  "claude-sonnet-4-5-thinking": "anthropic/claude-sonnet-4.5",
  "claude-3.7-sonnet": "anthropic/claude-3.7-sonnet",
  "claude-opus-4": "anthropic/claude-opus-4",
  "claude-sonnet-4": "anthropic/claude-sonnet-4",
  "claude-sonnet-4-thinking": "anthropic/claude-sonnet-4",
  "claude-haiku-4-5": "anthropic/claude-haiku-4.5",
  "claude-opus-4-1-20250805": "anthropic/claude-opus-4.1",
  "claude-opus-4-1-20250805-thinking": "anthropic/claude-opus-4.1",

  // DeepSeek
  "deepseek-v3p2": "deepseek/deepseek-v3.2",
  "deepseek-v3p2-exp": "deepseek/deepseek-v3.2-exp",
  "deepseek-v3p1": "deepseek/deepseek-chat-v3.1",
  "deepseek-v3p1-thinking": "deepseek/deepseek-chat-v3.1",
  "deepseek-chat": "deepseek/deepseek-chat",
  "deepseek-reasoner-r1": "deepseek/deepseek-r1",

  // OpenAI
  "gpt-5-high": "openai/gpt-5",
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-5-nano": "openai/gpt-5-nano",
  "gpt-5.1-high": "openai/gpt-5.1",
  "gpt-5.1-medium": "openai/gpt-5.1",
  "gpt-5.1-low": "openai/gpt-5.1",
  "gpt-5.1-none": "openai/gpt-5.1",
  "gpt-5.1-codex": "openai/gpt-5.1-codex",
  "gpt-5.1-codex-mini": "openai/gpt-5.1-codex-mini",
  "gpt-4.1": "openai/gpt-4.1",
  "gpt-4.1-mini": "openai/gpt-4.1-mini",
  "gpt-4.1-nano": "openai/gpt-4.1-nano",
  "gpt-4o": "openai/gpt-4o",
  "gpt-oss-120b": "openai/gpt-5", // no exact match, closest available
  "gpt-oss-20b": "openai/gpt-5-nano", // no exact match, closest available

  // Google
  "gemini-2.5-pro": "google/gemini-2.5-pro",
  "gemini-2.5-flash": "google/gemini-2.5-flash",
  "gemini-2.5-flash-preview-09-2025": "google/gemini-2.5-flash-preview-09-2025",
  "gemini-2.5-flash-lite-preview-09-2025": "google/gemini-2.5-flash-lite-preview-09-2025",
  "gemini-3-flash-preview": "google/gemini-3-flash-preview",
  "riftrunner": "google/gemini-3-pro-preview",

  // xAI
  "grok-4": "x-ai/grok-4",
  "grok-4-fast-non-reasoning": "x-ai/grok-4-fast",
  "grok-4-fast-reasoning": "x-ai/grok-4-fast",
  "grok-4-1-fast-non-reasoning": "x-ai/grok-4.1-fast",
  "grok-4-1-fast-reasoning": "x-ai/grok-4.1-fast",
  "grok-3": "x-ai/grok-3",
  "grok-3-mini": "x-ai/grok-3-mini",
  "grok-code-fast-1": "x-ai/grok-code-fast-1",

  // Meta
  "llama-4-maverick": "meta-llama/llama-4-maverick",
  "llama-4-scout": "meta-llama/llama-4-scout",
  "llama-3.1-nemotron-ultra-253b": "nvidia/llama-3.1-nemotron-ultra-253b-v1",

  // Qwen
  "qwen3-235b-a22b": "qwen/qwen3-235b-a22b",
  "qwen3-235b-a22b-instruct-2507": "qwen/qwen3-235b-a22b-2507",
  "qwen3-235B-a22B-thinking-2507": "qwen/qwen3-235b-a22b-thinking-2507",
  "qwen3-30b-a3b": "qwen/qwen3-30b-a3b",
  "qwen3-30b-a3b-thinking-2507": "qwen/qwen3-30b-a3b-thinking-2507",
  "qwen3-coder-480b-a35b-instruct": "qwen/qwen3-coder",
  "qwen3-coder-30b-a3b-instruct": "qwen/qwen3-coder-30b-a3b-instruct",
  "qwen3-max": "qwen/qwen3-max",

  // Mistral
  "mistral-large-2411": "mistralai/mistral-large-2411",
  "mistral-large-2512": "mistralai/mistral-large-2512",
  "mistral-medium-2505": "mistralai/mistral-medium-3",
  "mistral-medium-2508": "mistralai/mistral-medium-3.1",
  "mistral-small-2506": "mistralai/mistral-small-3.2-24b-instruct",
  "codestral-2508": "mistralai/codestral-2508",
  "codestral-2-2501": "mistralai/codestral-2508",
  "devstral-medium-2507": "mistralai/devstral-medium",
  "devstral-small-2507": "mistralai/devstral-small",
  "ministral-14b-2512": "mistralai/ministral-14b-2512",
  "ministral-8b-2512": "mistralai/ministral-8b-2512",
  "ministral-3b-2512": "mistralai/ministral-3b-2512",

  // Moonshot
  "kimi-k2.5": "moonshotai/kimi-k2.5",
  "kimi-k2-thinking": "moonshotai/kimi-k2-thinking",
  "kimi-k2-0905-preview": "moonshotai/kimi-k2-0905",
  "kimi-k2-instruct-0905": "moonshotai/kimi-k2-0905",
  "kimi-k2-turbo-preview": "moonshotai/kimi-k2",
  "kimi-k2-0711-preview": "moonshotai/kimi-k2",

  // Minimax
  "minimax-m2.1": "minimax/minimax-m2.1",
  "minimax-m2-stable": "minimax/minimax-m2",

  // GLM (Zhipu)
  "glm-4.7": "z-ai/glm-4.7",
  "glm-4.7-flash": "z-ai/glm-4.7-flash",
  "glm-4.6": "z-ai/glm-4.6",
  "glm-4.5": "z-ai/glm-4.5",
  "glm-4.5-air": "z-ai/glm-4.5-air",

  // Misc
  "nova-premier-v1": "amazon/nova-premier-v1",
  "nova-pro-v1": "amazon/nova-pro-v1",
  "mimo-v2-flash": "minimax/minimax-m1", // closest available
};

// Display names for codename models with confirmed identities
const CODENAME_DISPLAY_NAMES: Record<string, string> = {
  "riftrunner": "Gemini 3 Pro Preview",
  "obsidian": "Grok 4.20",
};

// Codename models with no public availability on OpenRouter
const CODENAME_MODELS = new Set([
  "obsidian",
  "candycane",
  "mumble",
  "rockhopper",
  "macaroni",
  "honeycomb",
]);

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-._]/g, "");
}

export async function mapArenaToOpenRouter(
  arenaId: string
): Promise<ModelMapping | null> {
  // Skip known codename models
  if (CODENAME_MODELS.has(arenaId)) {
    return null;
  }

  // Tier 1: Static map
  const staticId = STATIC_MAP[arenaId];
  if (staticId) {
    return { arenaId, openRouterId: staticId, source: "static", displayName: CODENAME_DISPLAY_NAMES[arenaId] };
  }

  // Tier 2 & 3: Dynamic lookup against OpenRouter model list
  const models = await fetchModelList();

  // Tier 2: Try provider-prefix patterns
  const providerPrefixes = [
    "openai",
    "anthropic",
    "google",
    "meta-llama",
    "deepseek",
    "mistralai",
    "x-ai",
    "qwen",
    "nvidia",
    "moonshotai",
    "minimax",
    "amazon",
    "vercel",
    "z-ai",
    "cohere",
  ];

  const modelIdSet = new Set(models.map((m) => m.id));

  for (const prefix of providerPrefixes) {
    const candidate = `${prefix}/${arenaId}`;
    if (modelIdSet.has(candidate)) {
      return { arenaId, openRouterId: candidate, source: "dynamic", displayName: CODENAME_DISPLAY_NAMES[arenaId] };
    }
  }

  // Tier 3: Fuzzy normalized match
  const normalizedArena = normalize(arenaId);
  for (const model of models) {
    const modelSlug = model.id.split("/").pop() ?? "";
    if (normalize(modelSlug) === normalizedArena) {
      return { arenaId, openRouterId: model.id, source: "fuzzy", displayName: CODENAME_DISPLAY_NAMES[arenaId] };
    }
  }

  return null;
}

export function getCodenameDisplayName(arenaId: string): string | undefined {
  return CODENAME_DISPLAY_NAMES[arenaId];
}

export async function findFirstAvailable(
  entries: LeaderboardEntry[]
): Promise<{ entry: LeaderboardEntry; mapping: ModelMapping } | null> {
  for (const entry of entries) {
    const mapping = await mapArenaToOpenRouter(entry.modelId);
    if (mapping) {
      return { entry, mapping };
    }
  }
  return null;
}
