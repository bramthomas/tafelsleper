<?php
header('Content-Type: application/json; charset=utf-8');

if (file_exists(__DIR__ . '/config.php')) {
    require __DIR__ . '/config.php';
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'config.php ontbreekt — kopieer config.example.php naar config.php']);
    exit;
}

if (defined('CORS_ORIGIN') && CORS_ORIGIN !== '') {
    header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
    header('Access-Control-Allow-Headers: Content-Type, X-Api-Token');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

function checkToken(): void {
    if (defined('API_TOKEN') && API_TOKEN !== '') {
        $sent = $_SERVER['HTTP_X_API_TOKEN'] ?? '';
        if (!is_string($sent) || !hash_equals(API_TOKEN, $sent)) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'unauthorized']);
            exit;
        }
    }
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? '';
checkToken();

if ($action === 'get' && $method === 'GET') {
    $row = db()->query('SELECT data, updated_at FROM app_state WHERE id = 1')->fetch();
    echo json_encode([
        'ok' => true,
        'state' => $row ? json_decode($row['data'], true) : null,
        'updated_at' => $row ? $row['updated_at'] : null,
    ]);
    exit;
}

if ($action === 'save' && $method === 'POST') {
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'geen geldige JSON']);
        exit;
    }
    $stmt = db()->prepare('INSERT INTO app_state (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)');
    $stmt->execute([$raw]);
    $row = db()->query('SELECT updated_at FROM app_state WHERE id = 1')->fetch();
    echo json_encode(['ok' => true, 'updated_at' => $row ? $row['updated_at'] : null]);
    exit;
}

http_response_code(404);
echo json_encode(['ok' => false, 'error' => 'onbekende actie']);
