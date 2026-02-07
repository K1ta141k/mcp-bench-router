import {
  DESIGN_ARENA_API_URL,
  LEADERBOARD_CACHE_TTL_MS,
  type CategoryKey,
} from "../config.js";
import type {
  CacheEntry,
  LeaderboardEntry,
  LeaderboardResponse,
} from "../types/index.js";

const cache = new Map<string, CacheEntry<LeaderboardEntry[]>>();

export async function fetchLeaderboard(
  category: CategoryKey = "allcategories"
): Promise<LeaderboardEntry[]> {
  const cached = cache.get(category);
  if (cached && Date.now() - cached.timestamp < LEADERBOARD_CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await fetch(DESIGN_ARENA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ arenaType: "models", category }),
  });

  if (!res.ok) {
    throw new Error(
      `designarena.ai API error: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as LeaderboardResponse;

  if (!json.success) {
    throw new Error(
      `designarena.ai returned success=false for category "${category}"`
    );
  }

  const entries = json.data.sort((a, b) => b.elo - a.elo);

  cache.set(category, { data: entries, timestamp: Date.now() });

  return entries;
}

export function clearLeaderboardCache(): void {
  cache.clear();
}
