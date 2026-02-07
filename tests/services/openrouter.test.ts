import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchModelList, clearModelListCache } from "../../src/services/openrouter.js";

const mockModels = {
  data: [
    { id: "anthropic/claude-sonnet-4-5-20250514", name: "Claude Sonnet 4.5" },
    { id: "openai/gpt-5", name: "GPT-5" },
    { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro" },
  ],
};

beforeEach(() => {
  clearModelListCache();
  vi.restoreAllMocks();
});

describe("fetchModelList", () => {
  it("fetches and returns model list", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockModels), { status: 200 })
    );

    const models = await fetchModelList();

    expect(models).toHaveLength(3);
    expect(models[0].id).toBe("anthropic/claude-sonnet-4-5-20250514");
  });

  it("caches model list on subsequent calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockModels), { status: 200 })
    );

    await fetchModelList();
    await fetchModelList();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("throws on HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Unauthorized", { status: 401, statusText: "Unauthorized" })
    );

    await expect(fetchModelList()).rejects.toThrow(
      "OpenRouter models API error: 401"
    );
  });
});
