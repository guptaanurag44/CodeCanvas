import { getRoom } from "../handlers/rooms.js";
import { prisma } from "../prismaClient.js";

const saveTimers = new Map(); 

export function registerCodeHandlers(io, socket) {
    socket.on("code-change", ({ roomId, code }) => {
        const room = getRoom(roomId);
        if (!room) return;

        const user = room.users.find((u) => u.socketId === socket.id);
        if (user?.role !== "editor") return; 

        room.code = code;
        socket.to(roomId).emit("code-change", code);

        
        if (saveTimers.has(roomId)) {
            clearTimeout(saveTimers.get(roomId));
        }
        const timer = setTimeout(async () => {
            try {
                await prisma.room.update({
                    where: { roomId },
                    data: { code: room.code },
                });
            } catch (err) {
                console.error(`[persist] failed to save code for room ${roomId}:`, err.message);
            }
            saveTimers.delete(roomId);
        }, 2000);
        saveTimers.set(roomId, timer);
    });

    socket.on("cursor-move", ({ roomId, position }) => {
        socket.to(roomId).emit("cursor-move", { socketId: socket.id, position });
    });
}