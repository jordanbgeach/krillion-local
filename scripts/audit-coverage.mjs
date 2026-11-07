#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { builtInPrompts } from "../lib/data/index.ts";
import { knownAnswersForPrompt } from "../lib/answer-bank.ts";
import {
  dictionaryAnswersForPrompt,
  dictionaryWordCount,
} from "../lib/lexicon.ts";
import {
  checkPromptConstraints,
  matchExactAnswer,
  normalizeAnswer,
} from "../lib/engine.ts";

const coverage = builtInPrompts.map((prompt) => {
  const dictionary = dictionaryAnswersForPrompt(prompt);
  const known = knownAnswersForPrompt(prompt);
  const names = new Set();
  for (const answer of prompt.answers) {
    for (const name of [answer.name, ...(answer.aliases ?? [])]) {
      if (
        checkPromptConstraints(prompt, name) ||
        matchExactAnswer(prompt, name)?.name !== answer.name
      )
        throw new Error(
          `An accepted spelling does not score correctly: ${prompt.id}: ${name}`,
        );
    }
  }
  for (const answer of known)
    for (const name of [answer.name, ...(answer.aliases ?? [])])
      names.add(name.normalize("NFC").toLowerCase());
  return {
    id: prompt.id,
    category: prompt.category,
    prompt: prompt.prompt,
    curatedAnswers: prompt.answers.length,
    curatedAliases: prompt.answers.reduce(
      (sum, answer) => sum + (answer.aliases?.length ?? 0),
      0,
    ),
    dictionaryForms: dictionary.length,
    knownAnswers: known.length,
    acceptedSpellings: names.size,
    ...(prompt.source ? { source: prompt.source } : {}),
  };
});
const sortedCounts = coverage
  .map((prompt) => prompt.curatedAnswers)
  .sort((a, b) => a - b);
const report = {
  dictionaryWordForms: dictionaryWordCount,
  promptCount: coverage.length,
  curatedAnswers: coverage.reduce(
    (sum, prompt) => sum + prompt.curatedAnswers,
    0,
  ),
  curatedAliases: coverage.reduce(
    (sum, prompt) => sum + prompt.curatedAliases,
    0,
  ),
  perPrompt: {
    minimumCurated: sortedCounts[0],
    medianCurated: sortedCounts[Math.floor(sortedCounts.length / 2)],
    maximumCurated: sortedCounts.at(-1),
    atLeast40Curated: coverage.filter((prompt) => prompt.curatedAnswers >= 40)
      .length,
  },
  note: "Counts describe bundled matches and explicitly listed spellings, with aliases kept distinct from canonical answers. Overlapping words across prompts are not additional dictionary forms. Jev can check further answers. Finite topics can contain fewer answers than open-ended topics.",
  prompts: coverage,
};
await writeFile(
  new URL("../docs/word-bank-coverage-1.4.0.json", import.meta.url),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    dictionaryWordForms: report.dictionaryWordForms,
    prompts: report.promptCount,
    curatedAnswers: report.curatedAnswers,
    curatedAliases: report.curatedAliases,
    ...report.perPrompt,
  }),
);
console.log("Full per-prompt audit: docs/word-bank-coverage-1.4.0.json");
