<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed.']);
    exit;
}

// Change this to an active mailbox created in cPanel before launch.
$recipient = 'painters.ng001@gmail.com';
$siteDomain = 'painters.ng';

$clean = static function (string $key, int $maxLength): string {
    $value = trim((string) ($_POST[$key] ?? ''));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $maxLength);
};

if ($clean('website', 200) !== '') {
    echo json_encode(['message' => 'Thank you. Your request has been received.']);
    exit;
}

$started = filter_input(INPUT_POST, 'form_started', FILTER_VALIDATE_INT);
if (!$started || time() - $started < 3 || time() - $started > 86400) {
    http_response_code(422);
    echo json_encode(['message' => 'Please refresh the page and try again.']);
    exit;
}

$name = $clean('name', 80);
$phone = $clean('phone', 30);
$email = filter_var($clean('email', 120), FILTER_VALIDATE_EMAIL);
$location = $clean('location', 120);
$service = $clean('service', 120);
$message = $clean('message', 1500);

if ($name === '' || $phone === '' || !$email || $location === '' || $service === '' || $message === '') {
    http_response_code(422);
    echo json_encode(['message' => 'Please complete every required field with valid details.']);
    exit;
}

$subject = 'New Painters.ng quote request: ' . $service;
$body = "New website quote request\n\n"
    . "Name: {$name}\n"
    . "Phone: {$phone}\n"
    . "Email: {$email}\n"
    . "Location: {$location}\n"
    . "Service: {$service}\n\n"
    . "Project details:\n{$message}\n\n"
    . 'Submitted: ' . date('Y-m-d H:i:s T') . "\n";

$headers = [
    'From: Painters.ng Website <website@' . $siteDomain . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];

if (!mail($recipient, $subject, $body, implode("\r\n", $headers))) {
    error_log('Painters.ng quote form: mail() failed');
    http_response_code(500);
    echo json_encode(['message' => 'Your request could not be sent. Please email hello@painters.ng.']);
    exit;
}

echo json_encode(['message' => 'Thank you. We will contact you shortly about your project.']);
