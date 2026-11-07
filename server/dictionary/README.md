# Exact dictionary evidence for word prompts

`word-evidence.json` contains **30,000 unique dictionary-attested word forms** compiled from the official [SCOWL / English Speller Database](https://github.com/en-wl/wordlist), pinned to release [`rel-2026.02.25`](https://github.com/en-wl/wordlist/releases/tag/rel-2026.02.25), commit `7e99edab8e32f9f9ea2b15f249ca8d4d67237410`. It includes American, British (-ise and -ize), and Canadian spellings and explicitly enumerated inflections through inclusion size 80 and variant level 1. No additional corpus, archaic size-85 expansion, invented inflection, or unrelated padding is used.

Every entry directly satisfies at least one of these ten literal prompts:

| Prompt rule | Accepted dictionary forms |
| --- | ---: |
| Begins with qu | 932 |
| Begins with z | 669 |
| Ends in less | 701 |
| Contains adjacent oo | 4,766 |
| Contains adjacent ee | 4,513 |
| Contains adjacent ph | 6,444 |
| Single-word palindrome | 137 |
| Ends in ness | 2,407 |
| Ends in ing | 8,725 |
| Ends in tion | 2,342 |

An entry can satisfy several rules, so the coverage counts overlap and are not added to claim a larger vocabulary. The database has exactly 30,000 distinct keys.

Uppercase proper names, abbreviations, nonwords, word fragments, special source categories, and multiword phrases are excluded. A capital I is retained as the English pronoun. Entries are exact dictionary forms: no guessed stemming, invented suffix rules, fuzzy substitutions, or internal punctuation deletion is used to manufacture matches.

The original **17,705 forms and every one of their scores are preserved**. The compiler verifies their frozen score-map SHA-256 `e191a7be0811913ba0e4e9f6aff6a4708051fe2f27dcd2f6b4aa74244c1ebffd`. From the 37,332 qualified modern forms, it adds 12,295 entries by smallest actual SCOWL inclusion level first. Within each level, it favors the least-covered new ending, with deterministic alphabetical ties. This yields useful coverage for all three new prompts without adding irrelevant words to meet a count.

For these ten prompts, dictionary membership plus the separately checked literal rule establishes a valid English word. It cannot establish silent pronunciation, animal identity, or scientific status, so those prompts continue to use semantic judging. Absence from this finite lexicon does not imply invalidity: unknown words still reach the judge. Curated prompt answers and scores take priority. Dictionary evidence takes priority over a cached AI rejection.

Scores are stable **estimated familiarity bands**, using the smallest SCOWL inclusion level containing each word: up to 20 → 10 points, 35 → 15, 50 → 30, 60 → 60, 70 → 85, and 80 → 100. These levels represent dictionary size and breadth; they are not measured player frequencies or a precise ranking. A dictionary word receives the same estimate across eligible prompts unless a prompt has a hand-curated score.

To regenerate with Python 3 and SQLite from the project folder:

```sh
git clone --depth 1 --branch rel-2026.02.25 https://github.com/en-wl/wordlist.git /tmp/krillion-scowl
cd /tmp/krillion-scowl
python3 combine.py create-db scowl.db
cd /path/to/krillion-local
python3 server/scripts/build-word-evidence.py /tmp/krillion-scowl
```

The generator verifies the pinned commit, uses the upstream exporter for actual word forms, and bundles the complete [SCOWL license](SCOWL-LICENSE.txt). It refuses to write a count larger than the qualified source pool or to alter the preserved legacy word/score map. No network, database, Python process, or provider credential is needed for dictionary lookup during play. The hosting package must include this JSON at `dictionary/words.json` and its license at `dictionary/SCOWL-LICENSE.txt`.

SCOWL is permissively licensed; preserve its copyright and license notices when redistributing the generated data. The third-party dictionary is separate from the project's original curated answer banks. The existing license remains sufficient because the selection retains the same non-Australian spellings and never exceeds size 80.
