import { useState } from "react";
import { useSocketEvents } from "./hooks/useSocketEvents";
import { JoinForm } from "./components/JoinForm";
import { RoomHeader } from "./components/RoomHeader";
import { CodeEditor } from "./components/CodeEditor";

function App() {
    const [roomId, setRoomId] = useState("");
    const [joined, setJoined] = useState(false);
    const { users, code, joinRoom, handleEditorChange, remoteCursors } = useSocketEvents();

    const handleJoin = (roomId, username) => {
        setRoomId(roomId);
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
            <CodeEditor
                code={code}
                onChange={(value) => handleEditorChange(value, roomId)}
                roomId={roomId}
                remoteCursors={remoteCursors}
                users={users}
            />
        </div>
    );
}

export default App;
