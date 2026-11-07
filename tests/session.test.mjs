import test from "node:test";
import assert from "node:assert/strict";
import { validateSession, mergeCustomPrompts } from "../lib/session.ts";

const promptIds = Array.from({ length: 7 }, (_, i) => `prompt-${i}`);
const available = new Set(promptIds);
const session = {
  id: "dive-1",
  date: "2026-11-07T12:00:00.000Z",
  seed: "test-seed",
  mode: "unlimited",
  categories: ["Nature"],
  timer: 25,
  promptIds,
  round: 0,
  results: [],
  stage: "question",
  deadline: 1_794_052_825_000,
};
const result = (index) => ({
  promptId: promptIds[index],
  input: "crab",
  answer: "Crab",
  score: 30,
  timedOut: false,
  corrected: false,
});

test("resumes coherent question, reveal, and finished sessions", () => {
  assert.deepEqual(validateSession(session, available), session);
  const reveal = {
    ...session,
    stage: "reveal",
    deadline: null,
    results: [result(0)],
  };
  assert.deepEqual(validateSession(reveal, available), reveal);
  const finished = {
    ...session,
    stage: "finished",
    round: 6,
    deadline: null,
    results: promptIds.map((_, i) => result(i)),
  };
  assert.deepEqual(validateSession(finished, available), finished);
  assert.equal(
    validateSession(
      { ...session, mode: "practice", timer: 0, deadline: null },
      available,
    ).timer,
    0,
  );
});

test("rejects corrupt active state before rendering can dereference it", () => {
  assert.throws(
    () =>
      validateSession(
        { ...session, stage: "reveal", results: [null], deadline: null },
        available,
      ),
    /object/,
  );
  assert.throws(
    () => validateSession({ ...session, round: 1.5 }, available),
    /round/,
  );
  assert.throws(
    () => validateSession({ ...session, deadline: Infinity }, available),
    /deadline/,
  );
  assert.throws(
    () => validateSession({ ...session, deadline: null }, available),
    /deadline/,
  );
  assert.throws(
    () => validateSession({ ...session, date: undefined }, available),
    /date/,
  );
  assert.throws(
    () => validateSession({ ...session, date: "broken" }, available),
    /date/,
  );
  assert.throws(
    () => validateSession({ ...session, categories: [] }, available),
    /categories/,
  );
  assert.throws(
    () =>
      validateSession(
        { ...session, categories: ["Nature", "Nature"] },
        available,
      ),
    /categories/,
  );
  assert.throws(
    () => validateSession({ ...session, timer: NaN }, available),
    /timer/,
  );
  assert.throws(
    () => validateSession({ ...session, mode: "practice" }, available),
    /untimed/,
  );
  assert.throws(() => validateSession({ ...session, id: "" }, available), /id/);
});

test("enforces prompt availability, uniqueness, stage counts and result identity", () => {
  assert.throws(() => validateSession(session, new Set()), /available/);
  assert.throws(
    () =>
      validateSession(
        { ...session, promptIds: Array(7).fill(promptIds[0]) },
        available,
      ),
    /distinct/,
  );
  assert.throws(
    () =>
      validateSession(
        { ...session, stage: "reveal", deadline: null },
        available,
      ),
    /stage/,
  );
  assert.throws(
    () =>
      validateSession(
        { ...session, stage: "finished", deadline: null, results: [result(0)] },
        available,
      ),
    /stage/,
  );
  assert.throws(
    () =>
      validateSession(
        { ...session, round: 1, results: [result(1)] },
        available,
      ),
    /order/,
  );
  assert.throws(
    () =>
      validateSession(
        { ...session, round: 1, results: [{ ...result(0), score: 0 }] },
        available,
      ),
    /disagree/,
  );
});

test("custom merges update existing ids without mutation and enforce the aggregate limit", () => {
  const existing = Array.from({ length: 500 }, (_, i) => ({
    id: `custom-${i}`,
    prompt: "Old question",
  }));
  const replacement = { id: "custom-4", prompt: "Updated question" };
  const updated = mergeCustomPrompts(existing, [replacement]);
  assert.equal(updated.length, 500);
  assert.equal(
    updated.find((p) => p.id === replacement.id).prompt,
    "Updated question",
  );
  assert.equal(existing[4].prompt, "Old question");
  assert.throws(
    () => mergeCustomPrompts(existing, [{ id: "custom-new" }]),
    /500/,
  );
});
