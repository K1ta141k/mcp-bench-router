import { z } from "zod";
import { VALID_CATEGORIES, type CategoryKey, categoryDisplayName, categoryDescription, buildCategoryParamDescription } from "../config.js";
import { fetchLeaderboard } from "../services/leaderboard.js";
import { mapArenaToOpenRouter, getCodenameDisplayName } from "../services/model-mapper.js";

export const getLeaderboardSchema = {
  category: z
    .enum(VALID_CATEGORIES as [CategoryKey, ...CategoryKey[]])
    .optional()
    .describe(buildCategoryParamDescription()),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Number of entries to return (1-50). Defaults to 10."),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Number of entries to skip. Defaults to 0."),
};

export async function getLeaderboard(args: {
  category?: CategoryKey;
  limit?: number;
  offset?: number;
}): Promise<string> {
  const category = args.category ?? "allcategories";
  const limit = args.limit ?? 10;
  const offset = args.offset ?? 0;

  const entries = await fetchLeaderboard(category);
  const sliced = entries.slice(offset, offset + limit);

  if (sliced.length === 0) {
    return `No models found for category "${categoryDisplayName(category)}" at offset ${offset}.`;
  }

  const lines: string[] = [];
  lines.push(`## Design Arena Leaderboard — ${categoryDisplayName(category)}`);
  lines.push(`> ${categoryDescription(category)}`);
  lines.push("");
  lines.push(`Showing ${offset + 1}–${offset + sliced.length} of ${entries.length}`);
  lines.push("");
  lines.push("| Rank | Model | Elo | Win Rate | Battles | OpenRouter ID |");
  lines.push("|------|-------|-----|----------|---------|---------------|");

  for (let i = 0; i < sliced.length; i++) {
    const e = sliced[i];
    const rank = offset + i + 1;
    const mapping = await mapArenaToOpenRouter(e.modelId);
    const displayName = getCodenameDisplayName(e.modelId);
    const modelLabel = displayName ? `${e.modelId} (${displayName})` : e.modelId;
    const orId = mapping ? `\`${mapping.openRouterId}\`` : "—";
    lines.push(
      `| ${rank} | ${modelLabel} | ${e.elo} | ${e.winRate}% | ${e.battles} | ${orId} |`
    );
  }

  return lines.join("\n");
}
