import type { Category, DiveRecord, Prompt, RoundResult } from "./types";

export type Session = {
  id: string;
  date: string;
  seed: string;
  mode: DiveRecord["mode"];
  categories: Category[];
  timer: number;
  promptIds: string[];
  round: number;
  results: RoundResult[];
  stage: "question" | "reveal" | "finished";
  deadline: number | null;
};

const categories: Category[] = [
  "Geography",
  "Nature",
  "Science",
  "Culture",
  "Words",
  "Food",
];
const scores = new Set([0, 10, 15, 30, 60, 85, 100]);

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function text(
  value: unknown,
  label: string,
  max: number,
  allowEmpty = false,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!allowEmpty && !value.trim())
  )
    throw new Error(`${label} is invalid.`);
  return value.trim();
}

/** Validate the complete resumable state before it reaches UI calculations. */
export function validateSession(
  value: unknown,
  availablePromptIds: Set<string>,
): Session {
  const data = object(value, "Saved dive");
  const id = text(data.id, "Saved dive id", 150);
  const seed = text(data.seed, "Saved dive seed", 150);
  const date = text(data.date, "Saved dive date", 50);
  if (!Number.isFinite(Date.parse(date)))
    throw new Error("Saved dive date is invalid.");
  if (!["unlimited", "daily", "practice"].includes(data.mode as string))
    throw new Error("Saved dive mode is invalid.");
  if (
    !Array.isArray(data.categories) ||
    !data.categories.length ||
    data.categories.length > categories.length ||
    data.categories.some((category) => !categories.includes(category)) ||
    new Set(data.categories).size !== data.categories.length
  )
    throw new Error("Saved dive categories are invalid.");
  if (
    typeof data.timer !== "number" ||
    !Number.isFinite(data.timer) ||
    !Number.isInteger(data.timer) ||
    data.timer < 0 ||
    data.timer > 600
  )
    throw new Error("Saved dive timer must be an integer from 0 to 600.");
  if (data.mode === "practice" && data.timer !== 0)
    throw new Error("Saved practice dives must be untimed.");
  if (data.mode === "daily" && data.timer !== 25)
    throw new Error("Saved daily dives must use a 25-second timer.");
  if (
    !Array.isArray(data.promptIds) ||
    data.promptIds.length !== 7 ||
    data.promptIds.some(
      (promptId) =>
        typeof promptId !== "string" || !availablePromptIds.has(promptId),
    ) ||
    new Set(data.promptIds).size !== 7
  )
    throw new Error("Saved dive needs seven distinct available prompts.");
  if (
    typeof data.round !== "number" ||
    !Number.isInteger(data.round) ||
    data.round < 0 ||
    data.round > 6
  )
    throw new Error("Saved dive round is invalid.");
  if (!["question", "reveal", "finished"].includes(data.stage as string))
    throw new Error("Saved dive stage is invalid.");
  const stage = data.stage as Session["stage"];
  if (
    !Array.isArray(data.results) ||
    data.results.length !==
      (stage === "question" ? data.round : data.round + 1) ||
    (stage === "finished" && data.round !== 6)
  )
    throw new Error("Saved dive results do not match its stage.");
  const promptIds = data.promptIds as string[];
  const results: RoundResult[] = data.results.map((value, index) => {
    const result = object(value, `Saved round ${index + 1}`);
    if (result.promptId !== promptIds[index])
      throw new Error("Saved dive results do not match its prompt order.");
    if (typeof result.score !== "number" || !scores.has(result.score))
      throw new Error("Saved round score is invalid.");
    const answer =
      result.answer === null
        ? null
        : text(result.answer, "Saved round answer", 200);
    if ((answer === null) !== (result.score === 0))
      throw new Error("Saved round answer and score disagree.");
    if (
      typeof result.timedOut !== "boolean" ||
      typeof result.corrected !== "boolean"
    )
      throw new Error("Saved round flags are invalid.");
    if (result.timedOut && result.score !== 0)
      throw new Error("Saved round cannot score after time expires.");
    if (result.corrected && answer === null)
      throw new Error("Saved round cannot correct a missing answer.");
    if (result.ai !== undefined && typeof result.ai !== "boolean")
      throw new Error("Saved round AI flag is invalid.");
    return {
      promptId: promptIds[index],
      input: text(result.input, "Saved round input", 500, true),
      answer,
      score: result.score,
      timedOut: result.timedOut,
      corrected: result.corrected,
      ...(result.ai === undefined ? {} : { ai: result.ai }),
    };
  });
  const needsDeadline = stage === "question" && data.timer > 0;
  if (needsDeadline) {
    if (
      typeof data.deadline !== "number" ||
      !Number.isFinite(data.deadline) ||
      !Number.isInteger(data.deadline) ||
      data.deadline <= 0 ||
      data.deadline > 8_640_000_000_000_000
    )
      throw new Error("Saved dive deadline is invalid.");
  } else if (data.deadline !== null)
    throw new Error("Saved dive must have no active deadline.");
  return {
    id,
    date,
    seed,
    mode: data.mode as Session["mode"],
    categories: [...data.categories] as Category[],
    timer: data.timer,
    promptIds: [...promptIds],
    round: data.round,
    results,
    stage,
    deadline: data.deadline as number | null,
  };
}

/** Last incoming version wins; the aggregate bank must remain exportable. */
export function mergeCustomPrompts(
  existing: Prompt[],
  incoming: Prompt[],
): Prompt[] {
  const merged = [
    ...new Map(
      [...existing, ...incoming].map((prompt) => [prompt.id, prompt]),
    ).values(),
  ];
  if (merged.length > 500)
    throw new Error(
      "Your local bank can contain at most 500 custom prompts. This import would exceed that limit.",
    );
  return merged;
}
