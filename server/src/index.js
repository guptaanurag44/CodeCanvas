import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerRoomHandlers } from "./socket/roomHandlers.js";
import { registerCodeHandlers } from "./socket/codeHandlers.js";
import { registerChatHandlers } from "./socket/chatHandlers.js";
import { registerExecuteHandlers } from "./socket/executeHandlers.js";
import { registerAIHandlers } from "./socket/aiHandlers.js";
import {registerWebRTCHandlers} from './socket/webRTCHandlers.js'

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

const server = createServer(app);



const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    registerRoomHandlers(io, socket);
    registerCodeHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerExecuteHandlers(io, socket);
    registerAIHandlers(io, socket);
    registerWebRTCHandlers(io, socket);
});

const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
