<?php
/* Keep api-key.txt outside public_html. No key is returned by this endpoint. */
ini_set('display_errors', '0');
require_once __DIR__ . '/api-lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Vary: Origin');

function krillion_send($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($origin !== '' && !krillion_origin_allowed($origin)) krillion_send(403, array('status' => 'uncertain', 'answer' => null, 'score' => 0, 'source' => 'ai', 'confidence' => 0, 'elapsedMs' => 0));
if ($origin !== '') header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 600');
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
if ($method === 'OPTIONS') { http_response_code(204); exit; }

try {
    $config = krillion_config(__DIR__);
    if ($method === 'GET') {
        $action = isset($_GET['action']) ? $_GET['action'] : 'status';
        if ($action === 'status') krillion_send(200, array('enabled' => krillion_key($config) !== '' && function_exists('curl_init') && krillion_storage($config), 'model' => $config['model'], 'version' => 1));
        if ($action === 'bank') {
            $rawIds = isset($_GET['ids']) ? $_GET['ids'] : '';
            if (!is_string($rawIds) || strlen($rawIds) > 1200) krillion_send(400, array('answers' => new stdClass()));
            $ids = $rawIds === '' ? array() : explode(',', $rawIds);
            if (count($ids) > 7) krillion_send(400, array('answers' => new stdClass()));
            krillion_send(200, krillion_shared_bank($ids, $config));
        }
        krillion_send(404, array('status' => 'uncertain'));
    }
    if ($method !== 'POST') krillion_send(405, array('status' => 'uncertain'));
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'])[0])) : '';
    if ($contentType !== 'application/json') krillion_send(415, array('status' => 'uncertain'));
    if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > 16384) krillion_send(413, array('status' => 'uncertain'));
    $raw = file_get_contents('php://input', false, null, 0, 16385);
    if ($raw === false || strlen($raw) > 16384) krillion_send(413, array('status' => 'uncertain'));
    $body = json_decode($raw, true);
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $result = krillion_check($body, $config, $ip);
    if ($result['http'] === 429) header('Retry-After: 60');
    krillion_send($result['http'], $result['body']);
} catch (Throwable $exception) {
    // Transport errors, malformed provider data and storage outages are not invalid answers.
    krillion_send(503, array('status' => 'uncertain', 'answer' => null, 'score' => 0, 'source' => 'ai', 'confidence' => 0, 'elapsedMs' => 0));
}
