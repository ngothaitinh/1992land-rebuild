<?php
/**
 * 1992land CMS — GitHub OAuth: Step 1 (Authorize)
 * Redirect user to GitHub OAuth authorize page.
 */

// Load credentials
$config = require __DIR__ . '/config.php';

$params = http_build_query([
    'client_id'    => $config['client_id'],
    'redirect_uri' => $config['redirect_uri'],
    'scope'        => 'repo,user',
    'state'        => bin2hex(random_bytes(16)),
]);

header('Location: https://github.com/login/oauth/authorize?' . $params);
exit;
