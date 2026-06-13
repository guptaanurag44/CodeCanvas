import { getOrCreateRoom, addUserToRoom, removeUserFromAllRooms } from "../handlers/rooms.js";

export function registerRoomHandlers(io, socket) {
    socket.on("join", ({ username, roomId }) => {
        socket.join(roomId);

        const room = addUserToRoom(roomId, socket.id, username);

        console.log(`${username} joined room ${roomId}`);

        io.to(roomId).emit("user-list", room.users);
        socket.emit("sync-code", room.code);
        socket.emit("sync-messages", room.messages);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        const affectedRooms = removeUserFromAllRooms(socket.id);
        for (const { roomId, users } of affectedRooms) {
            io.to(roomId).emit("user-list", users);
        }
    });
}