import { useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { socket } from "../socket";

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});

    useEffect(() => {
        socket.on("sync-messages", (initialMessages) => {
            setMessages(initialMessages);
        });

        socket.on("chat-message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on("typing", ({ socketId, username }) => {
            setTypingUsers((prev) => ({ ...prev, [socketId]: username }));
        });

        socket.on("stop-typing", ({ socketId }) => {
            setTypingUsers((prev) => {
                const updated = { ...prev };
                delete updated[socketId];
                return updated;
            });
        });

        return () => {
            socket.off("sync-messages");
            socket.off("chat-message");
            socket.off("typing");
            socket.off("stop-typing");
        };
    }, []);

    const debouncedStopTyping = useRef(
        debounce((roomId) => {
            socket.emit("stop-typing", { roomId });
        }, 1500),
    ).current;

    const sendMessage = (roomId, username, text) => {
        socket.emit("chat-message", { roomId, username, text });
    };

    const handleTyping = (roomId, username) => {
        socket.emit("typing", { roomId, username });
        debouncedStopTyping(roomId);
    };

    return { messages, typingUsers, sendMessage, handleTyping };
}
