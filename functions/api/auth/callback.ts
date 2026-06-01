// functions/api/auth/callback.ts
// Cloudflare Pages Function — xử lý GitHub OAuth callback, trả token về Decap CMS.
// Truy cập tại /api/auth/callback (GitHub redirect URL).

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

interface GithubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  // Trao đổi authorization code lấy access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: context.env.GITHUB_CLIENT_ID,
      client_secret: context.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData: GithubTokenResponse = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    const msg = tokenData.error_description ?? tokenData.error ?? "Unknown error";
    return new Response(`GitHub OAuth error: ${msg}`, { status: 400 });
  }

  // Trả token về Decap CMS qua postMessage
  const content = JSON.stringify({
    token: tokenData.access_token,
    provider: "github",
  });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Auth</title></head>
<body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:${content.replace(/'/g, "\\'")}',
      e.origin
    );
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
