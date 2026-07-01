import {
    getOrCreateRoom,
    addUserToRoom,
    removeUserFromAllRooms,
    getRoom,
    setRoomMode
} from "../handlers/rooms.js";

export function registerRoomHandlers(io, socket) {
    socket.on("join", ({ username, roomId ,mode}) => {
        socket.join(roomId);

        const room = addUserToRoom(roomId, socket.id, username);
          // Only host sets the mode — first joiner determines room mode
  if (room.users.length === 1 && mode) {
    room.mode = mode;
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
        if (!requester?.isHost) return;           // host only
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
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        const affectedRooms = removeUserFromAllRooms(socket.id);
        for (const { roomId, users } of affectedRooms) {
            io.to(roomId).emit("user-list", users);
        }
    });
}
