import test from "node:test";
import assert from "node:assert/strict";
import { culturePrompts } from "../lib/data/culture.ts";
import { worldPrompts } from "../lib/data/world.ts";
import {
  normalizeAnswer,
  matchAnswer,
  matchExactAnswer,
  checkPromptConstraints,
  suggestAnswerCorrections,
  seededShuffle,
  selectPrompts,
  validateCustomPrompts,
  validateSave,
  localDateKey,
} from "../lib/engine.ts";

const prompt = {
  id: "test",
  category: "Nature",
  prompt: "Name a creature",
  note: "",
  answers: [
    { name: "Crane", score: 10 },
    { name: "Crab", score: 30 },
    { name: "Axolotl", score: 100, aliases: ["Mexican walking fish"] },
    { name: "Blue-ringed octopus", score: 85 },
  ],
};

test("matching handles accents, punctuation, case and exact aliases", () => {
  assert.equal(normalizeAnswer("  Café-au-lait! "), "cafeaulait");
  assert.equal(matchAnswer(prompt, "BLUE RINGED OCTOPUS").answer?.score, 85);
  assert.equal(
    matchAnswer(prompt, "mexican walking fish").answer?.name,
    "Axolotl",
  );
  assert.equal(matchAnswer(prompt, "Crab").corrected, false);
});

test("fuzzy matching accepts a unique small typo but rejects short or ambiguous guesses", () => {
  assert.equal(matchAnswer(prompt, "axolot").answer?.name, "Axolotl");
  assert.equal(matchAnswer(prompt, "axolot").corrected, true);
  assert.equal(matchAnswer(prompt, "cra").answer, null);
  const ambiguous = {
    ...prompt,
    answers: [
      { name: "Crane", score: 10 },
      { name: "Crate", score: 30 },
    ],
  };
  assert.equal(matchAnswer(ambiguous, "crame").answer, null);
  assert.equal(matchAnswer(ambiguous, "crame").suggestions.length, 2);
  assert.equal(matchAnswer(prompt, "").answer, null);
});

test("exact scoring does not silently replace a valid unlisted animal with a nearby known one", () => {
  const animals = { ...prompt, answers: [{ name: "Mole", score: 30 }] };
  // Vole is a real animal, and must reach independent validation with its own name.
  assert.equal(matchExactAnswer(animals, "Vole"), null);
  assert.equal(suggestAnswerCorrections(animals, "Vole")[0].name, "Mole");
  assert.equal(matchExactAnswer(animals, "MOLE!")?.name, "Mole");
  assert.equal(
    matchExactAnswer(prompt, "Mexican walking fish")?.name,
    "Axolotl",
  );
  assert.equal(matchExactAnswer(prompt, "axolot"), null);
  assert.equal(suggestAnswerCorrections(prompt, "axolot")[0].name, "Axolotl");
  assert.deepEqual(suggestAnswerCorrections(prompt, "Crab"), []);
});

test("shuffle is deterministic and does not mutate source; selection balances and avoids repeats", () => {
  const categories = ["Nature", "Science", "Food"];
  const bank = categories.flatMap((category) =>
    Array.from({ length: 4 }, (_, i) => ({
      ...prompt,
      id: `${category}-${i}`,
      category,
    })),
  );
  const before = bank.map((p) => p.id);
  assert.deepEqual(seededShuffle(bank, "same"), seededShuffle(bank, "same"));
  assert.deepEqual(
    bank.map((p) => p.id),
    before,
  );
  const selected = selectPrompts(bank, categories, "same", 7);
  assert.equal(new Set(selected.map((p) => p.id)).size, 7);
  assert.deepEqual(
    categories
      .map((c) => selected.filter((p) => p.category === c).length)
      .sort(),
    [2, 2, 3],
  );
  assert.deepEqual(selected, selectPrompts(bank, categories, "same", 7));
  const unseen = bank.slice(0, 7).map((p) => p.id);
  const excluded = bank.filter((p) => !unseen.includes(p.id)).map((p) => p.id);
  assert.deepEqual(
    new Set(
      selectPrompts(bank, categories, "other", 7, excluded).map((p) => p.id),
    ),
    new Set(unseen),
  );
  assert.equal(selectPrompts(bank, ["Words"], "seed").length, 0);
  assert.equal(selectPrompts(bank.slice(0, 2), [], "seed", 7).length, 2);
});

