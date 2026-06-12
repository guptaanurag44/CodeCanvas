import { useEffect, useState, useRef } from "react";
import { socket } from "./socket.js";
import Editor from "@monaco-editor/react";

function App() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState("");

  const isRemoteChange = useRef(false);

  useEffect(() => {
    socket.connect();

    socket.on("user-list", (userList) => setUsers(userList));

    socket.on("sync-code", (initialCode) => {
      isRemoteChange.current = true;
      setCode(initialCode);
    });

    socket.on("code-change", (newCode) => {
      isRemoteChange.current = true;
      setCode(newCode);
    });

    return () => {
      socket.disconnect();
      socket.off("user-list");
      socket.off("sync-code");
      socket.off("code-change");
    };
  }, []);

  const handleJoin = () => {
    socket.emit("join", { roomId, username });
    setJoined(true);
  };

  const handleEditorChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      setCode(value);
      return;
    }
    setCode(value);
    socket.emit("code-change", { roomId, code: value });
  };

  if (!joined) {
    return (
      <div>
        <h1>CodeCanvas</h1>
        <input placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <button onClick={handleJoin}>Join Room</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ padding: "8px", background: "#222", color: "#fff" }}>
        <span>Room: {roomId} | </span>
        <span>Users: {users.map((u) => u.username).join(", ")}</span>
      </div>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language="cpp"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
        />
      </div>
    </div>
  );
}

export default App;
