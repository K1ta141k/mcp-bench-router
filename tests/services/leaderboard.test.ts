import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchLeaderboard, clearLeaderboardCache } from "../../src/services/leaderboard.js";

const mockEntries = [
  {
    modelId: "claude-sonnet-4-5",
    wins: 9000,
    losses: 6000,
    battles: 15000,
    winRate: 60,
    elo: 1300,
    btStdErr: null,
    avgGenerationTimeMs: 90000,
    insufficientVotes: false,
  },
  {
    modelId: "riftrunner",
    wins: 11000,
    losses: 5000,
    battles: 16000,
    winRate: 68.75,
    elo: 1350,
    btStdErr: null,
    avgGenerationTimeMs: 90000,
    insufficientVotes: false,
  },
];

const mockResponse = {
  success: true,
  arenaType: "models",
  category: "allcategories",
  data: mockEntries,
  metadata: { lastUpdateTime: "2025-01-01T00:00:00Z", totalVotes: 100000 },
  timestamp: "2025-01-01T00:00:00Z",
};

beforeEach(() => {
  clearLeaderboardCache();
  vi.restoreAllMocks();
});

describe("fetchLeaderboard", () => {
  it("fetches and sorts entries by elo descending", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    const entries = await fetchLeaderboard("allcategories");

    expect(entries).toHaveLength(2);
    expect(entries[0].modelId).toBe("riftrunner");
    expect(entries[1].modelId).toBe("claude-sonnet-4-5");
    expect(entries[0].elo).toBeGreaterThanOrEqual(entries[1].elo);
  });

  it("caches results and reuses on second call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    await fetchLeaderboard("allcategories");
    await fetchLeaderboard("allcategories");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("uses separate cache per category", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response(JSON.stringify(mockResponse), { status: 200 })
    );

    await fetchLeaderboard("allcategories");
    await fetchLeaderboard("website");

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("throws on HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Server Error", { status: 500, statusText: "Internal Server Error" })
    );

    await expect(fetchLeaderboard("allcategories")).rejects.toThrow(
      "designarena.ai API error: 500"
    );
  });

  it("throws on success=false response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...mockResponse, success: false }),
        { status: 200 }
      )
    );

    await expect(fetchLeaderboard("allcategories")).rejects.toThrow(
      'success=false'
    );
  });
});
