import { useState } from "react";
import { useSocketEvents } from "./hooks/useSocketEvents";
import { JoinForm } from "./components/JoinForm";
import { RoomHeader } from "./components/RoomHeader";
import { CodeEditor } from "./components/CodeEditor";
import { ChatPanel } from "./components/ChatPanel";

function App() {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);

    const {
        users,
        code,
        remoteCursors,
        messages,
        typingUsers,
        joinRoom,
        handleEditorChange,
        sendMessage,
        handleTyping,
    } = useSocketEvents();

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
            <RoomHeader roomId={roomId} users={users} />
            <div style={{ display: "flex", flex: 1 }}>
                <CodeEditor
                    code={code}
                    onChange={(value) => handleEditorChange(value, roomId)}
                    roomId={roomId}
                    remoteCursors={remoteCursors}
                    users={users}
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
