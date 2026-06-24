import https from "node:https";

// Strip markdown fence nếu có, rồi lấy object JSON đầu tiên.
export function parseLLMJson(text) {
  let t = (text || "").trim();
  // bỏ fence ```json ... ``` hoặc ``` ... ```
  const fence = t.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
  if (fence) t = fence[1].trim();
  // thử parse trực tiếp
  try { return JSON.parse(t); } catch {}
  // fallback: cắt từ { đầu tiên tới } cuối cùng
  const first = t.indexOf("{");
  const last  = t.lastIndexOf("}");
  if (first !== -1 && last > first) {
    return JSON.parse(t.slice(first, last + 1)); // ném lỗi nếu vẫn hỏng
  }
  throw new Error("LLM không trả JSON hợp lệ");
}

export function callLLM({ system, user }) {
  const endpoint = process.env.LLM_ENDPOINT;
  const model    = process.env.LLM_MODEL;
  const apiKey   = process.env.LLM_API_KEY;
  if (!endpoint || !model || !apiKey)
    return Promise.reject(new Error("Thiếu LLM_ENDPOINT / LLM_MODEL / LLM_API_KEY trong .env"));

  const url = new URL(endpoint);
  const body = JSON.stringify({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        path:     url.pathname + url.search,
        method:   "POST",
        headers: {
          "Content-Type":      "application/json",
          "Content-Length":    Buffer.byteLength(body),
          "x-api-key":         apiKey,
          "anthropic-version": "2023-06-01",
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            const j = JSON.parse(d);
            if (res.statusCode >= 400)
              return reject(new Error(`LLM ${res.statusCode}: ${j.error?.message || d.slice(0, 200)}`));
            // Anthropic Messages API: { content: [{ type:"text", text:"..." }] }
            const txt = (j.content || []).map((c) => c.text || "").join("").trim();
            if (!txt) return reject(new Error("LLM trả nội dung rỗng"));
            resolve(txt);
          } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
