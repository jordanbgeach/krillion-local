# Krillion 1.3.0

Live at [jordangeach.com/krillion](https://jordangeach.com/krillion/), with updated source and a portable local download.

## More questions and broader answers

The bundled bank now contains **105 prompts and 3,014 curated canonical answers** across six categories. This includes 54 new prompts with 864 answers and 273 aliases.

Prompt scopes and answer coverage were corrected for major-registry dog breeds, extinct marsupials, culinary fungi, cheese styles, and non-skeletal human muscles. Familiar muscle aliases such as `bicep` and `tricep` are accepted. Five-letter animal names include ordinary plurals such as `Lions`, `Geese`, and `Crabs`; `A` and `I` are accepted as single-word palindromes. These banks remain curated selections; a valid unlisted answer can still be checked by Jev.

## Fresh draws that persist

Unlimited and Practice use saved cycle bags for each category combination. Random draws exhaust the current bag before repeating, avoid the previous seven prompts when alternatives remain, and balance available categories. New cycles reshuffle their groups. A single dive cannot contain a duplicate even when it crosses a cycle boundary.

Started, seeded, daily, and abandoned draws are remembered, so reloading or ending a dive does not erase its prompt exposure. Compact `d2-` replay codes encode the chosen seven prompts independently of another browser’s history; matching bank and category selection are required. A replay input is consumed once. **Dive again** in Unlimited or Practice then starts a fresh draw.

## Dictionary evidence without an AI call

Seven pure letter prompts now use **17,705 exact SCOWL dictionary forms**: `qu` and `z` prefixes, the `less` suffix, adjacent `oo`, `ee`, and `ph`, and single-word palindromes. Matching runs in the browser for immediate offline scoring and on the PHP server without spending inference quota. Curated answers and their scores take priority. `Catastrophically`, for example, scores 30 points immediately for the `ph` prompt.

Dictionary scores are stable estimated familiarity bands based on SCOWL inclusion levels, not measured player frequencies. The dictionary subset is finite, so absence is not an invalid-answer verdict. Unknown forms and semantic categories still use Jev when available; dictionary membership alone cannot prove animal identity, scientific status, or pronunciation. AI judgments can still be mistaken.

See the [dictionary README](../server/dictionary/README.md) for provenance and regeneration, and preserve the [SCOWL license](../server/dictionary/SCOWL-LICENSE.txt) with redistributed data.

## Verification

Browser checks covered four distinct abandoned starts, persistence after reload, an exact seven-prompt encoded replay, a fresh **Dive again**, and immediate dictionary scoring of `Catastrophically` at 30 points. The live site also passed four distinct restart checks across a reload and scored `Photocopying` immediately for 15 points. Automated verification passed 40 Node tests, 107 PHP 7.2 assertions, and both production builds. All 23 live answer regressions passed, including dictionary forms, broader prompt scopes, structural failures, and new-prompt Jev checks; published assets and data match the build. See the [deployment validation](validation-1.3.0.json).
