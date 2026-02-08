import { z } from "zod";
import { mapArenaToOpenRouter, getCodenameDisplayName } from "../services/model-mapper.js";
import { chatCompletion } from "../services/openrouter.js";

export const querySpecificModelSchema = {
  prompt: z.string().describe("The design prompt to send to the model."),
  model: z
    .string()
    .describe(
      'Model identifier. Can be an OpenRouter ID (e.g. "anthropic/claude-sonnet-4-5-20250514") or a Design Arena model name (e.g. "claude-sonnet-4-5").'
    ),
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

export async function querySpecificModel(args: {
  prompt: string;
  model: string;
  max_tokens?: number;
  temperature?: number;
}): Promise<string> {
  let openRouterId: string;

  // If the model contains a slash, treat it as an OpenRouter ID directly
  if (args.model.includes("/")) {
    openRouterId = args.model;
  } else {
    const mapping = await mapArenaToOpenRouter(args.model);
    if (!mapping) {
      const displayName = getCodenameDisplayName(args.model);
      if (displayName) {
        return `"${args.model}" (${displayName}) is not yet available on OpenRouter. Try using a direct OpenRouter ID (e.g. "provider/model-name").`;
      }
      return `Could not find OpenRouter mapping for model "${args.model}". This model may be a codename or unreleased. Try using a direct OpenRouter ID (e.g. "provider/model-name").`;
    }
    openRouterId = mapping.openRouterId;
  }

  const response = await chatCompletion(openRouterId, args.prompt, {
    maxTokens: args.max_tokens,
    temperature: args.temperature,
  });

  const content = response.choices?.[0]?.message?.content ?? "(empty response)";

  const lines: string[] = [];
  lines.push(`**Model:** \`${openRouterId}\``);
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
