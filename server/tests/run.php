<?php
require dirname(__DIR__) . '/api-lib.php';
putenv('TYPESAFE_API_KEY=');
$tests = 0;
function check($condition, $message) {
    global $tests;
    $tests++;
    if (!$condition) throw new RuntimeException('FAIL: ' . $message);
}
function fixture($name) { return json_decode(file_get_contents(__DIR__ . '/fixtures/' . $name . '.json'), true); }
function setup_test($name) {
    $root = sys_get_temp_dir() . '/krillion-api-test-' . $name . '-' . bin2hex(random_bytes(5));
    mkdir($root, 0700, true); mkdir($root . '/private', 0700);
    file_put_contents($root . '/private/api-key.txt', 'fixture-key-never-transmitted');
    $bank = array('test-animals' => array('id' => 'test-animals', 'category' => 'Nature', 'prompt' => 'Name a real animal.', 'note' => 'This is a curated bank; it is not exhaustive.', 'answers' => array(array('name' => 'Blue Crab', 'score' => 30, 'aliases' => array('Crab')))));
    file_put_contents($root . '/bank.json', json_encode($bank));
    $config = krillion_config('/unused/public_html/krillion');
    $config['privateDir'] = $root . '/private'; $config['bankFile'] = $root . '/bank.json';
    return array($root, $config);
}
function remove_test($path) {
    foreach (scandir($path) as $file) {
        if ($file === '.' || $file === '..') continue;
        $child = $path . '/' . $file;
        if (is_dir($child)) remove_test($child); else unlink($child);
    }
    rmdir($path);
}
$roots = array();
try {
    list($root, $config) = setup_test('core'); $roots[] = $root;
    $calls = 0;
    $accept = function ($payload) use (&$calls) { $calls++; return fixture('accepted'); };
    $known = krillion_check(array('promptId' => 'test-animals', 'answer' => ' cRaB! '), $config, 'visitor1', $accept);
    check($known['body']['status'] === 'accepted' && $known['body']['score'] === 30 && $known['body']['source'] === 'bank' && $calls === 0, 'Known normalized alias must bypass AI.');
    $accepted = krillion_check(array('promptId' => 'test-animals', 'answer' => ' Arctic Fox ', 'prompt' => array('prompt' => 'Client replacement')), $config, 'visitor1', function ($payload) use (&$calls) {
        $calls++;
        check($payload['state']['prompt'] === 'Name a real animal.', 'Client cannot replace built-in prompt.');
        check($payload['questions']['valid']['type'] === 'noul' && $payload['questions']['rarity']['type'] === 'choice', 'Independent validity and six-tier rarity primitives.');
        check(count($payload['questions']['rarity']['criteria']) === 6 && isset($payload['questions']['valid']['criteria']['true']), 'Official criterion shape.');
        return fixture('accepted');
    });
    check($accepted['body']['status'] === 'accepted' && $accepted['body']['answer'] === 'Arctic Fox' && $accepted['body']['score'] === 85, 'Valid unknown candidate accepts selected tier, never noul as score.');
    $cached = krillion_check(array('promptId' => 'test-animals', 'answer' => 'arctic fox'), $config, 'visitor2', $accept);
    check($cached['body']['status'] === 'accepted' && $cached['body']['source'] === 'cache' && $calls === 1, 'Accepted answer shared across visitors without another call.');
    $shared = krillion_shared_bank(array('test-animals', 'custom-not-public'), $config);
    $sharedAnswers = (array) $shared['answers'];
    check(count($sharedAnswers['test-animals']) === 2 && !isset($sharedAnswers['custom-not-public']), 'Shared built-in answer bank includes learned answer only.');
    check(krillion_check(array('promptId' => 'missing', 'answer' => 'Fox'), $config, 'visitor', $accept)['http'] === 400, 'Unknown built-in id is invalid input.');
    check(krillion_check(array('promptId' => 'test-animals', 'answer' => str_repeat('a', 201)), $config, 'visitor', $accept)['http'] === 400, 'Oversized answer rejected before spending.');

    $withoutKey = $config; $withoutKey['privateDir'] = $root . '/not-configured';
    check(krillion_check(array('promptId' => 'test-animals', 'answer' => 'Missing Key Animal'), $withoutKey, 'visitor', $accept)['http'] === 503, 'Missing credential is unavailable, not semantic uncertainty.');

    $invalidCalls = 0;
    $reject = function ($payload) use (&$invalidCalls) { $invalidCalls++; return fixture('rejected'); };
    $invalid = krillion_check(array('promptId' => 'test-animals', 'answer' => 'Imaginary Nonsense'), $config, 'visitor', $reject);
    check($invalid['body']['status'] === 'rejected' && $invalid['body']['score'] === 0, 'Confident invalid answer rejected independently of rarity.');
    $again = krillion_check(array('promptId' => 'test-animals', 'answer' => 'Imaginary Nonsense'), $config, 'visitor', $reject);
    check($again['body']['source'] === 'cache' && $invalidCalls === 1, 'Negative result cached.');
    foreach (glob($config['privateDir'] . '/decisions/*.json') as $file) {
        $entry = json_decode(file_get_contents($file), true);
        if ($entry['response']['status'] === 'rejected') { $entry['expires'] = time() - 1; file_put_contents($file, json_encode($entry)); }
    }
    krillion_check(array('promptId' => 'test-animals', 'answer' => 'Imaginary Nonsense'), $config, 'visitor', $reject);
    check($invalidCalls === 2, 'Expired negative entry rechecks upstream.');
    $uncertain = krillion_check(array('promptId' => 'test-animals', 'answer' => 'Unclear animal'), $config, 'visitor', function () { return fixture('uncertain'); });
    check($uncertain['body']['status'] === 'uncertain' && $uncertain['http'] === 200, 'Intermediate validity remains uncertain.');
    $outage = krillion_check(array('promptId' => 'test-animals', 'answer' => 'Another animal'), $config, 'visitor', function () { throw new RuntimeException('fixture-private-diagnostic'); });
    check($outage['http'] === 503 && $outage['body']['status'] === 'uncertain' && strpos(json_encode($outage), 'diagnostic') === false, 'Remote errors never become wrong answers or diagnostics.');
    $bad = fixture('accepted'); $bad['answers']['rarity']['choice'] = 'not-a-tier';
    check(krillion_check(array('promptId' => 'test-animals', 'answer' => 'Malformed Choice'), $config, 'schema-visitor', function () use ($bad) { return $bad; })['http'] === 503, 'Provider choice is whitelisted; malformed schema is unavailable.');
    $bad = fixture('accepted'); $bad['answers']['rarity']['probabilities']['tier85'] = 0.01;
    check(krillion_check(array('promptId' => 'test-animals', 'answer' => 'Malformed Probabilities'), $config, 'schema-visitor', function () use ($bad) { return $bad; })['http'] === 503, 'Malformed probability distribution is unavailable.');
    $bad = fixture('accepted'); $bad['answers']['valid']['noul'] = '0.99';
    check(krillion_check(array('promptId' => 'test-animals', 'answer' => 'Malformed Noul'), $config, 'schema-visitor', function () use ($bad) { return $bad; })['http'] === 503, 'Provider numeric fields cannot be string substitutes.');
    $cachedOutage = krillion_check(array('promptId' => 'test-animals', 'answer' => 'Another animal'), $config, 'visitor', $accept);
    check($cachedOutage['http'] === 503 && $cachedOutage['body']['source'] === 'cache', 'Cached transport failures preserve unavailable HTTP status.');

    $custom = array('promptId' => 'custom-1', 'answer' => 'Cerulean', 'prompt' => array('prompt' => 'Name a colour.', 'note' => '', 'category' => 'Words'));
    $customCalls = 0;
    $customTransport = function () use (&$customCalls) { $customCalls++; return fixture('accepted'); };
    check(krillion_check($custom, $config, 'visitor3', $customTransport)['body']['status'] === 'accepted', 'Custom prompt metadata supported.');
    $custom['prompt']['note'] = 'Only blue shades count.';
    krillion_check($custom, $config, 'visitor3', $customTransport);
    check($customCalls === 2, 'Prompt fingerprint prevents cross-scope cache reuse.');
    $configNewModel = $config; $configNewModel['model'] = 'test-next-model';
    krillion_check($custom, $configNewModel, 'visitor3', $customTransport);
    check($customCalls === 3, 'Model changes invalidate cache.');

    list($root, $limited) = setup_test('limits'); $roots[] = $root;
    $limited['ipMinute'] = 1;
    check(krillion_check(array('promptId' => 'test-animals', 'answer' => 'Animal One'), $limited, 'visitor', $accept)['http'] === 200, 'First quota reservation succeeds.');
    $quota = krillion_check(array('promptId' => 'test-animals', 'answer' => 'Animal Two'), $limited, 'visitor', $accept);
    check($quota['http'] === 429 && $quota['body']['status'] === 'uncertain', 'Per-IP quota denial is retryable, not invalid.');
    check(krillion_check(array('promptId' => 'test-animals', 'answer' => 'Crab'), $limited, 'visitor', $accept)['body']['status'] === 'accepted', 'Known bank remains available after quota reached.');
    check(krillion_check(array('promptId' => 'test-animals', 'answer' => 'Animal One'), $limited, 'visitor', $accept)['body']['source'] === 'cache', 'Cached answers bypass quota.');
    check(krillion_origin_allowed('http://127.0.0.1:4173') && krillion_origin_allowed('https://jordangeach.com') && !krillion_origin_allowed('https://attacker.example') && !krillion_origin_allowed('null'), 'Origin whitelist includes local play and canonical host only.');

    list($root, $parallelConfig) = setup_test('parallel'); $roots[] = $root;
    $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__DIR__ . '/concurrent.php') . ' ' . escapeshellarg($root);
    $descriptors = array(0 => array('pipe', 'r'), 1 => array('pipe', 'w'), 2 => array('pipe', 'w'));
    $process1 = proc_open($command, $descriptors, $pipes1); $process2 = proc_open($command, $descriptors, $pipes2);
    fclose($pipes1[0]); fclose($pipes2[0]);
    $body1 = stream_get_contents($pipes1[1]); $body2 = stream_get_contents($pipes2[1]);
    $error1 = stream_get_contents($pipes1[2]); $error2 = stream_get_contents($pipes2[2]);
    foreach (array($pipes1[1],$pipes1[2],$pipes2[1],$pipes2[2]) as $pipe) fclose($pipe);
    $exit1 = proc_close($process1); $exit2 = proc_close($process2);
    check($exit1 === 0 && $exit2 === 0 && $error1 === '' && $error2 === '', 'Concurrent fixture workers succeed.');
    check((int) file_get_contents($root . '/calls.txt') === 1, 'Duplicate concurrent requests make exactly one upstream call.');
    check(json_decode($body1, true)['body']['status'] === 'accepted' && json_decode($body2, true)['body']['status'] === 'accepted', 'Both duplicate visitors receive accepted result.');
    require __DIR__ . '/word-rules.php';
    require __DIR__ . '/retry.php';
    echo 'PASS: ' . $tests . " backend assertions; no network or real credential used.\n";
} finally {
    foreach ($roots as $root) remove_test($root);
}
