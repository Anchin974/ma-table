export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var url = process.env.UPSTASH_REDIS_REST_URL;
  var token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(500).json({ error: "KV non configure" });

  var key = req.body && req.body.key;
  var value = req.body && req.body.value;
  if (!key) return res.status(400).json({ error: "Parametre key manquant" });

  try {
    var payload = JSON.stringify(value);
    var response = await fetch(url + "/pipeline", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([["SET", key, payload, "EX", 7776000]])
    });
    await response.json();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Erreur KV: " + err.message });
  }
}
