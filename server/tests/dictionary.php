<?php
list($dictionaryRoot, $dictionaryConfig) = setup_test('dictionary'); $roots[] = $dictionaryRoot;
$dictionaryBank = json_decode(file_get_contents(__DIR__ . '/fixtures/word-bank.json'), true);
file_put_contents($dictionaryConfig['bankFile'], json_encode($dictionaryBank));
$dictionaryConfig['wordEvidenceFile'] = dirname(__DIR__) . '/dictionary/word-evidence.json';
$dictionary = krillion_json_read($dictionaryConfig['wordEvidenceFile']);
check($dictionary['version'] === 1 && $dictionary['wordCount'] === 30000 && count($dictionary['words']) === $dictionary['wordCount'], 'Pinned English lexicon is present and has expected broad coverage.');
check(!isset($dictionary['words']['quazzleflorp']) && !isset($dictionary['words']['fleebz']) && !isset($dictionary['words']['zambia']), 'Nonsense and capitalized proper names are not dictionary evidence.');
$dictionaryCalls = 0;
$mustNotCall = function () use (&$dictionaryCalls) { $dictionaryCalls++; throw new RuntimeException('Dictionary match should not need AI.'); };
$dictionaryCases = array(
    array('culture-less-words', 'motionless'), array('culture-less-words', 'friendless'), array('culture-less-words', 'blameless'), array('culture-less-words', 'colourless'),
    array('culture-qu-words', 'quizzically'), array('culture-qu-words', 'quizzed'), array('culture-qu-words', 'qubits'),
    array('culture-double-o', 'bookkeepers'), array('culture-double-o', 'crooked'), array('culture-double-e', 'beekeepers'), array('culture-double-e', 'greenest'),
    array('culture-ph-words', 'phosphorylation'), array('culture-ph-words', 'photosynthesizing'), array('culture-palindromes', 'deified'), array('culture-z-words', 'zoologically'),
    array('words-ending-ness', 'happiness'), array('words-ending-ing', 'willing'), array('words-ending-tion', 'education')
);
foreach ($dictionaryCases as $case) {
    $result = krillion_check(array('promptId' => $case[0], 'answer' => $case[1]), $dictionaryConfig, 'dictionary-player', $mustNotCall);
    check($result['http'] === 200 && $result['body']['status'] === 'accepted' && $result['body']['source'] === 'bank' && $result['body']['confidence'] === 1, 'A verified unlisted word is accepted without probabilistic judgment: ' . $case[1]);
}
check($dictionaryCalls === 0, 'Dictionary evidence never consumes provider calls.');
$withoutDictionaryKey = $dictionaryConfig; $withoutDictionaryKey['privateDir'] = $dictionaryRoot . '/not-configured';
check(krillion_check(array('promptId' => 'culture-qu-words', 'answer' => 'quizzically'), $withoutDictionaryKey, 'dictionary-player', $mustNotCall)['body']['status'] === 'accepted', 'Known dictionary word works even without an API credential.');
check(krillion_check(array('promptId' => 'culture-qu-words', 'answer' => 'Queen'), $dictionaryConfig, 'dictionary-player', $mustNotCall)['body']['score'] === 10, 'Existing curated prompt score takes precedence over dictionary estimate.');
$ooBookkeeping = krillion_check(array('promptId' => 'culture-double-o', 'answer' => 'bookkeeping'), $dictionaryConfig, 'dictionary-player', $mustNotCall)['body'];
$eeBookkeeping = krillion_check(array('promptId' => 'culture-double-e', 'answer' => 'bookkeeping'), $dictionaryConfig, 'dictionary-player', $mustNotCall)['body'];
check($ooBookkeeping['score'] === $eeBookkeeping['score'], 'Dictionary estimate for the same word is stable across eligible prompts.');
check(krillion_dictionary_answer($dictionaryBank['culture-qu-words'], "  'QUIZZICALLY!'  ", $dictionaryConfig)['name'] === 'quizzically', 'Harmless wrapping punctuation and case are normalized.');
check(krillion_dictionary_answer($dictionaryBank['culture-qu-words'], 'quizz-ically', $dictionaryConfig) === null, 'Internal punctuation cannot manufacture an exact dictionary match.');
check(krillion_dictionary_answer($dictionaryBank['culture-qu-words'], 'qui zzically', $dictionaryConfig) === null, 'Internal spaces cannot manufacture a dictionary match.');
check(krillion_dictionary_answer($dictionaryBank['culture-silent-initials'], 'knighthood', $dictionaryConfig) === null, 'Dictionary existence cannot establish silent pronunciation.');
check(krillion_dictionary_answer($dictionaryBank['culture-five-letter-animals'], 'queen', $dictionaryConfig) === null, 'Dictionary existence cannot establish an animal name.');
check(krillion_dictionary_answer($dictionaryBank['culture-sciences'], 'zoology', $dictionaryConfig) === null, 'Scientific fields still need semantic evidence.');
$nonsenseDictionary = krillion_check(array('promptId' => 'culture-qu-words', 'answer' => 'quazzleflorp'), $dictionaryConfig, 'dictionary-player', function () { return fixture('rejected'); });
check($nonsenseDictionary['body']['status'] === 'rejected' && $nonsenseDictionary['body']['source'] === 'ai', 'Unknown nonsense is never accepted merely for matching a prefix.');
$nonsenseUnavailable = krillion_check(array('promptId' => 'culture-qu-words', 'answer' => 'quazzleflorp'), $withoutDictionaryKey, 'dictionary-player', $mustNotCall);
check($nonsenseUnavailable['http'] === 503 && $nonsenseUnavailable['body']['status'] === 'uncertain', 'Absence from dictionary does not become an invalid judgment during service outage.');
$wrongSuffix = krillion_check(array('promptId' => 'culture-less-words', 'answer' => 'motionlessness'), $dictionaryConfig, 'dictionary-player', $mustNotCall);
check($wrongSuffix['body']['status'] === 'rejected' && $wrongSuffix['body']['source'] === 'bank', 'A real word still must satisfy the requested suffix.');
krillion_storage($dictionaryConfig);
$dictionaryPrompt = $dictionaryBank['culture-qu-words'];
$dictionaryHash = hash('sha256', krillion_fingerprint($dictionaryPrompt, $dictionaryConfig) . '|' . krillion_normalize('quizzically'));
krillion_atomic_write($dictionaryConfig['privateDir'] . '/decisions/' . $dictionaryHash . '.json', array('expires' => time() + 3600, 'http' => 200, 'response' => krillion_response('rejected', null, 0, 'ai', 0.99, microtime(true))));
check(krillion_check(array('promptId' => 'culture-qu-words', 'answer' => 'quizzically'), $dictionaryConfig, 'dictionary-player', $mustNotCall)['body']['status'] === 'accepted', 'Positive dictionary evidence outranks an earlier AI false-negative cache.');
$missingDictionary = $dictionaryConfig; $missingDictionary['wordEvidenceFile'] = $dictionaryRoot . '/missing.json';
check(krillion_check(array('promptId' => 'culture-qu-words', 'answer' => 'qubits'), $missingDictionary, 'dictionary-player', function () { return fixture('accepted'); })['body']['source'] === 'ai', 'A missing lexicon falls back safely to the normal judge.');

