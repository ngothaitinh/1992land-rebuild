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

export function buildTreeEntries(textFiles, binaryBlobs) {
  return [
    ...textFiles.map((f) => ({ path: f.path, mode: "100644", type: "blob", content: f.content })),
    ...binaryBlobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })),
  ];
}

// Commit gộp nhiều file trong 1 commit (Git Trees API).
// files: [{ path, content, binary }]  binary=true → content là base64.
export async function putFiles(repo, branch, files, commitMsg, pat) {
  // 1) ref hiện tại
  const ref = await ghRequest("GET", `/repos/${repo}/git/ref/heads/${branch}`, null, pat);
  const baseCommitSha = ref.object.sha;
  // 2) commit gốc → tree gốc
  const baseCommit = await ghRequest("GET", `/repos/${repo}/git/commits/${baseCommitSha}`, null, pat);
  const baseTreeSha = baseCommit.tree.sha;
  // 3) tạo blob cho file nhị phân
  const binaryBlobs = [];
  const textFiles = [];
  for (const f of files) {
    if (f.binary) {
      const blob = await ghRequest("POST", `/repos/${repo}/git/blobs`, { content: f.content, encoding: "base64" }, pat);
      binaryBlobs.push({ path: f.path, sha: blob.sha });
    } else {
      textFiles.push({ path: f.path, content: f.content });
    }
  }
  // 4) tạo tree mới
  const tree = await ghRequest("POST", `/repos/${repo}/git/trees`,
    { base_tree: baseTreeSha, tree: buildTreeEntries(textFiles, binaryBlobs) }, pat);
  // 5) tạo commit
  const commit = await ghRequest("POST", `/repos/${repo}/git/commits`,
    { message: commitMsg, tree: tree.sha, parents: [baseCommitSha] }, pat);
  // 6) cập nhật ref
  await ghRequest("PATCH", `/repos/${repo}/git/refs/heads/${branch}`, { sha: commit.sha }, pat);
  return { commitSha: commit.sha };
}
