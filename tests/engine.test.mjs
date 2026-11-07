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
  drawFreshPrompts,
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

function freshBank(size) {
  const categories = [
    "Geography",
    "Nature",
    "Science",
    "Culture",
    "Words",
    "Food",
  ];
  return Array.from({ length: size }, (_, i) => ({
    ...prompt,
    id: `fresh-${i}`,
    category: categories[i % categories.length],
  }));
}

test("fresh draws exhaust a 105-prompt bank before repeating and reshuffle seven-prompt groups across cycles", () => {
  const bank = freshBank(105);
  let seenPromptIds = [];
  let recentPromptIds = [];
  const stream = [];
  const dives = [];
  for (let dive = 0; dive < 120; dive++) {
    const result = drawFreshPrompts(bank, [], `fresh-dive-${dive}`, {
      seenPromptIds,
      recentPromptIds,
    });
    const ids = result.prompts.map((prompt) => prompt.id);
    assert.equal(ids.length, 7);
    assert.equal(new Set(ids).size, 7);
    if (dive > 0)
      assert.equal(
        ids.filter((id) => recentPromptIds.slice(0, 7).includes(id)).length,
        0,
        "rested alternatives are available in this bank",
      );
    seenPromptIds = result.seenPromptIds;
    recentPromptIds = [...ids, ...recentPromptIds];
    stream.push(...ids);
    dives.push([...ids].sort().join(","));
  }
  for (let cycle = 0; cycle < 8; cycle++)
    assert.equal(
      new Set(stream.slice(cycle * 105, (cycle + 1) * 105)).size,
      105,
      `cycle ${cycle} repeats before exhaustion`,
    );
  const firstGroups = new Set(dives.slice(0, 15));
  assert.ok(
    dives.slice(15, 30).some((group) => !firstGroups.has(group)),
    "cycle two must not replay the same seven-prompt groups",
  );
});

test("fresh bag rollover preserves distinct prompts inside dives that cross the cycle boundary", () => {
  const bank = freshBank(97);
  let seenPromptIds = [];
  let recentPromptIds = [];
  const stream = [];
  for (let dive = 0; dive < 100; dive++) {
    const result = drawFreshPrompts(bank, [], `rollover-${dive}`, {
      seenPromptIds,
      recentPromptIds,
    });
    const ids = result.prompts.map((prompt) => prompt.id);
    assert.equal(new Set(ids).size, 7);
    stream.push(...ids);
    seenPromptIds = result.seenPromptIds;
    recentPromptIds = [...ids, ...recentPromptIds];
  }
  for (let start = 0; start + 97 <= stream.length; start += 97)
    assert.equal(new Set(stream.slice(start, start + 97)).size, 97);
});

test("freshness wins over category balance and cooldown until the bag is exhausted", () => {
  const bank = freshBank(14);
  const onlyFresh = bank.at(-1).id;
  const result = drawFreshPrompts(bank, [], "one-left", {
    seenPromptIds: bank.slice(0, -1).map((prompt) => prompt.id),
    recentPromptIds: [
      onlyFresh,
      ...bank.slice(0, -1).map((prompt) => prompt.id),
    ],
  });
  assert.equal(result.prompts[0].id, onlyFresh);
  assert.equal(new Set(result.prompts.map((prompt) => prompt.id)).size, 7);
  assert.equal(
    result.seenPromptIds.length,
    6,
    "the last old-cycle prompt is not consumed again in the new cycle",
  );
});

test("fresh draws are deterministic from bag state and balance categories without a fixed order", () => {
  const bank = freshBank(120);
  const recent = bank.slice(0, 7).map((prompt) => prompt.id);
  const options = { seenPromptIds: recent, recentPromptIds: recent };
  const before = JSON.stringify({ bank, options });
  assert.deepEqual(
    drawFreshPrompts(bank, [], "same", options),
    drawFreshPrompts(bank, [], "same", options),
  );
  const orders = new Set();
  for (let seed = 0; seed < 12; seed++) {
    const result = drawFreshPrompts(bank, [], `category-${seed}`, options);
    const counts = new Map();
    result.prompts.forEach((prompt) =>
      counts.set(prompt.category, (counts.get(prompt.category) ?? 0) + 1),
    );
    assert.equal(counts.size, 6);
    assert.deepEqual([...counts.values()].sort(), [1, 1, 1, 1, 1, 2]);
    orders.add(result.prompts.map((prompt) => prompt.category).join(","));
  }
  assert.ok(orders.size > 6);
  assert.equal(JSON.stringify({ bank, options }), before);
});

test("fresh bags sanitize category-subset state and accommodate newly added prompts", () => {
  const bank = freshBank(20);
  const chosen = ["Nature", "Science"];
  const eligible = bank.filter((prompt) => chosen.includes(prompt.category));
  const lastNew = { ...prompt, id: "brand-new", category: "Nature" };
  const result = drawFreshPrompts(
    [...bank, lastNew, lastNew],
    chosen,
    "expanded",
    {
      seenPromptIds: [
        ...eligible.map((prompt) => prompt.id),
        "removed-prompt",
        bank[0].id,
      ],
      recentPromptIds: bank.map((prompt) => prompt.id),
    },
  );
  assert.equal(result.prompts[0].id, lastNew.id);
  assert.equal(
    new Set(result.prompts.map((prompt) => prompt.id)).size,
    result.prompts.length,
  );
  assert.ok(result.prompts.every((prompt) => chosen.includes(prompt.category)));
  assert.ok(
    result.seenPromptIds.every(
      (id) => id === lastNew.id || eligible.some((prompt) => prompt.id === id),
    ),
  );
  assert.deepEqual(drawFreshPrompts([], [], "empty"), {
    prompts: [],
    seenPromptIds: [],
  });
  assert.equal(
    drawFreshPrompts(bank.slice(0, 3), [], "small").prompts.length,
    3,
  );
  assert.equal(
    drawFreshPrompts(bank, [], "zero", { count: 0 }).prompts.length,
    0,
  );
});
