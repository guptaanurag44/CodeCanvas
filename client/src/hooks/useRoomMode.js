import { useState, useEffect } from "react";
import { socket } from "../socket";

export function useRoomMode(roomId) {
  const [mode, setMode] = useState("collab");

  useEffect(() => {
    socket.off("sync-mode");
    socket.off("mode-changed");

    socket.on("sync-mode", (initialMode) => {
      setMode(initialMode);
    });

    socket.on("mode-changed", ({ mode }) => {
      setMode(mode);
    });

    return () => {
      socket.off("sync-mode");
      socket.off("mode-changed");
    };
  }, []);

  const setRoomMode = (newMode) => {
    socket.emit("set-mode", { roomId, mode: newMode });
  };

  return { mode, setRoomMode };
}