test("custom banks are reconstructed, prefixed and reject ambiguous or malformed imports", () => {
  const imported = validateCustomPrompts([prompt]);
  assert.equal(imported[0].id, "custom-test");
  assert.equal(imported[0].answers.length, 4);
  assert.throws(
    () =>
      validateCustomPrompts([
        {
          ...prompt,
          answers: [
            { name: "Café", score: 10 },
            { name: "Cafe", score: 100 },
          ],
        },
      ]),
    /conflicting/,
  );
  assert.throws(
    () => validateCustomPrompts([{ ...prompt, category: "Unknown" }]),
    /category/,
  );
  assert.throws(
    () => validateCustomPrompts([{ ...prompt, source: "javascript:alert(1)" }]),
    /http/,
  );
  assert.throws(
    () =>
      validateCustomPrompts([
        { ...prompt, answers: [{ name: "Crab", score: 99 }] },
      ]),
    /score/,
  );
  assert.throws(() => validateCustomPrompts([prompt, prompt]), /duplicate/);
});

test("save import validates totals, types, and unsupported versions", () => {
  const record = {
    id: "dive1",
    date: "2026-11-07T12:00:00.000Z",
    seed: "abc",
    mode: "unlimited",
    categories: ["Nature"],
    timer: 25,
    results: [
      {
        promptId: "test",
        input: "crab",
        answer: "Crab",
        score: 30,
        corrected: false,
        timedOut: false,
      },
    ],
    score: 30,
  };
  const save = { version: 1, history: [record], customPrompts: [prompt] };
  assert.equal(validateSave(save).history[0].score, 30);
  assert.equal(
    validateSave({
      ...save,
      history: [{ ...record, results: [{ ...record.results[0], ai: true }] }],
    }).history[0].results[0].ai,
    true,
  );
  assert.throws(
    () =>
      validateSave({
        ...save,
        history: [
          { ...record, results: [{ ...record.results[0], ai: "yes" }] },
        ],
      }),
    /ai/,
  );
  assert.throws(() => validateSave({ ...save, version: 2 }), /version/);
  assert.throws(
    () => validateSave({ ...save, history: [{ ...record, score: 100 }] }),
    /total/,
  );
  assert.throws(
    () =>
      validateSave({
        ...save,
        history: [
          { ...record, results: [{ ...record.results[0], timedOut: true }] },
        ],
      }),
    /expires/,
  );
  assert.throws(
    () => validateSave({ ...save, history: [{ ...record, date: "invalid" }] }),
    /date/,
  );
});

test("date key uses the supplied date local calendar components", () => {
  assert.equal(localDateKey(new Date(2026, 0, 2, 23, 50)), "2026-01-02");
});

test("literal word restrictions reject a real word that does not satisfy the prompt", () => {
  assert.match(
    checkPromptConstraints({ id: "culture-less-words" }, "carelessness"),
    /end with/,
  );
  assert.equal(
    checkPromptConstraints({ id: "culture-less-words" }, "colorless"),
    null,
  );
  assert.equal(
    checkPromptConstraints({ id: "culture-less-words" }, "Colourless!"),
    null,
  );
  assert.equal(
    checkPromptConstraints({ id: "culture-qu-words" }, "questioning"),
    null,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-qu-words" }, "squeak"),
    /begin with/,
  );
  assert.equal(
    checkPromptConstraints({ id: "culture-double-e" }, "beekeeping"),
    null,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-double-e" }, "e-elf"),
    /adjacent/,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-qu-words" }, "q-uestion"),
    /begin with/,
  );
  assert.equal(
    checkPromptConstraints({ id: "culture-sciences" }, "marine biology"),
    null,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-silent-initials" }, "honest person"),
    /one word/,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-double-e" }, "carelessness"),
    /adjacent/,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-double-o" }, "ocean"),
    /adjacent/,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-ph-words" }, "photo frame"),
    /one word/,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-palindromes" }, "palindrome"),
    /forwards/,
  );
  assert.equal(
    checkPromptConstraints({ id: "culture-palindromes" }, "Racecar!"),
    null,
  );
  assert.match(
    checkPromptConstraints({ id: "culture-five-letter-animals" }, "rabbit"),
    /5 letters/,
  );
  assert.equal(
    checkPromptConstraints({ id: "culture-five-letter-animals" }, "Civet"),
    null,
  );
  assert.equal(
    checkPromptConstraints({ id: "world-sharks" }, "Great white shark"),
    null,
  );
});

test("structural guards preserve every curated canonical answer and accepted alias", () => {
  for (const prompt of [...culturePrompts, ...worldPrompts]) {
    for (const answer of prompt.answers) {
      for (const variant of [answer.name, ...(answer.aliases ?? [])]) {
        assert.equal(
          checkPromptConstraints(prompt, variant),
          null,
          `${prompt.id}: ${variant}`,
        );
        assert.equal(
          matchExactAnswer(prompt, variant)?.name,
          answer.name,
          `${prompt.id}: exact alias ${variant}`,
        );
      }
    }
  }
});
