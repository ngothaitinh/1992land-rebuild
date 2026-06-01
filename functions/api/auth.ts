// functions/api/auth.ts
// Cloudflare Pages Function — khởi động GitHub OAuth cho Decap CMS.
// Truy cập tại /api/auth → redirect sang GitHub authorization.

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(context.request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;
  const scope = "repo,user";
  const githubUrl = [
    "https://github.com/login/oauth/authorize",
    `?client_id=${context.env.GITHUB_CLIENT_ID}`,
    `&redirect_uri=${encodeURIComponent(redirectUri)}`,
    `&scope=${scope}`,
  ].join("");

  return Response.redirect(githubUrl, 302);
}
