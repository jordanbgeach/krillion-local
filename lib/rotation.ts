import type { Category, Prompt } from "./types";

export const ROTATION_KEY = "krillion-prompt-rotation-v1";
export type PromptRotation = {
  version: 1;
  seenByCategories: Record<string, string[]>;
  recentPromptIds: string[];
};

export function rotationCategoryKey(categories: readonly Category[]): string {
  return [...new Set(categories)].sort().join("|");
}

/** Rotation is independent of completed scores: abandoned dives count too. */
export function readPromptRotation(
  value: unknown,
  availableIds: ReadonlySet<string>,
  historyIds: readonly string[] = [],
): PromptRotation {
  const ids = (list: unknown): string[] =>
    Array.isArray(list)
      ? [
          ...new Set(
            list.filter(
              (id): id is string =>
                typeof id === "string" && availableIds.has(id),
            ),
          ),
        ].slice(0, 2000)
      : [];
  const item =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<PromptRotation>)
      : {};
  const seenByCategories: Record<string, string[]> = {};
  const validCategories = new Set([
    "Geography",
    "Nature",
    "Science",
    "Culture",
    "Words",
    "Food",
  ]);
  if (
    item.version === 1 &&
    item.seenByCategories &&
    typeof item.seenByCategories === "object"
  ) {
    for (const [key, seen] of Object.entries(item.seenByCategories).slice(
      0,
      63,
    )) {
      const categories = key.split("|");
      if (
        categories.length &&
        categories.every((category) => validCategories.has(category)) &&
        [...new Set(categories)].sort().join("|") === key
      )
        seenByCategories[key] = ids(seen);
    }
  }
  return {
    version: 1,
    seenByCategories,
    recentPromptIds: ids([
      ...(item.version === 1 ? ids(item.recentPromptIds) : []),
      ...historyIds,
    ]),
  };
}

export function rememberPromptDraw(
  rotation: PromptRotation,
  categories: readonly Category[],
  selectedIds: readonly string[],
  seenPromptIds: readonly string[],
): PromptRotation {
  return {
    version: 1,
    seenByCategories: {
      ...rotation.seenByCategories,
      [rotationCategoryKey(categories)]: [...new Set(seenPromptIds)],
    },
    recentPromptIds: [
      ...new Set([...selectedIds, ...rotation.recentPromptIds]),
    ].slice(0, 2000),
  };
}

function catalog(prompts: readonly Prompt[]) {
  return [...new Set(prompts.map((prompt) => prompt.id))].sort();
}
function fingerprint(ids: readonly string[]): string {
  let value = 2166136261;
  for (const char of ids.join("\0")) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(36);
}

/** A compact seed records a fresh draw, so replay never depends on local history. */
export function encodeDrawSeed(
  pool: readonly Prompt[],
  selected: readonly Prompt[],
): string {
  const ids = catalog(pool);
  if (
    selected.length !== 7 ||
    new Set(selected.map((prompt) => prompt.id)).size !== 7
  )
    throw new Error("A replay needs seven distinct prompts.");
  const indexes = selected.map((prompt) => ids.indexOf(prompt.id));
  if (indexes.some((index) => index < 0))
    throw new Error("The replay contains an unavailable prompt.");
  return `d2-${fingerprint(ids)}-${indexes.map((index) => index.toString(36)).join(".")}`;
}

export function decodeDrawSeed(
  seed: string,
  pool: readonly Prompt[],
): Prompt[] | null {
  if (!seed.startsWith("d2-")) return null;
  const parts = /^d2-([a-z0-9]+)-([a-z0-9]+(?:\.[a-z0-9]+){6})$/.exec(seed);
  const ids = catalog(pool);
  if (!parts || parts[1] !== fingerprint(ids))
    throw new Error(
      "This replay needs the same question bank and categories used for the original dive.",
    );
  const indexes = parts[2]
    .split(".")
    .map((value) => Number.parseInt(value, 36));
  if (
    new Set(indexes).size !== 7 ||
    indexes.some(
      (index) =>
        !Number.isSafeInteger(index) || index < 0 || index >= ids.length,
    )
  )
    throw new Error("This replay seed is incomplete or invalid.");
  const byId = new Map(pool.map((prompt) => [prompt.id, prompt]));
  return indexes.map((index) => byId.get(ids[index])!);
}
