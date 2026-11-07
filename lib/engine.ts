import type {
  Answer,
  Category,
  DiveRecord,
  Prompt,
  RoundResult,
  Score,
} from "./types";

const CATEGORIES: Category[] = [
  "Geography",
  "Nature",
  "Science",
  "Culture",
  "Words",
  "Food",
];
const SCORES = new Set([10, 15, 30, 60, 85, 100]);

/** Accents, punctuation, and spacing do not change the identity of an answer. */
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function editDistance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(
        next[j - 1] + 1,
        row[j] + 1,
        row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    row = next;
  }
  return row[b.length];
}

export function matchAnswer(
  prompt: Prompt,
  input: string,
): { answer: Answer | null; corrected: boolean; suggestions: Answer[] } {
  const value = normalizeAnswer(input);
  if (!value) return { answer: null, corrected: false, suggestions: [] };
  const candidates = prompt.answers.map((answer) => ({
    answer,
    names: [answer.name, ...(answer.aliases ?? [])].map(normalizeAnswer),
  }));
  const exact = candidates.filter((candidate) =>
    candidate.names.includes(value),
  );
  if (exact.length === 1)
    return { answer: exact[0].answer, corrected: false, suggestions: [] };
  if (exact.length > 1)
    return {
      answer: null,
      corrected: false,
      suggestions: exact.map((candidate) => candidate.answer),
    };
  // Short words are too easy to turn into unrelated valid answers accidentally.
  if (value.length < 4 || value.length > 200)
    return { answer: null, corrected: false, suggestions: [] };
  const limit = value.length < 8 ? 1 : 2;
  const nearby = candidates
    .map((candidate) => ({
      answer: candidate.answer,
      distance: Math.min(
        ...candidate.names
          .filter((name) => Math.abs(name.length - value.length) <= limit)
          .map((name) => editDistance(value, name)),
        Infinity,
      ),
    }))
    .filter((candidate) => candidate.distance <= limit)
    .sort(
      (a, b) =>
        a.distance - b.distance || a.answer.name.localeCompare(b.answer.name),
    );
  // Even a closer match is ambiguous if another accepted answer lies in the correction window.
  if (nearby.length === 1)
    return { answer: nearby[0].answer, corrected: true, suggestions: [] };
  return {
    answer: null,
    corrected: false,
    suggestions: nearby.slice(0, 5).map((candidate) => candidate.answer),
  };
}

export function scoreLabel(score: number): string {
  return (
    (
      {
        0: "Missed",
        10: "Surface",
        15: "Familiar",
        30: "Shoal",
        60: "Uncommon",
        85: "Deep cut",
        100: "Hidden gem",
      } as Record<number, string>
    )[score] ?? "Missed"
  );
}

export function scoreColor(score: number): string {
  return (
    (
      {
        0: "#97a9b6",
        10: "#9cbdc4",
        15: "#83b7c1",
        30: "#64c9bd",
        60: "#71dab5",
        85: "#b7a3ef",
        100: "#f0ce87",
      } as Record<number, string>
    )[score] ?? "#97a9b6"
  );
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  let state = hashSeed(seed);
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function selectPrompts(
  prompts: Prompt[],
  categories: Category[],
  seed: string,
  count = 7,
  excludeIds: string[] = [],
): Prompt[] {
  const allowed = categories.length ? [...new Set(categories)] : CATEGORIES;
  const unique = [
    ...new Map(
      prompts
        .filter((prompt) => allowed.includes(prompt.category))
        .map((prompt) => [prompt.id, prompt]),
    ).values(),
  ];
  const excluded = new Set(excludeIds);
  const selected: Prompt[] = [];
  const categoryOrder = seededShuffle(allowed, `${seed}:categories`);
  const usage = new Map<Category, number>(
    categoryOrder.map((category) => [category, 0]),
  );
  const target = Math.max(0, Math.min(Math.floor(count), unique.length));
  // Exhaust unseen prompts before dipping into repeats. Within each pass, choose
  // the least-used category so mixed dives stay varied instead of clustering.
  for (const isRepeat of [false, true]) {
    const pool = seededShuffle(
      unique.filter((prompt) => excluded.has(prompt.id) === isRepeat),
      `${seed}:${isRepeat}`,
    );
    while (selected.length < target && pool.length) {
      const available = categoryOrder.filter((category) =>
        pool.some((prompt) => prompt.category === category),
      );
      const category = available.reduce((best, candidate) =>
        (usage.get(candidate) ?? 0) < (usage.get(best) ?? 0) ? candidate : best,
      );
      const index = pool.findIndex((prompt) => prompt.category === category);
      selected.push(pool.splice(index, 1)[0]);
      usage.set(category, (usage.get(category) ?? 0) + 1);
    }
  }
  return selected;
}

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function randomSeed(): string {
  const bytes = new Uint32Array(2);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(36)).join("-");
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function string(
  value: unknown,
  label: string,
  max = 300,
  allowEmpty = false,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!allowEmpty && !value.trim())
  )
    throw new Error(
      `${label} must be ${allowEmpty ? "a" : "a nonempty"} string of at most ${max} characters.`,
    );
  return value.trim();
}

