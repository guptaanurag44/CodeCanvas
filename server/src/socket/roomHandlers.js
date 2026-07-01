import {
    getOrCreateRoom,
    addUserToRoom,
    removeUserFromAllRooms,
    getRoom,
    setRoomMode,
} from "../handlers/rooms.js";
import { prisma } from "../prismaClient.js";

export function registerRoomHandlers(io, socket) {
    socket.on("join", async ({ username, roomId, mode }) => {
        socket.join(roomId);

        const room = addUserToRoom(roomId, socket.id, username);

        if (room.users.length === 1 && mode) {
            room.mode = mode;
        }

        if (room.users.length === 1) {
            try {
                const savedRoom = await prisma.room.findUnique({
                    where: { roomId },
                });
                if (savedRoom) {
                    room.code = savedRoom.code;
                    room.language = savedRoom.language;
                } else {
                    await prisma.room.create({
                        data: {
                            roomId,
                            code: room.code || "",
                            language: room.language || "javascript",
                        },
                    });
                }
            } catch (err) {
                console.error(
                    `[persist] failed to load/create room ${roomId}:`,
                    err.message,
                );
            }
        }

        console.log(`${username} joined room ${roomId}`);

        io.to(roomId).emit("user-list", room.users);
        socket.emit("sync-code", room.code);
        socket.emit("sync-messages", room.messages);
        socket.emit("sync-language", room.language);
        socket.emit("sync-mode", room.mode);
    });

    socket.on("set-mode", ({ roomId, mode }) => {
        const room = getRoom(roomId);
        if (!room) return;
        const requester = room.users.find((u) => u.socketId === socket.id);
        if (!requester?.isHost) return; // host only
        if (mode !== "collab" && mode !== "interview") return; // validate
        setRoomMode(roomId, mode);
        io.to(roomId).emit("mode-changed", { mode });
    });

    socket.on("change-role", ({ roomId, targetSocketId, newRole }) => {
        const room = getRoom(roomId);
        if (!room) return;

        const requester = room.users.find((u) => u.socketId === socket.id);
        if (!requester?.isHost) return;

        const target = room.users.find((u) => u.socketId === targetSocketId);
        if (!target) return;
        if (target.isHost) return;

        target.role = newRole;
        io.to(roomId).emit("user-list", room.users);
    });

    socket.on("language-change", ({ roomId, language }) => {
        const room = getRoom(roomId);
        if (!room) return;
        room.language = language;
        io.to(roomId).emit("language-change", language);

        prisma.room
            .update({ where: { roomId }, data: { language } })
            .catch((err) =>
                console.error(
                    `[persist] failed to save language for room ${roomId}:`,
                    err.message,
                ),
            );
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        const affectedRooms = removeUserFromAllRooms(socket.id);
        for (const { roomId, users } of affectedRooms) {
            io.to(roomId).emit("user-list", users);
        }
    });
}
