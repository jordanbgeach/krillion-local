# Exact dictionary evidence for word prompts

`word-evidence.json` is a compiled subset of the official [SCOWL / English Speller Database](https://github.com/en-wl/wordlist), pinned to release [`rel-2026.02.25`](https://github.com/en-wl/wordlist/releases/tag/rel-2026.02.25), commit `7e99edab8e32f9f9ea2b15f249ca8d4d67237410`. Its 17,705 entries include American, British (-ise and -ize), and Canadian dictionary spellings and explicitly enumerated inflections, through inclusion size 80 and variant level 1.

Only words relevant to the existing `qu`, `z`, `less`, `oo`, `ee`, `ph`, and palindrome prompts are included. Uppercase proper names, abbreviations, nonwords, word fragments, special categories, and multiword phrases are excluded. A capital I is retained as the English pronoun. Entries are exact dictionary forms: no guessed stemming, invented suffix rules, fuzzy substitutions, or internal punctuation deletion is used to manufacture matches.

For those seven prompts, dictionary membership plus the independently checked literal rule establishes a valid English word. It does not establish silent pronunciation, animal identity, or scientific status, so those prompts continue to use semantic judging. Absence from this finite lexicon does not imply invalidity: unknown words still reach the judge. Curated prompt answers and scores take priority. Dictionary evidence takes priority over a cached AI rejection.

Scores are stable **estimated familiarity bands**, using the smallest SCOWL inclusion level containing each word: up to 20 → 10 points, 35 → 15, 50 → 30, 60 → 60, 70 → 85, and 80 → 100. These levels represent dictionary size and breadth; they are not measured player frequencies or a precise ranking. The same dictionary word receives the same estimate across eligible prompts unless a prompt has a hand-curated score.

To regenerate with Python 3 and SQLite from the project folder:

```sh
git clone --depth 1 --branch rel-2026.02.25 https://github.com/en-wl/wordlist.git /tmp/krillion-scowl
cd /tmp/krillion-scowl
python3 combine.py create-db scowl.db
cd /path/to/krillion-local
python3 server/scripts/build-word-evidence.py /tmp/krillion-scowl
```

The generator verifies the pinned commit, uses the upstream exporter for actual word forms, and bundles the complete [SCOWL license](SCOWL-LICENSE.txt). No network, database, Python process, or provider credential is needed for dictionary lookup during play. The hosting package must include this JSON at `dictionary/words.json` and its license at `dictionary/SCOWL-LICENSE.txt`.

SCOWL is permissively licensed; preserve its copyright and license notices when redistributing the generated data. The third-party dictionary is separate from the project's original curated answer banks.
