import https from "https";
import querystring from "querystring";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const text = process.argv[2] || "Done!";

if (!TOKEN || !CHAT_ID) {
  console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
  process.exit(1);
}

const body = querystring.stringify({ chat_id: CHAT_ID, text });
const req = https.request(
  {
    hostname: "api.telegram.org",
    path: `/bot${TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
    },
  },
  (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      const j = JSON.parse(d);
      if (j.ok) console.log("Sent:", text);
      else console.error("Error:", j.description);
    });
  }
);
req.write(body);
req.end();
