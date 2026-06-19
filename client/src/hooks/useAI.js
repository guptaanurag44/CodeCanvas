import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

export function useAI(roomId) {
    const [aiMessages, setAiMessages] = useState([]);
    const [streamingText, setStreamingText] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const streamingTextRef = useRef("");

    useEffect(() => {
        socket.off("ai-question");
        socket.off("ai-chunk");
        socket.off("ai-done");
        socket.off("ai-error");
        socket.off("ai-status");

        socket.on("ai-question", ({ username, question, includeContext }) => {
            streamingTextRef.current = "";
            setAiMessages((prev) => [
                ...prev,
                {
                    role: "user",
                    username,
                    text: question,
                    includeContext,
                    id: Date.now(),
                },
            ]);
            setStreamingText("");
            setIsStreaming(true);
        });

        socket.on("ai-chunk", ({ text }) => {
            streamingTextRef.current += text;
            setStreamingText((prev) => prev + text);
        });

        socket.on("ai-done", () => {
            const finalText = streamingTextRef.current;
            if (!finalText) return;
            setIsStreaming(false);
            setAiMessages((msgs) => [
                ...msgs,
                { role: "assistant", text: finalText, id: Date.now() },
            ]);
            streamingTextRef.current = "";
            setStreamingText("");
        });

        socket.on("ai-error", ({ message }) => {
            setIsStreaming(false);
            setStreamingText("");
            setAiMessages((prev) => [
                ...prev,
                { role: "error", text: message, id: Date.now() },
            ]);
        });

        socket.on("ai-status", ({ aiEnabled }) => {
            setAiEnabled(aiEnabled);
        });

        return () => {
            socket.off("ai-question");
            socket.off("ai-chunk");
            socket.off("ai-done");
            socket.off("ai-error");
            socket.off("ai-status");
        };
    }, []);

    const sendAIRequest = (question, username, includeContext) => {
        if (!question.trim() || isStreaming) return;
        socket.emit("ai-request", {
            roomId,
            question,
            username,
            includeContext,
        });
    };

    const toggleAI = () => {
        socket.emit("toggle-ai", { roomId });
    };

    return {
        aiMessages,
        streamingText,
        isStreaming,
        aiEnabled,
        sendAIRequest,
        toggleAI,
    };
}
