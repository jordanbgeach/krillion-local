<?php
require dirname(__DIR__) . '/api-lib.php';
putenv('TYPESAFE_API_KEY=');
$config = krillion_config('/unused/public_html/krillion');
$config['privateDir'] = $argv[1] . '/private';
$config['bankFile'] = $argv[1] . '/bank.json';
$body = array('promptId' => 'test-animals', 'answer' => 'Arctic Fox');
if (isset($argv[2]) && $argv[2] === 'retry') $body['retry'] = true;
$response = krillion_check($body, $config, '127.0.0.1', function ($payload) use ($argv) {
    $handle = fopen($argv[1] . '/calls.txt', 'c+');
    flock($handle, LOCK_EX);
    $count = (int) stream_get_contents($handle);
    rewind($handle); ftruncate($handle, 0); fwrite($handle, (string) ($count + 1)); fflush($handle);
    flock($handle, LOCK_UN); fclose($handle);
    usleep(350000);
    $fixture = isset($argv[3]) && $argv[3] === 'uncertain' ? 'uncertain' : 'accepted';
    return json_decode(file_get_contents(__DIR__ . '/fixtures/' . $fixture . '.json'), true);
});
echo json_encode($response);
