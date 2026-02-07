import { z } from "zod";
import { VALID_CATEGORIES, type CategoryKey, categoryDisplayName, categoryDescription, buildCategoryParamDescription } from "../config.js";
import { fetchLeaderboard } from "../services/leaderboard.js";
import { mapArenaToOpenRouter, findFirstAvailable } from "../services/model-mapper.js";

export const getBestDesignModelSchema = {
  category: z
    .enum(VALID_CATEGORIES as [CategoryKey, ...CategoryKey[]])
    .optional()
    .describe(buildCategoryParamDescription()),
};

export async function getBestDesignModel(args: {
  category?: CategoryKey;
}): Promise<string> {
  const category = args.category ?? "allcategories";
  const entries = await fetchLeaderboard(category);

  if (entries.length === 0) {
    return `No models found for category "${categoryDisplayName(category)}".`;
  }

  const top = entries[0];
  const mapping = await mapArenaToOpenRouter(top.modelId);

  const lines: string[] = [];
  lines.push(`## Best Design Model — ${categoryDisplayName(category)}`);
  lines.push(`> ${categoryDescription(category)}`);
  lines.push("");
  lines.push(`**#1: ${top.modelId}**`);
  lines.push(`- Elo: ${top.elo}`);
  lines.push(`- Win Rate: ${top.winRate}%`);
  lines.push(`- Battles: ${top.battles}`);

  if (mapping) {
    lines.push(`- OpenRouter ID: \`${mapping.openRouterId}\``);
    lines.push("");
    lines.push(
      `This model is available on OpenRouter. Use \`query_design_model\` to send it a prompt.`
    );
  } else {
    lines.push(`- OpenRouter ID: Not available (codename/unreleased model)`);

    const alt = await findFirstAvailable(entries);
    if (alt) {
      const rank = entries.indexOf(alt.entry) + 1;
      lines.push("");
      lines.push(`**Best available alternative: #${rank} ${alt.entry.modelId}**`);
      lines.push(`- Elo: ${alt.entry.elo}`);
      lines.push(`- Win Rate: ${alt.entry.winRate}%`);
      lines.push(`- OpenRouter ID: \`${alt.mapping.openRouterId}\``);
      lines.push("");
      lines.push(
        `Use \`query_design_model\` to automatically route to the best available model.`
      );
    }
  }

  return lines.join("\n");
}
