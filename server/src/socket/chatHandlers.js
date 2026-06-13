import { getRoom } from "../handlers/rooms.js";

export function registerChatHandlers(io, socket) {
    socket.on("chat-message", ({ roomId, username, text }) => {
        const room = getRoom(roomId);
        if (!room) return;

        const message = { username, text, timestamp: Date.now() };
        room.messages.push(message);

        io.to(roomId).emit("chat-message", message);
    });

    socket.on("typing", ({ roomId, username }) => {
        socket.to(roomId).emit("typing", { socketId: socket.id, username });
    });

    socket.on("stop-typing", ({ roomId }) => {
        socket.to(roomId).emit("stop-typing", { socketId: socket.id });
    });
}