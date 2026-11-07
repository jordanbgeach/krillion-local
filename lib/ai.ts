import type { Answer, Prompt, Score } from "./types";

export const LEARNED_BANK_KEY = "krillion-ai-bank-v1";
const tiers = new Set([10, 15, 30, 60, 85, 100]);
const categories = new Set([
  "Geography",
  "Nature",
  "Science",
  "Culture",
  "Words",
  "Food",
]);
const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
export type LearnedBank = Record<string, Answer[]>;
export type AIJudgment = {
  status: "accepted" | "rejected" | "uncertain";
  answer: string | null;
  score: number;
  source: "ai" | "cache" | "bank";
  confidence: number;
  elapsedMs: number;
};
export type AIStatus = { enabled: boolean; model: string; version: 1 };

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid AI data.");
  return value as Record<string, unknown>;
}
function name(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > 200 ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    !normalize(value)
  )
    throw new Error("Invalid learned answer name.");
  return value.trim();
}
export function validateLearnedAnswer(value: unknown): Answer {
  const item = object(value);
  const canonical = name(item.name);
  if (!tiers.has(item.score as number))
    throw new Error("Invalid learned answer score.");
  if (
    item.aliases !== undefined &&
    (!Array.isArray(item.aliases) || item.aliases.length > 15)
  )
    throw new Error("Invalid learned answer aliases.");
  const seen = new Set([normalize(canonical)]);
  const aliases = ((item.aliases as unknown[] | undefined) ?? [])
    .map(name)
    .filter((alias) => {
      const key = normalize(alias);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return {
    name: canonical,
    score: item.score as Score,
    ...(aliases.length ? { aliases } : {}),
  };
}

/** Scope text is part of identity, so edited custom prompts cannot reuse stale judgments. */
export function promptSemanticKey(
  prompt: Pick<Prompt, "id" | "category" | "prompt" | "note">,
): string {
  return JSON.stringify([
    prompt.id,
    prompt.category,
    prompt.prompt,
    prompt.note,
  ]);
}
function validateSemanticKey(key: string): void {
  if (key.length > 2000) throw new Error("Invalid learned prompt scope.");
  const parts: unknown = JSON.parse(key);
  if (
    !Array.isArray(parts) ||
    parts.length !== 4 ||
    typeof parts[0] !== "string" ||
    !parts[0] ||
    parts[0].length > 150 ||
    !categories.has(parts[1]) ||
    typeof parts[2] !== "string" ||
    !parts[2].trim() ||
    parts[2].length > 500 ||
    typeof parts[3] !== "string" ||
    parts[3].length > 1000
  )
    throw new Error("Invalid learned prompt scope.");
}
export function validateLearnedBank(value: unknown): LearnedBank {
  const data = object(value);
  if (data.version !== 1)
    throw new Error("Unsupported learned answer bank version.");
  const entries = Object.entries(object(data.answers));
  if (entries.length > 600)
    throw new Error("The learned answer bank is too large.");
  const result: LearnedBank = {};
  let count = 0;
  for (const [key, values] of entries) {
    validateSemanticKey(key);
    if (!Array.isArray(values) || values.length > 300)
      throw new Error("Invalid learned answer list.");
    const seen = new Set<string>();
    const answers = values.map(validateLearnedAnswer).filter((answer) => {
      const names = [answer.name, ...(answer.aliases ?? [])].map(normalize);
      if (names.some((item) => seen.has(item))) return false;
      names.forEach((item) => seen.add(item));
      return true;
    });
    count += answers.length;
    if (count > 10_000)
      throw new Error("The learned answer bank is too large.");
    result[key] = answers;
  }
  return result;
}
export function exportLearnedBank(answers: LearnedBank) {
  return { version: 1 as const, answers };
}
export function mergeLearnedBanks(
  existing: LearnedBank,
  incoming: LearnedBank,
): LearnedBank {
  const result = { ...existing };
  for (const [key, answers] of Object.entries(incoming)) {
    const byName = new Map(
      (result[key] ?? []).map((answer) => [normalize(answer.name), answer]),
    );
    for (const answer of answers) byName.set(normalize(answer.name), answer);
    result[key] = [...byName.values()].slice(-300);
  }
  const keys = Object.keys(result);
  let count = Object.values(result).reduce(
    (sum, answers) => sum + answers.length,
    0,
  );
  while (keys.length > 600 || count > 10_000) {
    const oldest = keys.shift()!;
    count -= result[oldest].length;
    delete result[oldest];
  }
  return result;
}
export function learnAnswer(
  bank: LearnedBank,
  prompt: Prompt,
  answer: Answer,
): LearnedBank {
  return mergeLearnedBanks(bank, {
    [promptSemanticKey(prompt)]: [validateLearnedAnswer(answer)],
  });
}
export function withLearnedAnswers(prompt: Prompt, bank: LearnedBank): Prompt {
  const learned = bank[promptSemanticKey(prompt)];
  if (!learned?.length) return prompt;
  // A local curated name or alias always retains its original score.
  const seen = new Set(
    prompt.answers.flatMap((answer) =>
      [answer.name, ...(answer.aliases ?? [])].map(normalize),
    ),
  );
  const additions = learned.filter((answer) => {
    const names = [answer.name, ...(answer.aliases ?? [])].map(normalize);
    if (names.some((value) => seen.has(value))) return false;
    names.forEach((value) => seen.add(value));
    return true;
  });
  return additions.length
    ? { ...prompt, answers: [...prompt.answers, ...additions] }
    : prompt;
}
export function isLearnedAnswer(prompt: Prompt, answer: string): boolean {
  const key = normalize(answer);
  return !prompt.answers.some((item) =>
    [item.name, ...(item.aliases ?? [])].some(
      (value) => normalize(value) === key,
    ),
  );
}
export function parseAIJudgment(value: unknown): AIJudgment {
  const data = object(value);
  if (
    !["accepted", "rejected", "uncertain"].includes(data.status as string) ||
    !["ai", "cache", "bank"].includes(data.source as string) ||
    typeof data.confidence !== "number" ||
    !Number.isFinite(data.confidence) ||
    data.confidence < 0 ||
    data.confidence > 1 ||
    typeof data.elapsedMs !== "number" ||
    !Number.isFinite(data.elapsedMs) ||
    data.elapsedMs < 0 ||
    data.elapsedMs > 120_000
  )
    throw new Error("Invalid AI judgment.");
  const accepted = data.status === "accepted";
  if (accepted ? !tiers.has(data.score as number) : data.score !== 0)
    throw new Error("Invalid AI judgment score.");
  return {
    status: data.status as AIJudgment["status"],
    answer: accepted ? name(data.answer) : null,
    score: data.score as number,
    source: data.source as AIJudgment["source"],
    confidence: data.confidence,
    elapsedMs: data.elapsedMs,
  };
}

export class AIUnavailableError extends Error {
  constructor() {
    super("The answer checking service is unavailable.");
    this.name = "AIUnavailableError";
  }
}
export function aiEndpoint(
  location?: { hostname: string; origin: string },
  override?: string,
): string {
  const current =
    location ?? (typeof window !== "undefined" ? window.location : undefined);
  const configured =
    override ??
    (import.meta as ImportMeta & { env?: Record<string, unknown> }).env
      ?.VITE_KRILLION_AI_ENDPOINT;
  if (typeof configured === "string" && configured.trim()) {
    try {
      const url = new URL(
        configured.trim(),
        current?.origin ?? "http://localhost",
      );
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.hash
      )
        throw new Error("Invalid endpoint.");
      return url.href;
    } catch {
      /* An invalid public endpoint falls back to local-only operation. */
    }
  }
  // Public checkouts never call somebody else’s paid service by default.
  return current ? `${current.origin}/krillion/api.php` : "/krillion/api.php";
}

export function createAIClient(
  options: {
    endpoint?: string;
    fetcher?: typeof fetch;
    timeoutMs?: number;
    now?: () => number;
  } = {},
) {
  const checks = new Map<
    string,
    { promise: Promise<AIJudgment>; expiresAt: number }
  >();
  const now = options.now ?? Date.now;
  async function request(
    query: string,
    init?: RequestInit,
    timeout = options.timeoutMs ?? 2500,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await (options.fetcher ?? fetch)(
        `${options.endpoint ?? aiEndpoint()}${query}`,
        { ...init, signal: controller.signal, credentials: "omit" },
      );
      if (!response.ok) throw new AIUnavailableError();
      return await response.json();
    } catch {
      throw new AIUnavailableError();
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    async status(): Promise<AIStatus> {
      const data = object(await request("?action=status", undefined, 1200));
      if (
        typeof data.enabled !== "boolean" ||
        typeof data.model !== "string" ||
        data.model.length > 100 ||
        data.version !== 1
      )
        throw new AIUnavailableError();
      return { enabled: data.enabled, model: data.model, version: 1 };
    },
    async bank(prompts: Prompt[]): Promise<LearnedBank> {
      const selected = prompts
        .filter((prompt) => !prompt.id.startsWith("custom-"))
        .slice(0, 7);
      if (!selected.length) return {};
      const data = object(
        await request(
          `?action=bank&ids=${encodeURIComponent(selected.map((prompt) => prompt.id).join(","))}`,
        ),
      );
      const raw = object(data.answers);
      const result: LearnedBank = {};
      for (const prompt of selected) {
        const values = raw[prompt.id];
        if (values === undefined) continue;
        if (!Array.isArray(values) || values.length > 300)
          throw new AIUnavailableError();
        result[promptSemanticKey(prompt)] = values.map(validateLearnedAnswer);
      }
      return validateLearnedBank(exportLearnedBank(result));
    },
    judge(prompt: Prompt, input: string): Promise<AIJudgment> {
      const answer = input.trim();
      if (!answer || answer.length > 200)
        return Promise.reject(new AIUnavailableError());
      const key = `${promptSemanticKey(prompt)}:${normalize(answer)}`;
      const prior = checks.get(key);
      if (prior && prior.expiresAt > now()) return prior.promise;
      const body = {
        promptId: prompt.id,
        answer,
        ...(prompt.id.startsWith("custom-")
          ? {
              prompt: {
                prompt: prompt.prompt,
                note: prompt.note,
                category: prompt.category,
              },
            }
          : {}),
      };
      const pending = request("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(parseAIJudgment);
      const entry = { promise: pending, expiresAt: Infinity };
      checks.set(key, entry);
      // Deduplicate speculative checks and submissions, while allowing recovery
      // from a transient outage without asking the player to reload the game.
      void pending.then(
        (result) => {
          entry.expiresAt =
            result.status === "accepted"
              ? Infinity
              : now() + (result.status === "uncertain" ? 30_000 : 3_600_000);
        },
        () => {
          entry.expiresAt = now() + 8_000;
        },
      );
      if (checks.size > 1000) checks.delete(checks.keys().next().value!);
      return pending;
    },
  };
}
