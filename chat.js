export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Messaggi non validi" });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "You are OracleX, a powerful and mysterious AI oracle. Speak with authority and enigmatic wisdom. Always respond in the same language the user writes in.",
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || "Errore API" });
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (e) {
    return res.status(500).json({ error: "Errore interno" });
  }
}
