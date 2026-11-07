#!/usr/bin/env python3
"""Compile scoped dictionary evidence from a pinned official SCOWL checkout."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

REVISION = '7e99edab8e32f9f9ea2b15f249ca8d4d67237410'
RELEASE = 'rel-2026.02.25'
LEVELS = [(20, 10), (35, 15), (50, 30), (60, 60), (70, 85), (80, 100)]
ROOT = Path(__file__).resolve().parents[1]


def relevant(word):
    letters = re.sub('[^a-z]', '', word)
    return (word.startswith(('qu', 'z')) or word.endswith('less')
            or any(pair in word for pair in ('oo', 'ee', 'ph'))
            or letters == letters[::-1])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Official en-wl/wordlist checkout with scowl.db already built.')
    args = parser.parse_args()
    source = args.source.resolve()
    revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    if revision != REVISION:
        parser.error('Use the pinned official release ' + RELEASE + ' (' + REVISION + ').')
    if not (source / 'scowl.db').is_file():
        parser.error('First run: python3 combine.py create-db scowl.db, from the SCOWL checkout.')
    words = {}
    for size, score in LEVELS:
        command = [sys.executable, 'scowl', '--db', 'scowl.db', 'word-list', str(size), 'A,B,Z,C', '1',
                   '--wo-poses=abbr', '--wo-pos-categories=nonword,special,wordpart', '--categories=',
                   '--hyphen', '--apostrophe=middle', '--deaccent']
        result = subprocess.run(command, cwd=source, text=True, capture_output=True, check=True)
        for word in result.stdout.splitlines():
            # Capitalized proper names, abbreviations, fragments, spaces and
            # guessed suffixes never become automatic dictionary evidence.
            if word != word.lower() and word != 'I':
                continue
            word = word.lower()
            if not re.fullmatch("[a-z]+(?:[-'][a-z]+)*", word) or not relevant(word):
                continue
            words.setdefault(word, score)
    destination = ROOT / 'dictionary'
    destination.mkdir(exist_ok=True)
    license_bytes = (source / 'Copyright').read_bytes()
    (destination / 'SCOWL-LICENSE.txt').write_bytes(license_bytes)
    payload = {
        'version': 1,
        'source': 'SCOWL / English Speller Database',
        'release': RELEASE,
        'revision': REVISION,
        'license': 'SCOWL-LICENSE.txt',
        'copyright': 'Copyright 2000-2026 Kevin Atkinson',
        'spellings': ['American', 'British -ise', 'British -ize', 'Canadian'],
        'maxSize': 80,
        'wordCount': len(words),
        'scoreMethod': 'Estimated familiarity from smallest SCOWL inclusion size; not measured player frequency.',
        'sizeScoreBands': {str(size): score for size, score in LEVELS},
        'words': dict(sorted(words.items())),
    }
    encoded = (json.dumps(payload, ensure_ascii=True, separators=(',', ':')) + '\n').encode()
    (destination / 'word-evidence.json').write_bytes(encoded)
    print(json.dumps({'words': len(words), 'bytes': len(encoded), 'sha256': hashlib.sha256(encoded).hexdigest()}))


if __name__ == '__main__':
    main()
