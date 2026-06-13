import { socket } from "../socket";

export function RoomHeader({ roomId, users, isHost }) {
    const handleRoleChange = (targetSocketId, currentRole) => {
        const newRole = currentRole === "editor" ? "viewer" : "editor";
        socket.emit("change-role", { roomId, targetSocketId, newRole });
    };

    return (
        <div style={{ padding: "8px", background: "#222", color: "#fff" }}>
            <span>Room: {roomId} | Users: </span>
            {users.map((u) => (
                <span key={u.socketId} style={{ marginRight: "8px" }}>
                    {u.username} ({u.role}
                    {u.isHost ? ", host" : ""})
                    {isHost && !u.isHost && (
                        <button
                            onClick={() => handleRoleChange(u.socketId, u.role)}
                            style={{ marginLeft: "4px" }}
                        >
                            {u.role === "editor"
                                ? "Make Viewer"
                                : "Make Editor"}
                        </button>
                    )}
                </span>
            ))}
        </div>
    );
}