function category(value: unknown, label: string): Category {
  if (typeof value !== "string" || !CATEGORIES.includes(value as Category))
    throw new Error(`${label} must be one of: ${CATEGORIES.join(", ")}.`);
  return value as Category;
}

function number(
  value: unknown,
  label: string,
  max: number,
  integer = true,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > max ||
    (integer && !Number.isInteger(value))
  )
    throw new Error(
      `${label} must be ${integer ? "an integer" : "a number"} from 0 to ${max}.`,
    );
  return value;
}

function boolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean")
    throw new Error(`${label} must be true or false.`);
  return value;
}

export function validateCustomPrompts(value: unknown): Prompt[] {
  if (!Array.isArray(value) || value.length > 500)
    throw new Error(
      "The question bank must be an array of at most 500 prompts.",
    );
  const ids = new Set<string>();
  return value.map((item, index) => {
    const label = `Prompt ${index + 1}`;
    const data = object(item, label);
    const text = string(data.prompt, `${label} prompt`, 500);
    const rawId =
      data.id === undefined
        ? hashSeed(text).toString(36)
        : string(data.id, `${label} id`, 100);
    const id = rawId.startsWith("custom-") ? rawId : `custom-${rawId}`;
    if (ids.has(id)) throw new Error(`${label} has a duplicate id (${id}).`);
    ids.add(id);
    if (
      !Array.isArray(data.answers) ||
      data.answers.length < 1 ||
      data.answers.length > 300
    )
      throw new Error(`${label} must contain 1–300 answers.`);
    const names = new Map<string, number>();
    const answers: Answer[] = data.answers.map((answerValue, answerIndex) => {
      const answerLabel = `${label}, answer ${answerIndex + 1}`;
      const answer = object(answerValue, answerLabel);
      const name = string(answer.name, `${answerLabel} name`, 200);
      if (!SCORES.has(answer.score as number))
        throw new Error(
          `${answerLabel} score must be 10, 15, 30, 60, 85, or 100.`,
        );
      if (
        answer.aliases !== undefined &&
        (!Array.isArray(answer.aliases) || answer.aliases.length > 30)
      )
        throw new Error(
          `${answerLabel} aliases must be an array of at most 30 strings.`,
        );
      const aliases = (answer.aliases as unknown[] | undefined)?.map(
        (alias, aliasIndex) =>
          string(alias, `${answerLabel}, alias ${aliasIndex + 1}`, 200),
      );
      for (const variant of [name, ...(aliases ?? [])]) {
        const normalized = normalizeAnswer(variant);
        if (!normalized)
          throw new Error(`${answerLabel} must contain letters or numbers.`);
        if (names.has(normalized) && names.get(normalized) !== answerIndex)
          throw new Error(
            `${label} has conflicting answer names or aliases: ${variant}.`,
          );
        names.set(normalized, answerIndex);
      }
      return {
        name,
        score: answer.score as Score,
        ...(aliases?.length ? { aliases } : {}),
      };
    });
    const source =
      data.source === undefined
        ? undefined
        : string(data.source, `${label} source`, 1000);
    if (source !== undefined) {
      let valid = false;
      try {
        valid = ["http:", "https:"].includes(new URL(source).protocol);
      } catch {
        /* invalid URL rejected below */
      }
      if (!valid)
        throw new Error(`${label} source must be an http or https URL.`);
    }
    return {
      id,
      category: category(data.category, `${label} category`),
      prompt: text,
      note:
        data.note === undefined
          ? ""
          : string(data.note, `${label} note`, 1000, true),
      answers,
      ...(source ? { source } : {}),
    };
  });
}

