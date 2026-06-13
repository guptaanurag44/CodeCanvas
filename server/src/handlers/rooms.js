const rooms = new Map();

const COLORS = [
    "#e57373",
    "#64b5f6",
    "#81c784",
    "#ffb74d",
    "#ba68c8",
    "#4db6ac",
];

export function getOrCreateRoom(roomId) {
    let room = rooms.get(roomId);
    if (!room) {
        room = { users: [], code: "", messages: [] };
        rooms.set(roomId, room);
    }
    return room;
}

export function getRoom(roomId) {
    return rooms.get(roomId);
}

export function addUserToRoom(roomId, socketId, username) {
    const room = getOrCreateRoom(roomId);
    const color = COLORS[room.users.length % COLORS.length];
    const isHost = room.users.length === 0;
    room.users.push({
        socketId,
        username,
        color,
        isHost,
        role: isHost ? "editor" : "viewer",
    });
    return room;
}

export function removeUserFromAllRooms(socketId) {
    const affectedRooms = [];

    for (const [roomId, room] of rooms.entries()) {
        const removedUser = room.users.find((u) => u.socketId === socketId);
        const updatedUsers = room.users.filter((u) => u.socketId !== socketId);

        if (updatedUsers.length !== room.users.length) {
            
            if (removedUser?.isHost && updatedUsers.length > 0) {
                updatedUsers[0].isHost = true;
                updatedUsers[0].role = "editor";
            }

            room.users = updatedUsers;
            affectedRooms.push({ roomId, users: updatedUsers });
        }
    }

    return affectedRooms;
}
