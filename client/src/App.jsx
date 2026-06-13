import { useState } from "react";
import { useSocketConnection } from "./hooks/useSocketConnection";
import { useRoomPresence } from "./hooks/useRoomPresence";
import { useCodeSync } from "./hooks/useCodeSync";
import { useChat } from "./hooks/useChat";
import { useCodeExecution } from "./hooks/useCodeExecution";
import { JoinForm } from "./components/JoinForm";
import { RoomHeader } from "./components/RoomHeader";
import { CodeEditor } from "./components/CodeEditor";
import { ChatPanel } from "./components/ChatPanel";
import { OutputPanel } from "./components/OutputPanel";
import { socket } from "./socket";

function App() {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);

    useSocketConnection();
    const { users, remoteCursors, joinRoom } = useRoomPresence();
    const { code, language, handleEditorChange, changeLanguage } =
        useCodeSync();
    const { messages, typingUsers, sendMessage, handleTyping } = useChat();
    const { output, running, runCode, runner } = useCodeExecution();

    const currentUser = users.find((u) => u.socketId === socket.id);
    const isViewer = currentUser?.role === "viewer";
    const isHost = currentUser?.isHost === true;

    const handleJoin = (roomId, username) => {
        setRoomId(roomId);
        setUsername(username);
        joinRoom(roomId, username);
        setJoined(true);
    };

    if (!joined) {
        return <JoinForm onJoin={handleJoin} />;
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
            }}
        >
            <RoomHeader roomId={roomId} users={users} isHost={isHost} />

            <div
                style={{
                    padding: "8px",
                    background: "#333",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                }}
            >
                <select
                    value={language}
                    onChange={(e) => changeLanguage(roomId, e.target.value)}
                    disabled={isViewer}
                >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                </select>
                <button
                    onClick={() => runCode(roomId, code, language, username)}
                    disabled={running || isViewer}
                >
                    {running ? "Running..." : "Run"}
                </button>
            </div>

            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                    }}
                >
                    <CodeEditor
                        code={code}
                        language={language}
                        onChange={(value) => handleEditorChange(value, roomId)}
                        roomId={roomId}
                        remoteCursors={remoteCursors}
                        users={users}
                        readOnly={isViewer}
                    />
                    <OutputPanel
                        output={output}
                        running={running}
                        runner={runner}
                        currentUsername={username}
                    />
                </div>
                <ChatPanel
                    messages={messages}
                    typingUsers={typingUsers}
                    username={username}
                    onSend={(text) => sendMessage(roomId, username, text)}
                    onTyping={() => handleTyping(roomId, username)}
                />
            </div>
        </div>
    );
}

export default App;
