<?php
/**
 * 1992land CMS — GitHub OAuth: Step 2 (Callback)
 * Exchange code for access token, pass back to CMS.
 */

$config = require __DIR__ . '/config.php';

$code = $_GET['code'] ?? '';
if (!$code) {
    http_response_code(400);
    echo 'Missing code parameter';
    exit;
}

// Exchange code for access token
$ch = curl_init('https://github.com/login/oauth/access_token');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Accept: application/json', 'User-Agent: 1992land-CMS'],
    CURLOPT_POSTFIELDS     => http_build_query([
        'client_id'     => $config['client_id'],
        'client_secret' => $config['client_secret'],
        'code'          => $code,
        'redirect_uri'  => $config['redirect_uri'],
    ]),
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(502);
    echo 'GitHub token exchange failed';
    exit;
}

$data = json_decode($response, true);
$token = $data['access_token'] ?? '';
$provider = 'github';

if (!$token) {
    http_response_code(400);
    echo 'No access token in response: ' . htmlspecialchars($response);
    exit;
}

// Return token to CMS via postMessage (standard Decap/Sveltia/Netlify CMS pattern)
?>
<!DOCTYPE html>
<html>
<head><title>Đang đăng nhập...</title></head>
<body>
<script>
(function() {
  function receiveMessage(e) {
    console.log("receiveMessage %o", e);
    // send message to main window with auth token
    window.opener.postMessage(
      'authorization:<?= htmlspecialchars($provider) ?>:success:{"token":"<?= htmlspecialchars($token) ?>","provider":"<?= htmlspecialchars($provider) ?>"}',
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  // Tell the opener we're ready
  window.opener.postMessage("authorizing:<?= htmlspecialchars($provider) ?>", "*");
})();
</script>
</body>
</html>
