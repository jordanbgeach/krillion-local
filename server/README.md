# Optional TypeSafe answer judging on Hostinger

The hosted PHP endpoint enforces structural prompt rules, checks exact names and aliases in the built-in bank, then checks a shared accepted-answer cache. It sends only unseen submitted answers to TypeSafe. The browser does not send judgment requests while the player types and does not automatically replace an answer with a fuzzy match. A network/provider/storage failure returns HTTP 503 with an `uncertain` result, never a wrong-answer judgment. A valid model judgment between the validity thresholds returns HTTP 200 with `uncertain`. No browser API key is needed.

`npm run build:hostinger` copies `api.php`, `api-lib.php`, and a generated `prompt-bank.json` into the hosting ZIP. Upload and extract it in `public_html/krillion/` as usual. The PHP files support PHP 7.2 or newer, with cURL and HTTPS certificate verification enabled.

Create a **sibling of public_html** called `krillion-private` in Hostinger File Manager. Inside it, create `api-key.txt` and paste only your TypeSafe API key as plain text, without quotes. Do not upload this private folder or key to `public_html`, GitHub, or a build archive. Restrict the file to the hosting account where File Manager allows (0600). The application creates private `decisions/`, `learned/`, `locks/`, and `rate-limits.json` there; PHP needs write access to this private directory. An environment variable named `TYPESAFE_API_KEY` may be used instead of the key file.

With `api.php` in `public_html/krillion`, the exact default private path is:

```php
dirname(__DIR__, 2) . '/krillion-private/api-key.txt'
```

Use `api-key.example.txt` as a description of the expected format; it is not a real credential and is never packaged. Status reports only enabled/model/version and never key values, paths, or diagnostics.

## Public API

- `GET /krillion/api.php?action=status` → `{ "enabled": true, "model": "jev-1.14.0", "version": 1 }`.
- `GET /krillion/api.php?action=bank&ids=id1,id2` → `{ "answers": { "id1": [{ "name": "…", "score": 60 }] } }`. At most seven built-in prompt IDs; custom metadata is not read by this action.
- `POST /krillion/api.php` with JSON `{ "promptId": "…", "answer": "…" }` → `{ "status": "accepted|rejected|uncertain", "answer": null, "score": 0, "source": "ai|cache|bank", "confidence": 0, "elapsedMs": 0 }`. Accepted results contain the trimmed candidate or known bank name and one of 10/15/30/60/85/100.
- For a `custom-` ID only, also send `"prompt": { "prompt": "Name a…", "note": "Scope", "category": "Nature" }`. Built-in prompt metadata always comes from the generated bank and ignores any client replacement.

Allowed browser origins: `https://jordangeach.com`, `http://127.0.0.1:4173`, `http://127.0.0.1:5173`, `http://localhost:4173`, and `http://localhost:5173`. The endpoint sends no wildcard CORS or credential allowance. Origin restrictions reduce browser misuse but are not authentication; server quotas also apply to requests without an Origin header.

Only AI cache misses consume quotas. Defaults: 60 requests/minute and 1,000/day per IP; 120/minute and 2,000/day globally. Rate-limit responses are HTTP 429 with an uncertain result and a `Retry-After` header. The client reports the waiting period separately from invalid-answer feedback. Quotas are configurable in `krillion_config` in `api-lib.php`. IPs are hashed in private counters. Proxy forwarding headers are not trusted; on a CDN, configure the web server's trusted real-IP handling so `REMOTE_ADDR` represents visitors.

The provider request is one call to `https://api.typesafe.ai/v1/systemone`, model `jev-1.14.0`, with a two-second total request budget (the cURL timeout is reduced after any lock wait) and no retries. Validity is a separate `noul` judgment: at least 0.85 accepts, at most 0.15 rejects, and values in between remain uncertain. Rarity uses an explicit six-way choice; a `noul` value is never used as a rarity score. Familiarity is judged against prompt specificity and actual knowledge, not word length. A note describing a curated bank does not restrict answers to that list.

Accepted answers are retained in the private learned bank for the current model and prompt fingerprint. Negative decisions expire after six hours; uncertain judgments expire after 30 seconds; unavailable provider responses are cached for ten seconds with their HTTP 503 status. Request locks deduplicate concurrent calls. Changing the model, prompt metadata, or judge policy invalidates the relevant cache keys. Built-in spelling constraints (prefix, suffix, adjacent letters, palindrome, and length) are enforced before any answer or decision cache; rule failures consume no AI quota. For word-form prompts, single-word restrictions and literal letter adjacency are preserved; for example, `carelessness` fails an `ends in less` prompt before any model call. A passing spelling rule never establishes dictionary or factual validity. The shared bank and browser overlay filter out discoveries that violate these structural rules. A growing shared response is filtered entry by entry, so malformed entries or a combined curated-and-learned list above 300 entries do not discard all discoveries. Jev can still make semantic mistakes; the guard only settles the deterministic spelling constraints. The budget limits are request caps, not dollar guarantees; configure your TypeSafe account's spending limits too.

## Fixture tests

No credential or network request is used in the PHP tests:

```sh
php server/tests/run.php
```

When PHP is not installed locally, the official image can run the same tests:

```sh
docker run --rm --platform linux/amd64 -v "$PWD:/app:ro" -w /app php:7.2-cli php server/tests/run.php
```

## Bundled dictionary evidence

The seven pure English spelling prompts also use [the bundled SCOWL dictionary subset](dictionary/README.md): 17,705 exact word forms, including standard inflections and US/UK spellings. Those matches are deterministic, bypass API quotas, and still work if Jev is unavailable. They return `source: "bank"`; existing curated scores retain priority. Unknown words still reach Jev, and semantic prompts are not accepted merely because a string is a dictionary word.

Ship `server/dictionary/word-evidence.json` as `dictionary/words.json` beside the PHP API and include `dictionary/SCOWL-LICENSE.txt`. The browser and backend should use the same canonical JSON for consistent estimates. The score bands are documented familiarity estimates based on SCOWL inclusion levels, not live popularity statistics.
