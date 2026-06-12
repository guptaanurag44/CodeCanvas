# Project Log

## Phase 1 — Core collaborative editing (Done)
- Monorepo: client (Vite+React) + server (Express+Socket.IO)
- Socket rooms: join/leave, in-memory `rooms` Map (roomId -> {users, code})
- Real-time code sync via Monaco Editor, single shared buffer per room
- Echo prevention: socket.to() on server, isRemoteChange ref on client
- Language: hardcoded "cpp" for now (TEMP), will derive from filename in Phase 4
- DB (Postgres/Prisma/Supabase): NOT yet integrated — all state in-memory, lost on server restart

