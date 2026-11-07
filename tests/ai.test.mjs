import test from "node:test";
import assert from "node:assert/strict";
import {
  aiEndpoint,
  AIUnavailableError,
  AIRateLimitError,
  describeAIError,
  createAIClient,
  exportLearnedBank,
  isLearnedAnswer,
  learnAnswer,
  mergeLearnedBanks,
  parseAIJudgment,
  promptSemanticKey,
  validateLearnedAnswer,
  validateLearnedBank,
  withLearnedAnswers,
} from "../lib/ai.ts";

const prompt = {
  id: "world-fruit",
  category: "Food",
  prompt: "Name a fruit.",
  note: "Edible fruits.",
  answers: [{ name: "Apple", score: 10, aliases: ["Apples"] }],
};
const judgment = {
  status: "accepted",
  answer: "Salak",
  score: 85,
  source: "ai",
  confidence: 0.94,
  elapsedMs: 205,
};
const json = (body) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

test("judgments require explicit valid outcomes and fixed score tiers", () => {
  assert.deepEqual(parseAIJudgment(judgment), judgment);
  assert.equal(
    parseAIJudgment({
      ...judgment,
      status: "uncertain",
      answer: null,
      score: 0,
    }).status,
    "uncertain",
  );
  for (const patch of [
    { score: 99 },
    { confidence: NaN },
    { confidence: 2 },
    { source: "unknown" },
    { elapsedMs: -1 },
    { answer: "" },
    { status: "rejected", score: 85 },
  ]) {
    assert.throws(() => parseAIJudgment({ ...judgment, ...patch }));
  }
});

test("learned banks round-trip and respect prompt semantics and curated names", () => {
  const learned = learnAnswer({}, prompt, {
    name: "Salak",
    score: 85,
    aliases: ["Snake fruit"],
  });
  assert.deepEqual(validateLearnedBank(exportLearnedBank(learned)), learned);
  assert.equal(withLearnedAnswers(prompt, learned).answers.length, 2);
  assert.equal(
    withLearnedAnswers({ ...prompt, note: "A different scope." }, learned)
      .answers.length,
    1,
  );
  assert.equal(isLearnedAnswer(prompt, "Salak"), true);
  assert.equal(isLearnedAnswer(prompt, "Apples"), false);
  const conflicting = learnAnswer(learned, prompt, {
    name: "Apples",
    score: 100,
  });
  assert.equal(
    withLearnedAnswers(prompt, conflicting).answers.find(
      (answer) => answer.name === "Apple",
    ).score,
    10,
  );
  assert.equal(withLearnedAnswers(prompt, conflicting).answers.length, 2);
  assert.equal(
    mergeLearnedBanks(learned, learned)[promptSemanticKey(prompt)].length,
    1,
  );
});

test("learned data rejects malformed, unsafe, oversized, and unsupported values", () => {
  for (const value of [
    { name: "Salak", score: 99 },
    { name: "", score: 85 },
    { name: "\u0000bad", score: 85 },
    { name: "x".repeat(201), score: 85 },
    { name: "Salak", score: 85, aliases: new Array(16).fill("alias") },
  ])
    assert.throws(() => validateLearnedAnswer(value));
  assert.throws(() => validateLearnedBank({ version: 2, answers: {} }));
  assert.throws(() =>
    validateLearnedBank({ version: 1, answers: { "arbitrary-key": [] } }),
  );
  assert.throws(() =>
    validateLearnedBank({
      version: 1,
      answers: {
        [promptSemanticKey(prompt)]: new Array(301).fill({
          name: "Salak",
          score: 85,
        }),
      },
    }),
  );
});

test("duplicate final submissions reuse a normalized candidate request", async () => {
  const requests = [];
  let finish;
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    fetcher: async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) });
      return await new Promise((resolve) => {
        finish = resolve;
      });
    },
  });
  const first = client.judge(prompt, "Salak");
  const second = client.judge(prompt, "SALAK!");
  const retryWhilePending = client.judge(prompt, "Salak", { retry: true });
  assert.equal(first, retryWhilePending);
  assert.equal(first, second);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].body, { promptId: prompt.id, answer: "Salak" });
  finish(json(judgment));
  assert.equal((await second).score, 85);
  assert.equal((await client.judge(prompt, "salak")).answer, "Salak");
  assert.equal((await client.judge(prompt, "Salak", { retry: true })).status, "accepted");
  assert.equal(requests.length, 1);
});

