import test from "node:test";
import assert from "node:assert/strict";
import {
  readPromptRotation,
  rememberPromptDraw,
  rotationCategoryKey,
  encodeDrawSeed,
  decodeDrawSeed,
} from "../lib/rotation.ts";

const categories = ["Words", "Nature"];
const pool = Array.from({ length: 12 }, (_, index) => ({
  id: `prompt-${index}`,
  category: index % 2 ? "Words" : "Nature",
  prompt: `Prompt ${index}`,
  note: "",
  answers: [],
}));

test("started draws survive reload without requiring a completed dive", () => {
  const available = new Set(pool.map((prompt) => prompt.id));
  const initial = readPromptRotation(null, available, ["prompt-8"]);
  const next = rememberPromptDraw(
    initial,
    categories,
    ["prompt-1", "prompt-2"],
    ["prompt-1", "prompt-2"],
  );
  const restored = readPromptRotation(
    JSON.parse(JSON.stringify(next)),
    available,
  );
  assert.deepEqual(restored.recentPromptIds, [
    "prompt-1",
    "prompt-2",
    "prompt-8",
  ]);
  assert.deepEqual(
    restored.seenByCategories[rotationCategoryKey([...categories].reverse())],
    ["prompt-1", "prompt-2"],
  );
  assert.deepEqual(
    readPromptRotation(
      {
        version: 1,
        seenByCategories: { Bogus: ["prompt-1"] },
        recentPromptIds: ["deleted", {}, "prompt-1", "prompt-1"],
      },
      available,
    ).recentPromptIds,
    ["prompt-1"],
  );
  assert.deepEqual(
    readPromptRotation(
      { version: 99, recentPromptIds: ["prompt-2"] },
      available,
      ["prompt-8"],
    ).recentPromptIds,
    ["prompt-8"],
  );
});

test("fresh-draw seeds replay exactly across catalog order and unrelated history", () => {
  const selected = [
    pool[7],
    pool[1],
    pool[9],
    pool[2],
    pool[6],
    pool[3],
    pool[0],
  ];
  const seed = encodeDrawSeed(pool, selected);
  assert.ok(seed.length < 120);
  assert.deepEqual(
    decodeDrawSeed(seed, [...pool].reverse()).map((prompt) => prompt.id),
    selected.map((prompt) => prompt.id),
  );
  assert.equal(decodeDrawSeed("ordinary-old-seed", pool), null);
  assert.throws(
    () => decodeDrawSeed(seed, pool.slice(1)),
    /same question bank/,
  );
  assert.throws(
    () => decodeDrawSeed(seed.replace(/[^.]+$/, "0.0"), pool),
    /invalid|same question bank/,
  );
  assert.throws(() => encodeDrawSeed(pool, Array(7).fill(pool[0])), /distinct/);
});
