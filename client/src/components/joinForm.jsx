import { useState } from "react";

export function JoinForm({ onJoin }) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = () => {
    onJoin(roomId, username);
  };

  return (
    <div>
      <h1>CodeCanvas</h1>
      <input placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={handleSubmit}>Join Room</button>
    </div>
  );
}