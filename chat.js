export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).end(JSON.stringify({ error: "Method not allowed" }));
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).end(JSON.stringify({ error: "Messaggi non validi" }));
  }

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

    const text = await response.text();

    if (!response.ok) {
      let errMsg = "Errore API";
      try { errMsg = JSON.parse(text).error?.message || errMsg; } catch {}
      return res.status(response.status).end(JSON.stringify({ error: errMsg }));
    }

    let data;
    try { data = JSON.parse(text); } catch {
      return res.status(500).end(JSON.stringify({ error: "Risposta non valida da Groq" }));
    }

    const reply = data?.choices?.[0]?.message?.content || "Nessuna risposta";
    return res.status(200).end(JSON.stringify({ reply }));

  } catch (e) {
    return res.status(500).end(JSON.stringify({ error: "Errore interno: " + e.message }));
  }
}

