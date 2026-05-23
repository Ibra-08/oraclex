export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messaggi non validi" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are OracleX, a powerful and mysterious AI oracle. You speak with authority, depth, and a touch of enigmatic wisdom. Be helpful but maintain an air of ancient knowledge and cosmic perspective. Always respond in the same language the user writes in.",
        messages,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData.error?.message || "Errore API" });
    }

    const data = await response.json();
    const reply = data.content.map(b => b.text || "").join("");
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: "Errore interno del server" });
  }
}
