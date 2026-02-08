import { z } from "zod";
import { VALID_CATEGORIES, type CategoryKey, categoryDisplayName, categoryDescription, buildCategoryParamDescription } from "../config.js";
import { fetchLeaderboard } from "../services/leaderboard.js";
import { findFirstAvailable } from "../services/model-mapper.js";
import { chatCompletion } from "../services/openrouter.js";

export const queryDesignModelSchema = {
  prompt: z.string().describe("The design prompt to send to the best available model."),
  category: z
    .enum(VALID_CATEGORIES as [CategoryKey, ...CategoryKey[]])
    .optional()
    .describe(buildCategoryParamDescription("Design category to select the best model from")),
  max_tokens: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Maximum tokens in the response."),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe("Sampling temperature (0-2)."),
};

export async function queryDesignModel(args: {
  prompt: string;
  category?: CategoryKey;
  max_tokens?: number;
  temperature?: number;
}): Promise<string> {
  const category = args.category ?? "allcategories";
  const entries = await fetchLeaderboard(category);
  const best = await findFirstAvailable(entries);

  if (!best) {
    return `No models available on OpenRouter for category "${categoryDisplayName(category)}".`;
  }

  const rank = entries.indexOf(best.entry) + 1;

  const response = await chatCompletion(best.mapping.openRouterId, args.prompt, {
    maxTokens: args.max_tokens,
    temperature: args.temperature,
  });

  const content = response.choices?.[0]?.message?.content ?? "(empty response)";

  const lines: string[] = [];
  const displayName = best.mapping.displayName;
  const modelLabel = displayName ? `${best.entry.modelId} (${displayName})` : best.entry.modelId;
  lines.push(`**Model:** ${modelLabel} (#${rank} in ${categoryDisplayName(category)})`);
  lines.push(`**Category:** ${categoryDescription(category)}`);
  lines.push(`**OpenRouter ID:** \`${best.mapping.openRouterId}\``);
  lines.push(`**Elo:** ${best.entry.elo} | **Win Rate:** ${best.entry.winRate}%`);
  if (response.usage) {
    lines.push(
      `**Tokens:** ${response.usage.prompt_tokens} prompt + ${response.usage.completion_tokens} completion`
    );
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(content);

  return lines.join("\n");
}