export function validateSave(value: unknown): {
  version: 1;
  history: DiveRecord[];
  customPrompts: Prompt[];
} {
  const data = object(value, "Save file");
  if (data.version !== 1)
    throw new Error("Unsupported save version. Expected version 1.");
  if (!Array.isArray(data.history) || data.history.length > 5000)
    throw new Error("Save history must be an array of at most 5,000 dives.");
  const ids = new Set<string>();
  const history: DiveRecord[] = data.history.map((recordValue, index) => {
    const label = `Dive ${index + 1}`;
    const record = object(recordValue, label);
    const id = string(record.id, `${label} id`, 150);
    if (ids.has(id)) throw new Error(`${label} has a duplicate id.`);
    ids.add(id);
    const date = string(record.date, `${label} date`, 50);
    if (!Number.isFinite(Date.parse(date)))
      throw new Error(`${label} date is invalid.`);
    if (!["unlimited", "daily", "practice"].includes(record.mode as string))
      throw new Error(`${label} mode is invalid.`);
    if (
      !Array.isArray(record.categories) ||
      record.categories.length < 1 ||
      record.categories.length > CATEGORIES.length
    )
      throw new Error(`${label} categories must be a nonempty array.`);
    const categories = [
      ...new Set(
        record.categories.map((value, categoryIndex) =>
          category(value, `${label}, category ${categoryIndex + 1}`),
        ),
      ),
    ];
    if (
      !Array.isArray(record.results) ||
      record.results.length < 1 ||
      record.results.length > 50
    )
      throw new Error(`${label} results must contain 1–50 rounds.`);
    const results: RoundResult[] = record.results.map(
      (resultValue, resultIndex) => {
        const resultLabel = `${label}, round ${resultIndex + 1}`;
        const result = object(resultValue, resultLabel);
        const score = number(result.score, `${resultLabel} score`, 100);
        if (score !== 0 && !SCORES.has(score))
          throw new Error(`${resultLabel} score is invalid.`);
        const answer =
          result.answer === null
            ? null
            : string(result.answer, `${resultLabel} answer`, 200);
        if ((answer === null) !== (score === 0))
          throw new Error(`${resultLabel} answer and score disagree.`);
        const timedOut = boolean(result.timedOut, `${resultLabel} timedOut`);
        if (timedOut && score !== 0)
          throw new Error(`${resultLabel} cannot score after time expires.`);
        return {
          promptId: string(result.promptId, `${resultLabel} promptId`, 150),
          input: string(result.input, `${resultLabel} input`, 500, true),
          answer,
          score,
          timedOut,
          corrected: boolean(result.corrected, `${resultLabel} corrected`),
        };
      },
    );
    const score = number(record.score, `${label} score`, results.length * 100);
    if (score !== results.reduce((sum, result) => sum + result.score, 0))
      throw new Error(`${label} total does not match its round scores.`);
    return {
      id,
      date,
      seed: string(record.seed, `${label} seed`, 150),
      mode: record.mode as DiveRecord["mode"],
      categories,
      timer: number(record.timer, `${label} timer`, 600),
      results,
      score,
    };
  });
  return {
    version: 1,
    history,
    customPrompts: validateCustomPrompts(data.customPrompts),
  };
}
