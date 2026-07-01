export function registerWebRTCHandlers(io, socket) {
    // Peer A sends offer → server forwards to everyone else in the room
    socket.on("webrtc-offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("webrtc-offer", {
            offer,
            fromSocketId: socket.id,
        });
    });

    // Peer B sends answer → server forwards to everyone else
    socket.on("webrtc-answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("webrtc-answer", {
            answer,
            fromSocketId: socket.id,
        });
    });

    // Each peer sends ICE candidates as they're discovered → relay to others
    socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("webrtc-ice-candidate", {
            candidate,
            fromSocketId: socket.id,
        });
    });

    socket.on("end-session", ({ roomId }) => {
        // Broadcast to everyone else in the room
        socket.to(roomId).emit("session-ended");
    });
}
