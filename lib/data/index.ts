import { worldPrompts } from "./world.ts";
import { culturePrompts } from "./culture.ts";
import { extraPrompts } from "./extra.ts";
import { wordPatternPrompts } from "./word-patterns.ts";
import { worldExpandedAnswers } from "./world-expanded.ts";
import { extraExpandedAnswers } from "./extra-expanded.ts";
import { mergePromptAnswers } from "./merge.ts";

const prompts = [
  ...worldPrompts,
  ...culturePrompts,
  ...extraPrompts,
  ...wordPatternPrompts,
];
const promptIds = new Set(prompts.map((prompt) => prompt.id));
for (const id of [
  ...Object.keys(worldExpandedAnswers),
  ...Object.keys(extraExpandedAnswers),
]) {
  if (!promptIds.has(id))
    throw new Error(`Expanded answers reference an unavailable prompt: ${id}`);
}
export const builtInPrompts = prompts.map((prompt) =>
  mergePromptAnswers(prompt, [
    ...(worldExpandedAnswers[prompt.id] ?? []),
    ...(extraExpandedAnswers[prompt.id] ?? []),
  ]),
);
