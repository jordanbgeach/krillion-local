import test from "node:test";
import assert from "node:assert/strict";
import {
  matchDictionaryAnswer,
  dictionaryWordCount,
  dictionaryAnswersForPrompt,
} from "../lib/lexicon.ts";
import evidence from "../server/dictionary/word-evidence.json" with { type: "json" };
import { checkPromptConstraints } from "../lib/engine.ts";

test("dictionary checks support real derived forms instantly without an AI service", () => {
  assert.equal(dictionaryWordCount, 30000);
  for (const [id, words] of [
    [
      "culture-less-words",
      ["motionless", "friendless", "blameless", "colourless", "breathless"],
    ],
    ["culture-qu-words", ["quizzically", "quizzed", "qubits"]],
    ["culture-double-o", ["bookkeepers", "crooked"]],
    ["culture-double-e", ["beekeepers", "greenest"]],
    ["culture-ph-words", ["phosphorylation", "photosynthesizing"]],
    ["words-ending-ness", ["happiness", "carelessness", "mindfulness"]],
    ["words-ending-ing", ["photocopying", "running", "sing"]],
    ["words-ending-tion", ["communication", "imagination", "evaporation"]],
  ])
    for (const word of words)
      assert.ok(matchDictionaryAnswer({ id }, word), `${id}: ${word}`);
  assert.equal(
    matchDictionaryAnswer({ id: "culture-less-words" }, " COLOURLESS! ")?.name,
    "COLOURLESS",
  );
});

test("dictionary evidence never guesses misspellings, bypasses spelling rules, or answers semantic prompts", () => {
  for (const [id, word] of [
    ["culture-less-words", "motionlessness"],
    ["culture-qu-words", "quazzleflorp"],
    ["culture-double-e", "dear"],
    ["culture-double-o", "b ook"],
    ["culture-double-o", "b-ook"],
    ["culture-ph-words", "phzzzzzt"],
    ["culture-five-letter-animals", "bread"],
    ["culture-silent-initials", "green"],
    ["extra-semantic-test", "green"],
    ["words-ending-ness", "kindly"],
    ["words-ending-ing", "runner"],
    ["words-ending-tion", "photosynthesis"],
  ])
    assert.equal(matchDictionaryAnswer({ id }, word), null, `${id}: ${word}`);
});

test("all 30,000 forms are searchable and score under at least one supported prompt", () => {
  const covered = new Set();
  assert.equal(Object.keys(evidence.words).length, 30000);
  for (const id of evidence.supportedPromptIds) {
    const answers = dictionaryAnswersForPrompt({ id });
    assert.equal(answers.length, evidence.coverage[id]);
    assert.strictEqual(
      dictionaryAnswersForPrompt({ id }),
      answers,
      "Lists are cached instead of rebuilt during animation.",
    );
    for (const answer of answers) {
      assert.equal(checkPromptConstraints({ id }, answer.name), null);
      assert.deepEqual(matchDictionaryAnswer({ id }, answer.name), answer);
      covered.add(answer.name);
    }
  }
  assert.equal(
    covered.size,
    30000,
    "Do not inflate the database with words that cannot answer any prompt.",
  );
});
