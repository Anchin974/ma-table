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
    // SET direct avec EX (90 jours)
    var payload = JSON.stringify(value);
    var response = await fetch(url + "/set/" + encodeURIComponent(key) + "?EX=7776000", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: payload
    });
    var data = await response.json();
    return res.status(200).json({ ok: data.result === "OK" });
  } catch (err) {
    return res.status(500).json({ error: "Erreur KV: " + err.message });
  }
}
