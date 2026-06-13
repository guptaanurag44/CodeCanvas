import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";

export function useSocketEvents() {
    const [users, setUsers] = useState([]);
    const [code, setCode] = useState("");
    const [remoteCursors, setRemoteCursors] = useState({});
    const isRemoteChange = useRef(false);

    useEffect(() => {
        socket.connect();

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

        socket.on("sync-code", (initialCode) => {
            isRemoteChange.current = true;
            setCode(initialCode);
        });

        socket.on("code-change", (newCode) => {
            isRemoteChange.current = true;
            setCode(newCode);
        });

        socket.on("cursor-move", ({ socketId, position }) => {
            setRemoteCursors((prev) => ({ ...prev, [socketId]: position }));
        });

        return () => {
            socket.disconnect();
            socket.off("user-list");
            socket.off("sync-code");
            socket.off("code-change");
            socket.off("cursor-move");
        };
    }, []);

    const joinRoom = (roomId, username) => {
        socket.emit("join", { roomId, username });
    };

    const handleEditorChange = (value, roomId) => {
        if (isRemoteChange.current) {
            isRemoteChange.current = false;
            setCode(value);
            return;
        }
        setCode(value);
        socket.emit("code-change", { roomId, code: value });
    };

    return { users, code, remoteCursors, joinRoom, handleEditorChange };
}
