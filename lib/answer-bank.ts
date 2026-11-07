import { normalizeAnswer } from "./engine.ts";
import {
  dictionaryAnswersForPrompt,
  matchDictionaryAnswer,
} from "./lexicon.ts";
import { mergePromptAnswers } from "./data/merge.ts";
import type { Answer, Prompt } from "./types";

/** Dictionary spellings keep their own exact scores, including internal punctuation. */
export function knownAnswersForPrompt(
  prompt: Prompt,
  curated: Prompt = prompt,
): Answer[] {
  const manualNames = new Set(
    curated.answers.flatMap((answer) =>
      [answer.name, ...(answer.aliases ?? [])].map(normalizeAnswer),
    ),
  );
  const manualAndLearned = mergePromptAnswers(
    curated,
    prompt.answers,
  ).answers.filter(
    (answer) =>
      manualNames.has(normalizeAnswer(answer.name)) ||
      !matchDictionaryAnswer(prompt, answer.name),
  );
  return [
    ...manualAndLearned,
    ...dictionaryAnswersForPrompt(prompt).filter(
      (answer) => !manualNames.has(normalizeAnswer(answer.name)),
    ),
  ];
}
