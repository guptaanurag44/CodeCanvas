import { getRoom } from "../handlers/rooms.js";

export function registerCodeHandlers(io, socket) {
    socket.on("code-change", ({ roomId, code }) => {
        const room = getRoom(roomId);
        if (!room) return;
        room.code = code;
        socket.to(roomId).emit("code-change", code);
    });

    socket.on("cursor-move", ({ roomId, position }) => {
        socket.to(roomId).emit("cursor-move", { socketId: socket.id, position });
    });
}