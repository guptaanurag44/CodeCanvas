import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import debounce from "lodash.debounce";

export function useSocketEvents() {
    const [users, setUsers] = useState([]);
    const [code, setCode] = useState("");
    const [remoteCursors, setRemoteCursors] = useState({});
    const isRemoteChange = useRef(false);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});

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
        socket.on("sync-messages", (initialMessages) => {
            setMessages(initialMessages);
        });

        socket.on("chat-message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on("typing", ({ socketId, username }) => {
            setTypingUsers((prev) => ({ ...prev, [socketId]: username }));
        });

        socket.on("stop-typing", ({ socketId }) => {
            setTypingUsers((prev) => {
                const updated = { ...prev };
                delete updated[socketId];
                return updated;
            });
        });
        return () => {
            socket.disconnect();
            socket.off("user-list");
            socket.off("sync-code");
            socket.off("code-change");
            socket.off("cursor-move");
            socket.off("sync-messages");
            socket.off("chat-message");
            socket.off("typing");
            socket.off("stop-typing");
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
    const debouncedStopTyping = useRef(
        debounce((roomId) => {
            socket.emit("stop-typing", { roomId });
        }, 1500),
    ).current;

    const sendMessage = (roomId, username, text) => {
        socket.emit("chat-message", { roomId, username, text });
    };

    const handleTyping = (roomId, username) => {
        socket.emit("typing", { roomId, username });
        debouncedStopTyping(roomId);
    };
    return {
        users,
        code,
        remoteCursors,
        messages,
        typingUsers,
        joinRoom,
        handleEditorChange,
        sendMessage,
        handleTyping,
    };
}
