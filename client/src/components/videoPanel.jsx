import { useEffect, useRef } from "react";

export function VideoPanel({
  localStream,
  remoteStream,
  callActive,
  isHost,
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
  onEndSession,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    return () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [remoteStream]);

  if (!callActive && !localStream) return null;

  const btnBase = {
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  };

  return (
    <div style={{
      position: "fixed", bottom: "20px", right: "20px",
      display: "flex", flexDirection: "column", gap: "8px",
      zIndex: 100,
    }}>
      {remoteStream && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "240px", height: "180px", borderRadius: "8px", background: "#000", border: "2px solid #cba6f7" }}
        />
      )}

      {localStream && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "120px", height: "90px", borderRadius: "8px", background: "#000", border: "2px solid #89b4fa", alignSelf: "flex-end" }}
        />
      )}

      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={onToggleMic}
          style={{ ...btnBase, background: micOn ? "#a6e3a1" : "#f38ba8", color: "#1e1e2e", flex: 1 }}
        >
          {micOn ? "🎙 Mic" : "🔇 Muted"}
        </button>
        <button
          onClick={onToggleCam}
          style={{ ...btnBase, background: camOn ? "#a6e3a1" : "#f38ba8", color: "#1e1e2e", flex: 1 }}
        >
          {camOn ? "📷 Cam" : "🚫 Cam"}
        </button>
      </div>

      {isHost && (
        <button
          onClick={onEndSession}
          style={{ ...btnBase, background: "#f38ba8", color: "#1e1e2e", width: "100%" }}
        >
          End Session
        </button>
      )}
    </div>
  );
}