# Krillion 1.2.0

Live at [jordangeach.com/krillion](https://jordangeach.com/krillion/) with an updated local download.

## Submitted answers and AI reliability

- Exact accepted names and aliases still score immediately. A valid unlisted answer can reach Jev without being in the bundled bank.
- Removed judgment requests while typing. Only a submitted answer starts a check, and duplicate submissions share the same pending request.
- Removed automatic fuzzy replacement. Spelling suggestions are explicit choices that the player can select and submit.
- A stale availability badge no longer blocks an unlisted answer from reaching the backend.
- Rate-limit, timeout, and service failures have distinct feedback. Uncertain and failed checks can be retried; they are not invalid-answer judgments. A submitted check preserves the player’s unused timer time.
- Shared-bank loading keeps valid discoveries when a response grows beyond 300 combined curated and learned entries, and skips isolated malformed entries.

## Prompt rules and learned answers

Built-in word-form restrictions are checked before local, learned, or cached scoring: required prefixes and suffixes, adjacent letters, palindromes, single words, and letter counts. A passing structural check still needs a known answer or an AI validity judgment. Old learned names and aliases that violate a structural rule are excluded.

For example, `colorless` satisfies a word ending in `less`; `carelessness` does not. Jev’s factual judgments can still be mistaken. Curated and AI rarity scores are familiarity estimates rather than measured player popularity.

Learned answers remain available locally and are included in save exports alongside custom prompts and dive history.

## Ocean descent

Scoring moves the depth counter, ruler, and ocean camera together. The surface passes out of view as the dive moves through fish, landmarks, and darker water. The next prompt unlocks after the descent finishes. The game’s reduced-motion setting and system preference jump directly to the target depth.

## Validation

Regression checks cover exact matching without accidental word replacement, structural rules, accepted canonical names and aliases throughout the bundled bank, old invalid learned entries, shared-bank growth, duplicate submissions, service failures, and retries.

Validation passed: 30 Node tests, 75 PHP 7.2 assertions, type checking, both production builds, and 12 live answer regressions. Browser checks covered a seven-round animated dive to 7,000m, the next prompt's full 25-second timer, reduced motion, and phone layout. See [the recorded checks](validation-1.2.0.json).
