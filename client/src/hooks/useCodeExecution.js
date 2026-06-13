import { useEffect, useState } from "react";
import { socket } from "../socket";

export function useCodeExecution() {
    const [output, setOutput] = useState(null);
    const [running, setRunning] = useState(false);
    const [runner, setRunner] = useState(null);

    useEffect(() => {
        socket.on("code-output", (data) => setOutput(data));
        socket.on("code-running", ({ running, username }) => {
            setRunning(running);
            setRunner(username);
        });

        return () => {
            socket.off("code-output");
            socket.off("code-running");
        };
    }, []);

    const runCode = (roomId, code, language, username) => {
        setOutput(null);
        socket.emit("run-code", { roomId, code, language, username });
    };

    return { output, running, runner, runCode };
}
