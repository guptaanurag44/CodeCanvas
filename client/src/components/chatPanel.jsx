import { useState } from "react";

export function ChatPanel({
    messages,
    typingUsers,
    username,
    onSend,
    onTyping,
}) {
    const [text, setText] = useState("");

    const handleSubmit = () => {
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    const handleChange = (e) => {
        setText(e.target.value);
        onTyping();
    };

    const typingNames = Object.values(typingUsers).filter(
        (name) => name !== username,
    );

    return (
        <div
            style={{
                width: "250px",
                display: "flex",
                flexDirection: "column",
                borderLeft: "1px solid #444",
                color: "#fff",
            }}
        >
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {messages.map((m, i) => (
                    <div key={i}>
                        <strong>{m.username}: </strong>
                        {m.text}
                    </div>
                ))}
                {typingNames.length > 0 && (
                    <div style={{ fontStyle: "italic", color: "#aaa" }}>
                        {typingNames.join(", ")} typing...
                    </div>
                )}
            </div>
            <div style={{ display: "flex" }}>
                <input
                    value={text}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Type a message..."
                    style={{ flex: 1 }}
                />
                <button onClick={handleSubmit}>Send</button>
            </div>
        </div>
    );
}
