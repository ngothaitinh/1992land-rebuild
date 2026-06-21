import https from "node:https";

function ghGet(apiPath, pat) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.github.com",
        path: apiPath,
        method: "GET",
        headers: {
          Authorization: `Bearer ${pat}`,
          "User-Agent":  "tg-cms-bot/1.0",
          Accept:        "application/vnd.github+json",
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try { resolve(JSON.parse(d)); }
          catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

export function watchDeployment(repo, commitSha, pat, onDone) {
  const INTERVAL_MS = 30_000;
  const TIMEOUT_MS  = 20 * 60_000;
  const startedAt   = Date.now();
  let   called      = false;
  let   intervalId;

  async function check() {
    if (called) return;

    if (Date.now() - startedAt > TIMEOUT_MS) {
      called = true;
      clearInterval(intervalId);
      onDone("timeout", `https://github.com/${repo}/actions`);
      return;
    }

    try {
      const data = await ghGet(
        `/repos/${repo}/actions/runs?head_sha=${commitSha}&per_page=5`,
        pat
      );
      const run = (data.workflow_runs || []).find((r) => r.head_sha === commitSha);
      if (!run) return;

      if (run.status === "completed") {
        called = true;
        clearInterval(intervalId);
        onDone(run.conclusion, run.html_url);
      }
    } catch (e) {
      console.error("[deploy-watch] poll error:", e.message, "— thử lại sau 30s");
    }
  }

  intervalId = setInterval(check, INTERVAL_MS);
}
