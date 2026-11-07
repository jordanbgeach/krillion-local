#!/usr/bin/env python3
"""Compile exactly 30,000 scoped word forms from a pinned SCOWL checkout."""
import argparse
from collections import deque
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

REVISION = '7e99edab8e32f9f9ea2b15f249ca8d4d67237410'
RELEASE = 'rel-2026.02.25'
SCORE_BANDS = [(20, 10), (35, 15), (50, 30), (60, 60), (70, 85), (80, 100)]
SOURCE_LEVELS = [20, 35, 40, 50, 60, 65, 70, 80]
LEGACY_COUNT = 17705
LEGACY_HASH = 'e191a7be0811913ba0e4e9f6aff6a4708051fe2f27dcd2f6b4aa74244c1ebffd'
NEW_RULES = ['words-ending-ness', 'words-ending-ing', 'words-ending-tion']
ROOT = Path(__file__).resolve().parents[1]


def matching_rules(word):
    letters = re.sub('[^a-z]', '', word)
    conditions = {
        'culture-qu-words': word.startswith('qu'),
        'culture-z-words': word.startswith('z'),
        'culture-less-words': word.endswith('less'),
        'culture-double-o': 'oo' in word,
        'culture-double-e': 'ee' in word,
        'culture-ph-words': 'ph' in word,
        'culture-palindromes': letters == letters[::-1],
        'words-ending-ness': word.endswith('ness'),
        'words-ending-ing': word.endswith('ing'),
        'words-ending-tion': word.endswith('tion'),
    }
    return {rule for rule, matches in conditions.items() if matches}


def score_for(size):
    return next(score for ceiling, score in SCORE_BANDS if size <= ceiling)


def canonical_json(value):
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(',', ':')).encode()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Pinned official en-wl/wordlist checkout with scowl.db built.')
    parser.add_argument('--target', type=int, default=30000)
    args = parser.parse_args()
    source = args.source.resolve()
    revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    if revision != REVISION:
        parser.error('Use the pinned official release ' + RELEASE + ' (' + REVISION + ').')
    if not (source / 'scowl.db').is_file():
        parser.error('First run: python3 combine.py create-db scowl.db, from the SCOWL checkout.')
    candidates = {}
    for size in SOURCE_LEVELS:
        command = [sys.executable, 'scowl', '--db', 'scowl.db', 'word-list', str(size), 'A,B,Z,C', '1',
                   '--wo-poses=abbr', '--wo-pos-categories=nonword,special,wordpart', '--categories=',
                   '--hyphen', '--apostrophe=middle', '--deaccent']
        result = subprocess.run(command, cwd=source, text=True, capture_output=True, check=True)
        for word in result.stdout.splitlines():
            if word != word.lower() and word != 'I':
                continue
            word = word.lower()
            if not re.fullmatch("[a-z]+(?:[-'][a-z]+)*", word) or not matching_rules(word):
                continue
            candidates.setdefault(word, size)
    legacy = {word: score_for(size) for word, size in candidates.items()
              if matching_rules(word) - set(NEW_RULES)}
    legacy_hash = hashlib.sha256(canonical_json(legacy)).hexdigest()
    if len(legacy) != LEGACY_COUNT or legacy_hash != LEGACY_HASH:
        raise RuntimeError('Pinned legacy word forms or scores changed; refusing to replace the preserved bank.')
    if not LEGACY_COUNT <= args.target <= len(candidates):
        parser.error(f'target must be between {LEGACY_COUNT} and {len(candidates)} qualified forms')
    selected = dict(legacy)
    # Exhaust genuinely more common inclusion levels first. Within a level,
    # prefer the least-covered new ending; alphabetic order is the stable tie.
    coverage = {rule: sum(rule in matching_rules(word) for word in selected) for rule in NEW_RULES}
    for size in SOURCE_LEVELS:
        buckets = {rule: deque(sorted(word for word, level in candidates.items()
                                    if level == size and word not in selected and rule in matching_rules(word)))
                   for rule in NEW_RULES}
        while len(selected) < args.target:
            available = [rule for rule in NEW_RULES if buckets[rule]]
            if not available:
                break
            rule = min(available, key=lambda name: (coverage[name], NEW_RULES.index(name)))
            word = buckets[rule].popleft()
            if word in selected:
                continue
            selected[word] = score_for(size)
            for matched in matching_rules(word) & set(NEW_RULES):
                coverage[matched] += 1
    if len(selected) != args.target:
        raise RuntimeError('Qualified selection did not reach the requested count.')
    destination = ROOT / 'dictionary'
    destination.mkdir(exist_ok=True)
    (destination / 'SCOWL-LICENSE.txt').write_bytes((source / 'Copyright').read_bytes())
    supported = sorted(set().union(*(matching_rules(word) for word in selected)))
    payload = {
        'version': 1,
        'source': 'SCOWL / English Speller Database',
        'release': RELEASE,
        'revision': REVISION,
        'license': 'SCOWL-LICENSE.txt',
        'copyright': 'Copyright 2000-2026 Kevin Atkinson',
        'spellings': ['American', 'British -ise', 'British -ize', 'Canadian'],
        'maxSize': 80,
        'maxVariantLevel': 1,
        'wordCount': len(selected),
        'candidatePoolCount': len(candidates),
        'preservedWordCount': LEGACY_COUNT,
        'preservedWordScoresSha256': LEGACY_HASH,
        'supportedPromptIds': supported,
        'coverage': {rule: sum(rule in matching_rules(word) for word in selected) for rule in supported},
        'selection': 'Preserve original forms and scores; then smallest actual SCOWL level, balanced new-ending coverage, stable alphabetic tie.',
        'scoreMethod': 'Estimated familiarity from smallest SCOWL inclusion size; not measured player frequency.',
        'sizeScoreBands': {str(size): score for size, score in SCORE_BANDS},
        'words': dict(sorted(selected.items())),
    }
    encoded = (json.dumps(payload, ensure_ascii=True, separators=(',', ':')) + '\n').encode()
    (destination / 'word-evidence.json').write_bytes(encoded)
    print(json.dumps({'words': len(selected), 'candidatePool': len(candidates), 'legacyPreserved': len(legacy),
                      'bytes': len(encoded), 'coverage': payload['coverage'], 'sha256': hashlib.sha256(encoded).hexdigest()}))


if __name__ == '__main__':
    main()
