import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mapArenaToOpenRouter,
  findFirstAvailable,
  getCodenameDisplayName,
} from "../../src/services/model-mapper.js";
import * as openrouter from "../../src/services/openrouter.js";
import type { LeaderboardEntry } from "../../src/types/index.js";

const mockModels = [
  { id: "anthropic/claude-sonnet-4-5-20250514", name: "Claude Sonnet 4.5" },
  { id: "openai/gpt-5", name: "GPT-5" },
  { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro" },
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3" },
];

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(openrouter, "fetchModelList").mockResolvedValue(mockModels);
});

describe("mapArenaToOpenRouter", () => {
  it("returns null for codename models", async () => {
    expect(await mapArenaToOpenRouter("obsidian")).toBeNull();
    expect(await mapArenaToOpenRouter("candycane")).toBeNull();
    expect(await mapArenaToOpenRouter("mumble")).toBeNull();
  });

  it("maps riftrunner to google/gemini-3-pro-preview via static table", async () => {
    const result = await mapArenaToOpenRouter("riftrunner");
    expect(result).not.toBeNull();
    expect(result!.openRouterId).toBe("google/gemini-3-pro-preview");
    expect(result!.source).toBe("static");
    expect(result!.displayName).toBe("Gemini 3 Pro Preview");
  });

  it("maps via static table (tier 1)", async () => {
    const result = await mapArenaToOpenRouter("claude-sonnet-4-5");
    expect(result).not.toBeNull();
    expect(result!.openRouterId).toBe("anthropic/claude-sonnet-4.5");
    expect(result!.source).toBe("static");
  });

  it("maps via static table for gpt models", async () => {
    const result = await mapArenaToOpenRouter("gpt-5");
    expect(result).not.toBeNull();
    expect(result!.openRouterId).toBe("openai/gpt-5");
    expect(result!.source).toBe("static");
  });

  it("maps via static table for deepseek", async () => {
    const result = await mapArenaToOpenRouter("deepseek-v3p2");
    expect(result).not.toBeNull();
    expect(result!.openRouterId).toBe("deepseek/deepseek-v3.2");
    expect(result!.source).toBe("static");
  });

  it("returns null for unknown models with no OpenRouter match", async () => {
    const result = await mapArenaToOpenRouter("completely-unknown-model-xyz");
    expect(result).toBeNull();
  });

  it("does not include displayName for non-codename models", async () => {
    const result = await mapArenaToOpenRouter("gpt-5");
    expect(result).not.toBeNull();
    expect(result!.displayName).toBeUndefined();
  });
});

describe("getCodenameDisplayName", () => {
  it("returns display name for known codenames", () => {
    expect(getCodenameDisplayName("riftrunner")).toBe("Gemini 3 Pro Preview");
    expect(getCodenameDisplayName("obsidian")).toBe("Grok 4.20");
  });

  it("returns undefined for non-codename models", () => {
    expect(getCodenameDisplayName("gpt-5")).toBeUndefined();
    expect(getCodenameDisplayName("claude-sonnet-4-5")).toBeUndefined();
  });

  it("returns undefined for unknown codenames", () => {
    expect(getCodenameDisplayName("candycane")).toBeUndefined();
  });
});

describe("findFirstAvailable", () => {
  const makeEntry = (modelId: string, elo: number): LeaderboardEntry => ({
    modelId,
    wins: 1000,
    losses: 500,
    battles: 1500,
    winRate: 66.7,
    elo,
    btStdErr: null,
    avgGenerationTimeMs: 100000,
    insufficientVotes: false,
  });

  it("skips codename models and returns first available", async () => {
    const entries = [
      makeEntry("obsidian", 1350),
      makeEntry("candycane", 1300),
      makeEntry("claude-sonnet-4-5", 1280),
    ];

    const result = await findFirstAvailable(entries);
    expect(result).not.toBeNull();
    expect(result!.entry.modelId).toBe("claude-sonnet-4-5");
    expect(result!.mapping.openRouterId).toBe(
      "anthropic/claude-sonnet-4.5"
    );
  });

  it("returns riftrunner as first available since it now resolves", async () => {
    const entries = [
      makeEntry("riftrunner", 1395),
      makeEntry("claude-sonnet-4-5", 1280),
    ];

    const result = await findFirstAvailable(entries);
    expect(result).not.toBeNull();
    expect(result!.entry.modelId).toBe("riftrunner");
    expect(result!.mapping.openRouterId).toBe("google/gemini-3-pro-preview");
    expect(result!.mapping.displayName).toBe("Gemini 3 Pro Preview");
  });

  it("returns null if no models are available", async () => {
    const entries = [
      makeEntry("obsidian", 1350),
      makeEntry("candycane", 1300),
    ];

    const result = await findFirstAvailable(entries);
    expect(result).toBeNull();
  });

  it("returns the first entry if it is available", async () => {
    const entries = [
      makeEntry("gpt-5", 1350),
      makeEntry("claude-sonnet-4-5", 1300),
    ];

    const result = await findFirstAvailable(entries);
    expect(result).not.toBeNull();
    expect(result!.entry.modelId).toBe("gpt-5");
  });
});
