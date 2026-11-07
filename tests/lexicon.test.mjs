import test from "node:test";
import assert from "node:assert/strict";
import { matchDictionaryAnswer, dictionaryWordCount } from "../lib/lexicon.ts";

test("dictionary checks support real derived forms instantly without an AI service", () => {
  assert.ok(dictionaryWordCount > 17000);
  for (const [id, words] of [
    [
      "culture-less-words",
      ["motionless", "friendless", "blameless", "colourless", "breathless"],
    ],
    ["culture-qu-words", ["quizzically", "quizzed", "qubits"]],
    ["culture-double-o", ["bookkeepers", "crooked"]],
    ["culture-double-e", ["beekeepers", "greenest"]],
    ["culture-ph-words", ["phosphorylation", "photosynthesizing"]],
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
  ])
    assert.equal(matchDictionaryAnswer({ id }, word), null, `${id}: ${word}`);
});