test("edited custom prompt scopes get distinct checks; no save history is sent", async () => {
  const bodies = [];
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    fetcher: async (_url, init) => {
      bodies.push(JSON.parse(init.body));
      return json(judgment);
    },
  });
  const custom = { ...prompt, id: "custom-fruit" };
  await client.judge(custom, "Salak");
  await client.judge(
    { ...custom, note: "Only fruits native to Asia." },
    "Salak",
  );
  assert.equal(bodies.length, 2);
  assert.deepEqual(Object.keys(bodies[0]).sort(), [
    "answer",
    "prompt",
    "promptId",
  ]);
  assert.deepEqual(bodies[0].prompt, {
    prompt: prompt.prompt,
    note: prompt.note,
    category: prompt.category,
  });
});

test("network failures stay unavailable and never become invalid answers or retry loops", async () => {
  let calls = 0;
  let now = 1000;
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    now: () => now,
    fetcher: async () => {
      calls++;
      return new Response("Down", { status: 503 });
    },
  });
  await assert.rejects(client.judge(prompt, "Salak"), AIUnavailableError);
  await assert.rejects(client.judge(prompt, "salak"), AIUnavailableError);
  assert.equal(calls, 1);
  now += 1001;
  await assert.rejects(client.judge(prompt, "Salak"), AIUnavailableError);
  assert.equal(calls, 2);
});

test("shared bank fetch accepts selected builtin prompt IDs only", async () => {
  let requested;
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    fetcher: async (url) => {
      requested = url;
      return json({
        answers: {
          [prompt.id]: [{ name: "Salak", score: 85 }],
          unrequested: [{ name: "Wrong", score: 100 }],
        },
      });
    },
  });
  const bank = await client.bank([prompt, { ...prompt, id: "custom-no-send" }]);
  assert.equal(new URL(requested).searchParams.get("ids"), prompt.id);
  assert.deepEqual(bank, {
    [promptSemanticKey(prompt)]: [{ name: "Salak", score: 85 }],
  });
});

test("the public default is same-origin; only a public URL override opts into another endpoint", () => {
  assert.equal(
    aiEndpoint({ hostname: "localhost", origin: "http://localhost:5173" }),
    "http://localhost:5173/krillion/api.php",
  );
  assert.equal(
    aiEndpoint({ hostname: "example.test", origin: "https://example.test" }),
    "https://example.test/krillion/api.php",
  );
  assert.equal(
    aiEndpoint(undefined, "https://service.test/api.php"),
    "https://service.test/api.php",
  );
  assert.equal(
    aiEndpoint(
      { hostname: "example.test", origin: "https://example.test" },
      "javascript:alert(1)",
    ),
    "https://example.test/krillion/api.php",
  );
});

test("a stale or failed availability probe never prevents a submitted answer check", async () => {
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    fetcher: async (_url, init) =>
      init?.method === "POST"
        ? json(judgment)
        : new Response("Unavailable", { status: 503 }),
  });
  await assert.rejects(
    client.status(),
    (error) => error instanceof AIUnavailableError && error.status === 503,
  );
  assert.equal((await client.judge(prompt, "Salak")).status, "accepted");
});

test("growing shared banks retain new discoveries beyond 300 manual entries and skip isolated malformed data", async () => {
  const manual = Array.from({ length: 310 }, (_, index) => ({
    name: `Manual fruit ${index}`,
    score: 30,
  }));
  const largePrompt = { ...prompt, answers: manual };
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    fetcher: async () =>
      json({
        answers: {
          [prompt.id]: [
            ...manual,
            { name: "Salak", score: 85 },
            { name: "bad", score: "85" },
            { name: " ", score: 85 },
            { name: "salak!", score: 100 },
            { name: "Jabuticaba", score: 100 },
          ],
        },
      }),
  });
  const learned = await client.bank([largePrompt]);
  assert.deepEqual(
    learned[promptSemanticKey(prompt)].map((answer) => answer.name),
    ["Salak", "Jabuticaba"],
  );
  assert.equal(withLearnedAnswers(largePrompt, learned).answers.length, 312);
});