$legacyScores = array(); $coverageCounts = array_fill_keys($dictionary['supportedPromptIds'], 0);
foreach ($dictionary['words'] as $word => $score) {
    $lettersOnly = preg_replace('/[^a-z]/', '', $word);
    $matches = array(
        'culture-qu-words' => strpos($word, 'qu') === 0, 'culture-z-words' => strpos($word, 'z') === 0,
        'culture-less-words' => substr($word, -4) === 'less', 'culture-double-o' => strpos($word, 'oo') !== false,
        'culture-double-e' => strpos($word, 'ee') !== false, 'culture-ph-words' => strpos($word, 'ph') !== false,
        'culture-palindromes' => $lettersOnly === strrev($lettersOnly),
        'words-ending-ness' => substr($word, -4) === 'ness', 'words-ending-ing' => substr($word, -3) === 'ing',
        'words-ending-tion' => substr($word, -4) === 'tion'
    );
    $legacyMatch = false;
    foreach ($matches as $rule => $fits) {
        if ($fits) { $coverageCounts[$rule]++; if (strpos($rule, 'culture-') === 0) $legacyMatch = true; }
    }
    if (!in_array(true, $matches, true)) throw new RuntimeException('Dictionary contains an irrelevant padding entry.');
    if (!is_int($score) || !in_array($score, array(10, 15, 30, 60, 85, 100), true)) throw new RuntimeException('Dictionary contains an invalid score.');
    if ($legacyMatch) $legacyScores[$word] = $score;
}
ksort($legacyScores, SORT_STRING);
check(count($legacyScores) === 17705 && hash('sha256', json_encode($legacyScores)) === 'e191a7be0811913ba0e4e9f6aff6a4708051fe2f27dcd2f6b4aa74244c1ebffd', 'All original 17,705 exact forms and their scores are preserved.');
check(count($dictionary['supportedPromptIds']) === 10 && $coverageCounts == $dictionary['coverage'], 'Coverage metadata exactly reflects the ten real prompt rules.');
check($coverageCounts['words-ending-ness'] >= 1000 && $coverageCounts['words-ending-ing'] >= 1000 && $coverageCounts['words-ending-tion'] >= 1000, 'Each newly supported ending has substantial genuine answer coverage.');
check(filesize($dictionaryConfig['wordEvidenceFile']) < 4000000 && $dictionary['maxSize'] === 80 && $dictionary['maxVariantLevel'] === 1, 'Expanded dictionary stays under PHP data budget and keeps the modern source filters.');
