import test from "node:test";
import assert from "node:assert/strict";
import { mergePromptAnswers } from "../lib/data/merge.ts";
import { knownAnswersForPrompt } from "../lib/answer-bank.ts";
import { matchDictionaryAnswer } from "../lib/lexicon.ts";

test("expanded banks preserve curated scores, add aliases, and keep ambiguous aliases with their original owner", () => {
  const prompt = {
    id: "test",
    category: "Words",
    prompt: "Test",
    note: "",
    answers: [
      { name: "Blue", score: 10, aliases: ["Azure"] },
      { name: "Green", score: 15 },
    ],
  };
  const original = structuredClone(prompt);
  const result = mergePromptAnswers(prompt, [
    { name: "Azure", score: 100, aliases: ["Sky Blue"] },
    { name: "Red", score: 30, aliases: ["Blue", "Crimson"] },
  ]);
  assert.deepEqual(result.answers, [
    { name: "Blue", score: 10, aliases: ["Azure", "Sky Blue"] },
    { name: "Green", score: 15 },
    { name: "Red", score: 30, aliases: ["Crimson"] },
  ]);
  assert.deepEqual(prompt, original);
});

test("full answer banks retain exact dictionary spellings and their matching scores", () => {
  const prompt = {
    id: "culture-double-e",
    category: "Words",
    prompt: "Name an English word containing ee",
    note: "",
    answers: [],
  };
  const rows = knownAnswersForPrompt(prompt);
  for (const input of ["addressee's", "addressees"])
    assert.equal(
      rows.find((answer) => answer.name === input)?.score,
      matchDictionaryAnswer(prompt, input)?.score,
    );
  assert.notEqual(
    rows.find((answer) => answer.name === "addressee's").score,
    rows.find((answer) => answer.name === "addressees").score,
  );
  const curated = { ...prompt, answers: [{ name: "Addressees", score: 85 }] };
  const overlay = {
    ...curated,
    answers: [...curated.answers, { name: "Greenest", score: 100 }],
  };
  const known = knownAnswersForPrompt(overlay, curated);
  assert.equal(known.find((answer) => answer.name === "Addressees").score, 85);
  assert.equal(
    known.some((answer) => answer.name === "addressee's"),
    false,
    "Curated normalized scoring wins for equivalent spellings.",
  );
  assert.equal(
    known.find((answer) => answer.name === "greenest").score,
    matchDictionaryAnswer(prompt, "greenest").score,
    "Dictionary evidence wins over a stale learned estimate.",
  );
});
