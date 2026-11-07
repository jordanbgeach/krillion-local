import { normalizeAnswer } from "../engine.ts";
import type { Answer, Prompt } from "../types";

/** Keep established scores and aliases while adding independently curated coverage. */
export function mergePromptAnswers(
  prompt: Prompt,
  additions: readonly Answer[],
): Prompt {
  if (!additions.length) return prompt;
  const answers = prompt.answers.map((answer) => ({
    ...answer,
    ...(answer.aliases ? { aliases: [...answer.aliases] } : {}),
  }));
  const owners = new Map<string, number>();
  answers.forEach((answer, index) =>
    [answer.name, ...(answer.aliases ?? [])].forEach((name) =>
      owners.set(normalizeAnswer(name), index),
    ),
  );
  for (const addition of additions) {
    const key = normalizeAnswer(addition.name);
    let owner = owners.get(key);
    if (owner === undefined) {
      owner = answers.length;
      answers.push({ name: addition.name, score: addition.score });
      owners.set(key, owner);
    }
    const answer = answers[owner];
    for (const alias of [addition.name, ...(addition.aliases ?? [])]) {
      const normalized = normalizeAnswer(alias);
      if (!normalized || owners.has(normalized)) continue;
      answer.aliases = [...(answer.aliases ?? []), alias];
      owners.set(normalized, owner);
    }
  }
  return { ...prompt, answers };
}
