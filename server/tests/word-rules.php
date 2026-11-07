<?php
// Structural failures must beat exact, learned and decision caches; passing a
// letter rule never establishes that a candidate is a genuine dictionary word.
list($wordRoot, $wordConfig) = setup_test('word-rules'); $roots[] = $wordRoot;
$wordBank = json_decode(file_get_contents(__DIR__ . '/fixtures/word-bank.json'), true);
$wordBank['culture-less-words']['answers'][] = array('name' => 'Carelessness', 'score' => 100);
file_put_contents($wordConfig['bankFile'], json_encode($wordBank));
$wordCalls = 0;
$wordTransport = function ($payload) use (&$wordCalls) { $wordCalls++; return fixture('accepted'); };
$goodForms = array(
    array('culture-double-o', 'bookshelves'), array('culture-qu-words', 'questioning'),
    array('culture-less-words', 'colorless!'), array('culture-double-e', 'beekeepers'),
    array('culture-qu-words', 'quasi-public'), array('culture-qu-words', " 'QUEEN' "),
    array('culture-silent-initials', 'knives'), array('culture-palindromes', 'Stats'),
    array('culture-five-letter-animals', 'saïga'), array('culture-sciences', 'marine biology')
);
foreach ($goodForms as $case) check(!krillion_lexical_rejection($wordBank[$case[0]], $case[1]), 'Correct literal form must reach semantic judging: ' . $case[1]);
$badForms = array(
    array('culture-less-words', 'homelessness'), array('culture-less-words', 'carelessness'),
    array('culture-double-o', 'dog'), array('culture-double-e', 'coffee table'),
    array('culture-ph-words', 'p-hone'), array('culture-qu-words', 'qu estion'),
    array('culture-z-words', 'xylophone'), array('culture-palindromes', 'le vel'),
    array('culture-palindromes', 'ordinary'), array('culture-five-letter-animals', 'tigers'),
    array('culture-sciences', 'chemistry'), array('culture-silent-initials', 'silent word')
);
foreach ($badForms as $case) {
    $result = krillion_check(array('promptId' => $case[0], 'answer' => $case[1]), $wordConfig, 'word-visitor', $wordTransport);
    check($result['http'] === 200 && $result['body']['status'] === 'rejected' && $result['body']['confidence'] === 1, 'Deterministic rule mismatch rejects immediately: ' . $case[1]);
}
check($wordCalls === 0, 'Rule mismatches consume no inference or quota even if a bad canonical answer exists.');
$realWord = krillion_check(array('promptId' => 'culture-double-o', 'answer' => 'bookshelves'), $wordConfig, 'word-visitor', function ($payload) use (&$wordCalls) {
    $wordCalls++;
    check(strpos($payload['state']['scopeNote'], 'only where listed') === false, 'Word scope contains no finite-bank inflection restriction.');
    check(strpos($payload['questions']['valid']['criteria']['false'], 'cannot be confidently verified') === false, 'Uncertainty is not defined as invalidity.');
    check(strpos($payload['questions']['valid']['instructions'], 'regular inflections') !== false && strpos($payload['questions']['valid']['instructions'], 'mythology') !== false, 'Judging explicitly permits genuine inflections and domain-specific entities.');
    return fixture('accepted');
});
check($realWord['body']['status'] === 'accepted' && $realWord['body']['source'] === 'ai' && $wordCalls === 1, 'Unlisted valid-form word is judged and learned.');
$nonsense = krillion_check(array('promptId' => 'culture-double-e', 'answer' => 'fleebz'), $wordConfig, 'word-visitor', function () { return fixture('uncertain'); });
check($nonsense['http'] === 200 && $nonsense['body']['status'] === 'uncertain' && $nonsense['body']['score'] === 0, 'Nonsense that passes the letter rule is never blindly accepted.');
$noScience = krillion_check(array('promptId' => 'culture-sciences', 'answer' => 'astrology'), $wordConfig, 'word-visitor', function () { return fixture('rejected'); });
check($noScience['body']['status'] === 'rejected', 'Matching suffix cannot make a non-science valid.');

krillion_storage($wordConfig);
$lessPrompt = $wordBank['culture-less-words'];
$wordFingerprint = krillion_fingerprint($lessPrompt, $wordConfig);
$oldFingerprint = hash('sha256', $wordConfig['model'] . '|scope-v1|' . json_encode($lessPrompt, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
check($wordFingerprint !== $oldFingerprint, 'Judge-policy update invalidates old semantic decisions.');
krillion_atomic_write($wordConfig['privateDir'] . '/learned/' . $wordFingerprint . '.json', array(array('name' => 'Carelessness', 'score' => 100), array('name' => 'Colorless', 'score' => 15)));
$badHash = hash('sha256', $wordFingerprint . '|' . krillion_normalize('carelessness'));
krillion_atomic_write($wordConfig['privateDir'] . '/decisions/' . $badHash . '.json', array('expires' => time() + 3600, 'http' => 200, 'response' => array('status' => 'accepted', 'answer' => 'Carelessness', 'score' => 100, 'source' => 'cache', 'confidence' => 0.99, 'elapsedMs' => 0)));
$oldAccepted = krillion_check(array('promptId' => 'culture-less-words', 'answer' => 'carelessness'), $wordConfig, 'word-visitor', $wordTransport);
check($oldAccepted['body']['status'] === 'rejected' && $wordCalls === 1, 'Bad cached/learned answer cannot bypass spelling guard.');
$sharedWords = (array) krillion_shared_bank(array('culture-less-words'), $wordConfig)['answers'];
$sharedNames = array_column($sharedWords['culture-less-words'], 'name');
check(!in_array('Carelessness', $sharedNames, true) && in_array('Colorless', $sharedNames, true), 'Shared bank removes out-of-scope learned/canonical names while preserving valid discoveries.');

list($quotaRoot, $quotaConfig) = setup_test('legitimate-quota'); $roots[] = $quotaRoot;
krillion_storage($quotaConfig);
$quotaNow = time(); $legitimate = true;
for ($i = 0; $i < 20; $i++) $legitimate = krillion_rate_allowed($quotaConfig, 'same-player', $quotaNow) && $legitimate;
check($legitimate, 'A legitimate player is not capped at twelve unfamiliar submissions per minute.');
check($quotaConfig['globalDay'] === 2000, 'Public global daily cost cap remains unchanged.');
$quotaConfig['globalDay'] = 20;
check(!krillion_rate_allowed($quotaConfig, 'another-player', $quotaNow), 'Global daily budget still caps all players together.');
