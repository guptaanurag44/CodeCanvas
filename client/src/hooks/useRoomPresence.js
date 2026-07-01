import { useEffect, useState } from "react";
import { socket } from "../socket";

export function useRoomPresence() {
    const [users, setUsers] = useState([]);
    const [remoteCursors, setRemoteCursors] = useState({});

    useEffect(() => {
        socket.on("user-list", (userList) => {
            setUsers(userList);

            setRemoteCursors((prev) => {
                const activeIds = new Set(userList.map((u) => u.socketId));
                const filtered = {};
                for (const [id, pos] of Object.entries(prev)) {
                    if (activeIds.has(id)) filtered[id] = pos;
                }
                return filtered;
            });
        });

        socket.on("cursor-move", ({ socketId, position }) => {
            setRemoteCursors((prev) => ({ ...prev, [socketId]: position }));
        });

        return () => {
            socket.off("user-list");
            socket.off("cursor-move");
        };
    }, []);

const joinRoom = (roomId, username, mode = "collab") => {
  socket.emit("join", { username, roomId, mode });
};

    return { users, remoteCursors, joinRoom };
}