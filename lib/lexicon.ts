import evidence from "../server/dictionary/word-evidence.json" with { type: "json" };
import { checkPromptConstraints } from "./engine.ts";
import type { Answer, Prompt, Score } from "./types";

const wordPrompts = new Set([
  "culture-palindromes",
  "culture-double-o",
  "culture-qu-words",
  "culture-z-words",
  "culture-ph-words",
  "culture-less-words",
  "culture-double-e",
]);
const words: Readonly<Record<string, number>> = evidence.words;
export const dictionaryWordCount = evidence.wordCount;

/** Dictionary evidence settles word existence only for literal word-form prompts. */
export function matchDictionaryAnswer(
  prompt: Pick<Prompt, "id">,
  input: string,
): Answer | null {
  if (!wordPrompts.has(prompt.id) || checkPromptConstraints(prompt, input))
    return null;
  const candidate = input
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  const key = candidate
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/’/g, "'");
  if (!/^[a-z]+(?:[-'][a-z]+)*$/.test(key)) return null;
  const score = words[key];
  if (![10, 15, 30, 60, 85, 100].includes(score)) return null;
  return { name: candidate, score: score as Score };
}
