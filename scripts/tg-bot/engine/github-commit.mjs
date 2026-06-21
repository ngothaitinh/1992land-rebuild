import https from "node:https";

function ghRequest(method, apiPath, body, pat) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: "api.github.com",
        path: apiPath,
        method,
        headers: {
          Authorization:  `Bearer ${pat}`,
          "User-Agent":   "tg-cms-bot/1.0",
          Accept:         "application/vnd.github+json",
          "Content-Type": "application/json",
          ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            const j = d ? JSON.parse(d) : {};
            if (res.statusCode >= 400)
              reject(new Error(`GitHub ${res.statusCode}: ${j.message || d.slice(0, 200)}`));
            else resolve(j);
          } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export async function getFile(repo, branch, filePath, pat) {
  const data = await ghRequest(
    "GET",
    `/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
    null,
    pat
  );
  return {
    content: Buffer.from(data.content, "base64").toString("utf8"),
    sha:     data.sha,
  };
}

export async function putFile(repo, branch, filePath, content, sha, commitMsg, pat) {
  const data = await ghRequest(
    "PUT",
    `/repos/${repo}/contents/${filePath}`,
    {
      message: commitMsg,
      content: Buffer.from(content).toString("base64"),
      sha,
      branch,
    },
    pat
  );
  return { commitSha: data.commit.sha };
}

export async function deleteFile(repo, branch, filePath, sha, commitMsg, pat) {
  const data = await ghRequest(
    "DELETE",
    `/repos/${repo}/contents/${filePath}`,
    { message: commitMsg, sha, branch },
    pat
  );
  return { commitSha: data.commit.sha };
}
