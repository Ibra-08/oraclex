import { useState, useRef, useEffect } from "react";

const ORB_SVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <defs>
      <radialGradient id="orbGrad" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#1e0033" stopOpacity="1" />
      </radialGradient>
      <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
      </radialGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="4" /></filter>
    </defs>
    <circle cx="40" cy="40" r="38" fill="url(#glowGrad)" filter="url(#blur)" />
    <circle cx="40" cy="40" r="30" fill="url(#orbGrad)" />
    <ellipse cx="33" cy="30" rx="8" ry="5" fill="white" fillOpacity="0.18" />
    <circle cx="40" cy="40" r="30" stroke="#a855f7" strokeWidth="0.8" strokeOpacity="0.6" />
    <circle cx="40" cy="40" r="36" stroke="#7c3aed" strokeWidth="0.4" strokeOpacity="0.3" strokeDasharray="4 3" />
  </svg>
);

const ThinkingDots = () => (
  <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "#a855f7",
        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </div>
);

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Errore API");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError("⚠️ " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080010",
      fontFamily: "'Georgia', serif",
      color: "#e2d9f3",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.6; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 2px; }
        textarea:focus { outline: none; }
      `}</style>

      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            borderRadius: "50%",
            background: "white",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
            animation: `starTwinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 3}s infinite`,
          }} />
        ))}
      </div>

      <div style={{
        position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse, #4c1d9520 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 720,
        padding: "32px 24px 16px",
        textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ animation: "orbFloat 4s ease-in-out infinite", display: "inline-block", marginBottom: 12 }}>
          <ORB_SVG />
        </div>
        <h1 style={{
          fontSize: "2.4rem", fontWeight: 400, letterSpacing: "0.18em",
          margin: "0 0 4px",
          background: "linear-gradient(135deg, #e9d5ff, #a855f7, #c084fc)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>ORACLE<span style={{ fontWeight: 700 }}>X</span></h1>
        <p style={{ fontSize: "0.78rem", letterSpacing: "0.3em", color: "#7c3aed", margin: 0, textTransform: "uppercase" }}>
          Ancient Wisdom · Infinite Knowledge
        </p>
      </div>

      {/* Chat */}
      <div style={{
        width: "100%", maxWidth: 720,
        flex: 1, display: "flex", flexDirection: "column",
        padding: "0 16px 16px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          flex: 1, overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 16,
          minHeight: 0, maxHeight: "60vh",
          padding: "8px 4px",
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              color: "#4c1d95", fontSize: "0.85rem",
              letterSpacing: "0.08em", animation: "fadeIn 0.8s ease",
            }}>
              <p style={{ margin: 0 }}>✦ L'Oracolo è pronto a rispondere ✦</p>
              <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: "#3b1066" }}>
                Poni la tua domanda al cosmo
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "fadeIn 0.3s ease",
            }}>
              <div style={{
                maxWidth: "80%", padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #5b21b6, #4c1d95)"
                  : "linear-gradient(135deg, #1a0030, #12001f)",
                border: msg.role === "user" ? "1px solid #7c3aed60" : "1px solid #4c1d9540",
                fontSize: "0.88rem", lineHeight: 1.6,
                color: msg.role === "user" ? "#f3e8ff" : "#d8b4fe",
                whiteSpace: "pre-wrap",
              }}>
                {msg.role === "assistant" && (
                  <span style={{ fontSize: "0.65rem", color: "#7c3aed", display: "block", marginBottom: 6, letterSpacing: "0.15em" }}>
                    ✦ ORACLEX
                  </span>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "12px 16px",
                background: "linear-gradient(135deg, #1a0030, #12001f)",
                border: "1px solid #4c1d9540",
                borderRadius: "18px 18px 18px 4px",
              }}>
                <ThinkingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p style={{ color: "#f87171", fontSize: "0.78rem", textAlign: "center", margin: "8px 0" }}>{error}</p>}

        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end", marginTop: 12,
          background: "linear-gradient(135deg, #1a0030, #0d0020)",
          border: "1px solid #4c1d9560",
          borderRadius: 16, padding: "10px 12px",
          boxShadow: "0 0 30px #7c3aed18",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chiedi all'Oracolo..."
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#e2d9f3", fontSize: "0.9rem",
              fontFamily: "Georgia, serif", resize: "none",
              lineHeight: 1.5, maxHeight: 120, overflowY: "auto",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: loading || !input.trim() ? "#2d1060" : "linear-gradient(135deg, #a855f7, #7c3aed)",
              border: "none", cursor: loading || !input.trim() ? "default" : "pointer",
              color: "white", fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >✦</button>
        </div>
        <p style={{ textAlign: "center", fontSize: "0.65rem", color: "#3b1066", margin: "8px 0 0", letterSpacing: "0.1em" }}>
          ENTER per inviare · SHIFT+ENTER per nuova riga
        </p>
      </div>
    </div>
  );
}
