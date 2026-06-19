import { useState } from "react";

export function AIPanel({
    username,
    isHost,
    aiMessages,
    streamingText,
    isStreaming,
    aiEnabled,
    sendAIRequest,
    toggleAI,
}) {
    const [input, setInput] = useState("");
    const [includeContext, setIncludeContext] = useState(false);

    const handleSend = () => {
        if (!input.trim() || isStreaming) return;
        sendAIRequest(input.trim(), username, includeContext);
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "#1e1e2e",
                color: "#cdd6f4",
                fontFamily: "monospace",
                width: "300px",
                borderLeft: "1px solid #313244",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid #313244",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span style={{ fontWeight: "bold" }}>🤖 AI Assistant</span>
                {isHost ? (
                    <button
                        onClick={toggleAI}
                        style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            background: aiEnabled ? "#a6e3a1" : "#f38ba8",
                            color: "#1e1e2e",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        {aiEnabled ? "AI: ON" : "AI: OFF"}
                    </button>
                ) : (
                    <span
                        style={{
                            fontSize: "11px",
                            color: aiEnabled ? "#a6e3a1" : "#f38ba8",
                        }}
                    >
                        {aiEnabled ? "AI: ON" : "AI: OFF"}
                    </span>
                )}
            </div>

            {/* Message history */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                }}
            >
                {aiMessages.length === 0 && (
                    <div
                        style={{
                            color: "#6c7086",
                            fontSize: "13px",
                            textAlign: "center",
                            marginTop: "20px",
                        }}
                    >
                        Ask the AI about your code...
                    </div>
                )}

                {aiMessages.map((msg) => (
                    <div key={msg.id}>
                        {msg.role === "user" && (
                            <div>
                                <div
                                    style={{
                                        fontSize: "11px",
                                        marginBottom: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                    }}
                                >
                                    <span style={{ color: "#89b4fa" }}>
                                        {msg.username}
                                    </span>
                                    {msg.includeContext && (
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                background: "#313244",
                                                color: "#cba6f7",
                                                padding: "1px 5px",
                                                borderRadius: "3px",
                                            }}
                                        >
                                            📎 with code
                                        </span>
                                    )}
                                </div>
                                <div
                                    style={{
                                        background: "#313244",
                                        borderRadius: "6px",
                                        padding: "8px 10px",
                                        fontSize: "13px",
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        )}
                        {msg.role === "assistant" && (
                            <div
                                style={{
                                    borderLeft: "2px solid #cba6f7",
                                    paddingLeft: "10px",
                                    fontSize: "13px",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {msg.text}
                            </div>
                        )}
                        {msg.role === "error" && (
                            <div style={{ color: "#f38ba8", fontSize: "12px" }}>
                                {msg.text}
                            </div>
                        )}
                    </div>
                ))}

                {/* Live streaming response */}
                {isStreaming && (
                    <div
                        style={{
                            borderLeft: "2px solid #cba6f7",
                            paddingLeft: "10px",
                            fontSize: "13px",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {streamingText}
                        <span
                            style={{ animation: "blink 1s step-end infinite" }}
                        >
                            ▋
                        </span>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div style={{ padding: "10px", borderTop: "1px solid #313244" }}>
                {!aiEnabled && (
                    <div
                        style={{
                            color: "#f38ba8",
                            fontSize: "12px",
                            marginBottom: "6px",
                        }}
                    >
                        AI is disabled by the host.
                    </div>
                )}

                {/* Context toggle */}
                <div
                    onClick={() => setIncludeContext((prev) => !prev)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "8px",
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: "12px",
                        color: includeContext ? "#cba6f7" : "#6c7086",
                    }}
                >
                    <div
                        style={{
                            width: "28px",
                            height: "15px",
                            borderRadius: "8px",
                            background: includeContext ? "#cba6f7" : "#45475a",
                            position: "relative",
                            transition: "background 0.2s",
                        }}
                    >
                        <div
                            style={{
                                width: "11px",
                                height: "11px",
                                borderRadius: "50%",
                                background: "#fff",
                                position: "absolute",
                                top: "2px",
                                left: includeContext ? "15px" : "2px",
                                transition: "left 0.2s",
                            }}
                        />
                    </div>
                    📎 Share code context
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            aiEnabled
                                ? "Ask anything... (Enter to send)"
                                : "AI is disabled"
                        }
                        disabled={!aiEnabled || isStreaming}
                        rows={2}
                        style={{
                            flex: 1,
                            background: "#313244",
                            color: "#cdd6f4",
                            border: `1px solid ${includeContext ? "#cba6f7" : "#45475a"}`,
                            borderRadius: "6px",
                            padding: "8px",
                            fontSize: "13px",
                            resize: "none",
                            fontFamily: "monospace",
                            transition: "border 0.2s",
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!aiEnabled || isStreaming || !input.trim()}
                        style={{
                            padding: "0 14px",
                            background: "#cba6f7",
                            color: "#1e1e2e",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            opacity: !aiEnabled || isStreaming ? 0.5 : 1,
                        }}
                    >
                        {isStreaming ? "..." : "Ask"}
                    </button>
                </div>
            </div>

            <style>{`@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`}</style>
        </div>
    );
}
