import { getRoom } from "../handlers/rooms.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function registerAIHandlers(io, socket) {
    socket.on("toggle-ai", ({ roomId }) => {
        const room = getRoom(roomId);
        if (!room) return;

        const requester = room.users.find((u) => u.socketId === socket.id);
        if (!requester?.isHost) return;

        room.aiEnabled = !room.aiEnabled;
        io.to(roomId).emit("ai-status", { aiEnabled: room.aiEnabled });
    });

    socket.on(
        "ai-request",
        async ({ roomId, question, username, includeContext }) => {
            const room = getRoom(roomId);
            if (!room) return;
            if (!room.aiEnabled) {
                socket.emit("ai-error", {
                    message: "AI assistance is disabled for this room.",
                });
                return;
            }

            const prompt = buildPrompt(
                question,
                includeContext ? room.code : null,
                room.language,
            );

            const userMessage = {
                role: "user",
                username,
                text: question,
                timestamp: Date.now(),
            };
            room.aiMessages.push(userMessage);

            io.to(roomId).emit("ai-question", {
                username,
                question,
                includeContext,
            });

            try {
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                });

                const result = await model.generateContentStream(prompt);

                let fullResponse = "";

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        fullResponse += text;

                        io.to(roomId).emit("ai-chunk", { text, username });
                    }
                }
                console.log("stream done, full length:", fullResponse.length);

                const aiMessage = {
                    role: "assistant",
                    text: fullResponse,
                    timestamp: Date.now(),
                };
                room.aiMessages.push(aiMessage);

                io.to(roomId).emit("ai-done", { username });

            } catch (err) {
                console.error("Gemini error:", err);
                io.to(roomId).emit("ai-error", {
                    message: "AI request failed: " + err.message,
                });
            }
        },
    );
}

function buildPrompt(question, code, language) {
    const hasCode = code && code.trim().length > 0;

    return `You are a friendly, expert programming assistant in a collaborative code editor.

${
    hasCode
        ? `Current language: ${language}
Current code in the editor:
\`\`\`${language}
${code}
\`\`\`

User's message: ${question}

Instructions:
- Answer based on the code above. Reference specific lines or issues where relevant.
- If the user asks something unrelated to the code (small talk, general question), respond naturally and briefly.
- Keep responses concise and precise.`
        : `User's message: ${question}

Instructions:
- Answer as a general programming assistant.
- Give clean, generic answers with examples where helpful.
- If the user asks something non-technical (like "hi"), respond conversationally.
- Keep responses concise.`
}`;

}
