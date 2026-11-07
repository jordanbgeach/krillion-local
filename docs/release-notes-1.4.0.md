# Krillion 1.4.0

Live at [jordangeach.com/krillion](https://jordangeach.com/krillion/), with updated source and a portable local download.

- **Exactly 30,000 SCOWL dictionary forms** support ten literal word prompts, including new `ness`, `ing`, and `tion` endings. The original 17,705 forms retain all their scores. Overlapping matches across prompts do not inflate the dictionary count.
- **108 prompts, 7,507 curated canonical answers, and 1,601 aliases.** The median prompt has 68 curated answers, and 98 prompts have at least 40. Counts vary with topic scope; the catalog is not universally exhaustive. The chemical-element prompt retains 16 curated entries, with Jev available for further answers.
- **Full-bank browsing and search** now include applicable dictionary forms. Lists start with 80 rows and offer **Show 80 more**; search covers every entry and uses cached indexes.
- **Consistent scoring order:** curated answers, dictionary evidence, learned answers, then Jev in both browser and PHP. Punctuation variants keep their own dictionary scores: `backpedaling` is 30 and `back-pedaling` is 60.
- **Auditable coverage:** [per-prompt counts](word-bank-coverage-1.4.0.json) separate curated answers, aliases, and dictionary matches. Regenerate them with `npm run audit:bank`.

Dictionary matches work offline without inference quota. Unknown words and semantic answers can still reach Jev; its validity and rarity judgments remain estimates and can be mistaken. The bank remains finite, while runs are unlimited. See the [dictionary provenance](../server/dictionary/README.md) and [SCOWL license](../server/dictionary/SCOWL-LICENSE.txt).

Verification passed 43 Node tests, 120 PHP 7.2 assertions, type checking, and both production builds. Regression checks preserved 2,557 legacy curated name/score pairs. All 225 live server checks passed, covering two curated answers from every prompt plus dictionary variants and literal-rule failures; published assets and data match the build. Live browser checks confirmed immediate `backpedaling` scoring, pagination from 80 to 160 rows, and search retaining distinct punctuation variants and scores. See the [deployment validation](validation-1.4.0.json).
