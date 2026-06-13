import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";

export function useCodeSync() {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
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

        socket.on("sync-language", (lang) => setLanguage(lang));
        socket.on("language-change", (lang) => setLanguage(lang));
        return () => {
            socket.off("sync-code");
            socket.off("code-change");
            socket.off("sync-language");
            socket.off("language-change");
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
    const changeLanguage = (roomId, newLanguage) => {
        socket.emit("language-change", { roomId, language: newLanguage });
    };

    return { code, handleEditorChange, language, changeLanguage };
}