test("HTTP limits surface a retry time and stop further unknown requests during the cooldown", async () => {
  let now = 1000;
  let calls = 0;
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    now: () => now,
    fetcher: async () => {
      calls++;
      return calls === 1
        ? new Response("Limited", {
            status: 429,
            headers: { "Retry-After": "7" },
          })
        : json(judgment);
    },
  });
  await assert.rejects(
    client.judge(prompt, "Salak"),
    (error) =>
      error instanceof AIRateLimitError &&
      error.status === 429 &&
      error.retryable &&
      error.retryAfterMs === 7000 &&
      /7 seconds/.test(describeAIError(error)),
  );
  now += 2000;
  await assert.rejects(
    client.judge(prompt, "Other fruit", { retry: true }),
    (error) => error instanceof AIRateLimitError && error.retryAfterMs === 5000,
  );
  assert.equal(calls, 1);
  now += 5001;
  assert.equal(
    (await client.judge(prompt, "Salak", { retry: true })).status,
    "accepted",
  );
  assert.equal(calls, 2);
});

test("semantic uncertainty can be explicitly retried without disabling in-flight deduplication", async () => {
  let calls = 0;
  const bodies = [];
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    fetcher: async (_url, init) => {
      calls++;
      bodies.push(JSON.parse(init.body));
      return json(
        calls === 1
          ? { ...judgment, status: "uncertain", answer: null, score: 0 }
          : judgment,
      );
    },
  });
  assert.equal((await client.judge(prompt, "Salak")).status, "uncertain");
  assert.equal((await client.judge(prompt, "Salak")).status, "uncertain");
  assert.equal(calls, 1);
  assert.equal(
    (await client.judge(prompt, "Salak", { retry: true })).status,
    "accepted",
  );
  assert.equal(calls, 2);
  assert.equal(bodies[0].retry, undefined);
  assert.equal(bodies[1].retry, true);
});

test("explicit retries keep accepted and rejected judgments cached", async () => {
  let calls = 0;
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    fetcher: async () => {
      calls++;
      return json({ ...judgment, status: "rejected", answer: null, score: 0 });
    },
  });
  assert.equal((await client.judge(prompt, "Not Fruit")).status, "rejected");
  assert.equal((await client.judge(prompt, "Not Fruit", { retry: true })).status, "rejected");
  assert.equal(calls, 1);
});

test("invalid normalized input makes no request, and timeouts remain retryable service failures", async () => {
  let calls = 0;
  const client = createAIClient({
    endpoint: "https://example.test/api.php",
    timeoutMs: 10,
    fetcher: async (_url, init) => {
      calls++;
      return await new Promise((_resolve, reject) =>
        init.signal.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        ),
      );
    },
  });
  await assert.rejects(
    client.judge(prompt, "!!!"),
    (error) => error.code === "invalid_input" && !error.retryable,
  );
  assert.equal(calls, 0);
  await assert.rejects(
    client.judge(prompt, "Salak"),
    (error) =>
      error.code === "timeout" &&
      error.retryable &&
      !/wrong/.test(error.message),
  );
  assert.equal(calls, 1);
});

test("old learned model mistakes cannot bypass literal prompt restrictions", () => {
  const words = {
    ...prompt,
    id: "culture-less-words",
    category: "Words",
    prompt: "Name an English word ending in less.",
    answers: [{ name: "Careless", score: 10 }],
  };
  const bank = learnAnswer(
    learnAnswer({}, words, { name: "Carelessness", score: 15 }),
    words,
    { name: "Colorless", score: 30, aliases: ["Colourless", "Colorlessness"] },
  );
  const overlay = withLearnedAnswers(words, bank);
  assert.deepEqual(
    overlay.answers.map((answer) => answer.name),
    ["Careless", "Colorless"],
  );
  assert.deepEqual(overlay.answers[1].aliases, ["Colourless"]);
});
