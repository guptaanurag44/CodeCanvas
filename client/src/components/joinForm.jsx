import { useState } from "react";

export function JoinForm({ onJoin }) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("collab");

  const handleJoin = () => {
    if (!roomId.trim() || !username.trim()) return;
    onJoin(roomId.trim(), username.trim(), mode);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#1e1e2e", color: "#cdd6f4", gap: "12px" }}>
      <h2 style={{ color: "#cba6f7", marginBottom: "8px" }}>CodeCanvas</h2>

      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #45475a", background: "#313244", color: "#cdd6f4", width: "240px" }}
      />
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #45475a", background: "#313244", color: "#cdd6f4", width: "240px" }}
      />

      {/* Mode selector */}
      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        <button
          onClick={() => setMode("collab")}
          style={{ padding: "8px 20px", borderRadius: "6px", border: `2px solid ${mode === "collab" ? "#cba6f7" : "#45475a"}`, background: mode === "collab" ? "#313244" : "transparent", color: mode === "collab" ? "#cba6f7" : "#6c7086", cursor: "pointer", fontWeight: mode === "collab" ? "bold" : "normal" }}
        >
          👥 Collab
        </button>
        <button
          onClick={() => setMode("interview")}
          style={{ padding: "8px 20px", borderRadius: "6px", border: `2px solid ${mode === "interview" ? "#cba6f7" : "#45475a"}`, background: mode === "interview" ? "#313244" : "transparent", color: mode === "interview" ? "#cba6f7" : "#6c7086", cursor: "pointer", fontWeight: mode === "interview" ? "bold" : "normal" }}
        >
          🎥 Interview
        </button>
      </div>

      <button
        onClick={handleJoin}
        style={{ padding: "8px 24px", background: "#cba6f7", color: "#1e1e2e", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: "4px" }}
      >
        Join Room
      </button>
    </div>
  );
}