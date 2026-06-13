import { useState } from "react";
import { useSocketConnection } from "./hooks/useSocketConnection";
import { useRoomPresence } from "./hooks/useRoomPresence";
import { useCodeSync } from "./hooks/useCodeSync";
import { useChat } from "./hooks/useChat";
import { JoinForm } from "./components/JoinForm";
import { RoomHeader } from "./components/RoomHeader";
import { CodeEditor } from "./components/CodeEditor";
import { ChatPanel } from "./components/ChatPanel";
import { socket } from "./socket";

function App() {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);

    useSocketConnection();
    const { users, remoteCursors, joinRoom } = useRoomPresence();
    const { code, handleEditorChange } = useCodeSync();
    const { messages, typingUsers, sendMessage, handleTyping } = useChat();

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
            <div style={{ display: "flex", flex: 1 }}>
                <CodeEditor
                    code={code}
                    onChange={(value) => handleEditorChange(value, roomId)}
                    roomId={roomId}
                    remoteCursors={remoteCursors}
                    users={users}
                    readOnly={isViewer}
                />
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
