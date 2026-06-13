import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const rooms = new Map();

const COLORS = [
    "#e57373",
    "#64b5f6",
    "#81c784",
    "#ffb74d",
    "#ba68c8",
    "#4db6ac",
];

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join", ({ username, roomId }) => {
        socket.join(roomId);

        const room = rooms.get(roomId) || { users: [], code: "" };
        const color = COLORS[room.users.length % COLORS.length];
        room.users.push({ socketId: socket.id, username, color });
        rooms.set(roomId, room);

        console.log(`${username} joined room ${roomId}`);

        io.to(roomId).emit("user-list", room.users);
        socket.emit("sync-code", room.code);
    });

    socket.on("code-change", ({ roomId, code }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        room.code = code;
        socket.to(roomId).emit("code-change", code);
    });

    socket.on("cursor-move", ({ roomId, position }) => {
        socket
            .to(roomId)
            .emit("cursor-move", { socketId: socket.id, position });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        for (const [roomId, room] of rooms.entries()) {
            const updatedUsers = room.users.filter(
                (u) => u.socketId !== socket.id,
            );
            if (updatedUsers.length !== room.users.length) {
                room.users = updatedUsers;
                io.to(roomId).emit("user-list", updatedUsers);
            }
        }
    });
});

const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
