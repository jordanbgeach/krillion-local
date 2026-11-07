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
  "words-ending-ness",
  "words-ending-ing",
  "words-ending-tion",
]);
const words: Readonly<Record<string, number>> = evidence.words;
export const dictionaryWordCount = evidence.wordCount;
const answerLists = new Map<string, readonly Answer[]>();

/** Cached lists expose the same evidence used for scoring in the searchable bank. */
export function dictionaryAnswersForPrompt(
  prompt: Pick<Prompt, "id">,
): readonly Answer[] {
  if (!wordPrompts.has(prompt.id)) return [];
  const previous = answerLists.get(prompt.id);
  if (previous) return previous;
  const matches = (word: string): boolean => {
    switch (prompt.id) {
      case "culture-qu-words":
        return word.startsWith("qu");
      case "culture-z-words":
        return word.startsWith("z");
      case "culture-less-words":
        return word.endsWith("less");
      case "culture-double-o":
        return word.includes("oo");
      case "culture-double-e":
        return word.includes("ee");
      case "culture-ph-words":
        return word.includes("ph");
      case "words-ending-ness":
        return word.endsWith("ness");
      case "words-ending-ing":
        return word.endsWith("ing");
      case "words-ending-tion":
        return word.endsWith("tion");
      case "culture-palindromes": {
        const letters = word.replace(/[-']/g, "");
        return letters === [...letters].reverse().join("");
      }
      default:
        return false;
    }
  };
  const answers = Object.entries(words)
    .filter(([word]) => matches(word))
    .map(([name, score]) => ({ name, score: score as Score }));
  answerLists.set(prompt.id, answers);
  return answers;
}

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
