export function RoomHeader({ roomId, users }) {
  return (
    <div style={{ padding: "8px", background: "#222", color: "#fff" }}>
      <span>Room: {roomId} | </span>
      <span>Users: {users.map((u) => u.username).join(", ")}</span>
    </div>
  );
}