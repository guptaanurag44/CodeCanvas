import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";

export function useCodeSync() {
    const [code, setCode] = useState("");
    const isRemoteChange = useRef(false);

    useEffect(() => {
        socket.on("sync-code", (initialCode) => {
            isRemoteChange.current = true;
            setCode(initialCode);
        });

        socket.on("code-change", (newCode) => {
            isRemoteChange.current = true;
            setCode(newCode);
        });

        return () => {
            socket.off("sync-code");
            socket.off("code-change");
        };
    }, []);

    const handleEditorChange = (value, roomId) => {
        if (isRemoteChange.current) {
            isRemoteChange.current = false;
            setCode(value);
            return;
        }
        setCode(value);
        socket.emit("code-change", { roomId, code: value });
    };

    return { code, handleEditorChange };
}