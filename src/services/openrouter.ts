import {
  OPENROUTER_API_BASE,
  OPENROUTER_API_KEY,
  MODEL_LIST_CACHE_TTL_MS,
} from "../config.js";
import type {
  CacheEntry,
  OpenRouterModel,
  OpenRouterModelsResponse,
  OpenRouterChatResponse,
} from "../types/index.js";

let modelListCache: CacheEntry<OpenRouterModel[]> | null = null;

export async function fetchModelList(): Promise<OpenRouterModel[]> {
  if (
    modelListCache &&
    Date.now() - modelListCache.timestamp < MODEL_LIST_CACHE_TTL_MS
  ) {
    return modelListCache.data;
  }

  const res = await fetch(`${OPENROUTER_API_BASE}/models`);

  if (!res.ok) {
    throw new Error(`OpenRouter models API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as OpenRouterModelsResponse;
  const models = json.data;

  modelListCache = { data: models, timestamp: Date.now() };

  return models;
}

export async function chatCompletion(
  model: string,
  prompt: string,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<OpenRouterChatResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Set it as an environment variable to use query tools."
    );
  }

  const res = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://github.com/mcp-bench-router",
      "X-Title": "mcp-bench-router",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      ...(options.maxTokens != null && { max_tokens: options.maxTokens }),
      ...(options.temperature != null && { temperature: options.temperature }),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} ${res.statusText} — ${body}`);
  }

  return (await res.json()) as OpenRouterChatResponse;
}

export function clearModelListCache(): void {
  modelListCache = null;
}
