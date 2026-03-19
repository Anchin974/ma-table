export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  var key = req.query.key;
  if (!key) return res.status(400).json({ error: "Parametre key manquant" });

  var url = process.env.UPSTASH_REDIS_REST_URL;
  var token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(500).json({ error: "KV non configure" });

  try {
    var response = await fetch(url + "/get/" + encodeURIComponent(key), {
      headers: { Authorization: "Bearer " + token }
    });
    var data = await response.json();
    if (data.result === null || data.result === undefined) {
      return res.status(200).json({ value: null });
    }
    // Upstash retourne la valeur comme une chaîne JSON — on la parse
    try {
      return res.status(200).json({ value: JSON.parse(data.result) });
    } catch(e) {
      return res.status(200).json({ value: data.result });
    }
  } catch (err) {
    return res.status(500).json({ error: "Erreur KV: " + err.message });
  }
}
