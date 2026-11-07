import test from "node:test";
import assert from "node:assert/strict";
import { worldPrompts } from "../lib/data/world.ts";
import { culturePrompts } from "../lib/data/culture.ts";
import { extraPrompts } from "../lib/data/extra.ts";
import { builtInPrompts } from "../lib/data/index.ts";
import {
  normalizeAnswer,
  matchAnswer,
  selectPrompts,
  checkPromptConstraints,
} from "../lib/engine.ts";

const bank = builtInPrompts;
const categories = [
  "Geography",
  "Nature",
  "Science",
  "Culture",
  "Words",
  "Food",
];
const scores = new Set([10, 15, 30, 60, 85, 100]);

test("the expanded bank provides substantial variety in every category", () => {
  assert.ok(
    bank.length >= 100,
    "Unlimited needs at least 100 distinct prompts.",
  );
  assert.ok(extraPrompts.length >= 48);
  for (const category of categories) {
    assert.ok(
      extraPrompts.filter((prompt) => prompt.category === category).length >= 8,
      `${category}: expand variety beyond the original question set.`,
    );
  }
  assert.equal(
    new Set(bank.map((prompt) => normalizeAnswer(prompt.prompt))).size,
    bank.length,
    "Avoid adding the same prompt with only punctuation changes.",
  );
});

test("every built-in category supports a full seven-round dive", () => {
  assert.equal(
    new Set(bank.map((prompt) => prompt.id)).size,
    bank.length,
    "Prompt ids must be globally unique.",
  );
  for (const category of categories) {
    assert.ok(
      bank.filter((prompt) => prompt.category === category).length >= 7,
      `${category} needs seven prompts.`,
    );
    const dive = selectPrompts(bank, [category], "bank-regression");
    assert.equal(dive.length, 7);
    assert.equal(new Set(dive.map((prompt) => prompt.id)).size, 7);
  }
});

test("built-in answer banks have valid scores and unambiguous normalized aliases", () => {
  for (const prompt of bank) {
    assert.ok(
      categories.includes(prompt.category),
      `${prompt.id}: invalid category`,
    );
    assert.ok(
      prompt.prompt.trim() && prompt.note.trim(),
      `${prompt.id}: explain prompt scope`,
    );
    assert.ok(
      prompt.answers.length >= (prompt.id.startsWith("extra-") ? 12 : 20),
      `${prompt.id}: needs a useful answer bank`,
    );
    assert.ok(
      prompt.answers.some((answer) => answer.score === 100),
      `${prompt.id}: needs a reachable hidden gem`,
    );
    const owner = new Map();
    for (const [index, answer] of prompt.answers.entries()) {
      assert.ok(
        scores.has(answer.score),
        `${prompt.id}: invalid score ${answer.score}`,
      );
      for (const name of [answer.name, ...(answer.aliases ?? [])]) {
        assert.equal(
          checkPromptConstraints(prompt, name),
          null,
          `${prompt.id}: listed names must obey literal prompt rules (${name})`,
        );
        const normalized = normalizeAnswer(name);
        assert.ok(normalized.length, `${prompt.id}: empty normalized name`);
        assert.ok(
          !owner.has(normalized) || owner.get(normalized) === index,
          `${prompt.id}: conflicting answer/alias ${name}`,
        );
        owner.set(normalized, index);
        const match = matchAnswer(prompt, name);
        assert.equal(
          match.answer?.name,
          answer.name,
          `${prompt.id}: accepted variant must resolve exactly (${name})`,
        );
        assert.equal(match.corrected, false);
      }
    }
    if (prompt.source)
      assert.ok(
        ["http:", "https:"].includes(new URL(prompt.source).protocol),
        `${prompt.id}: unsafe reference URL`,
      );
  }
});
