# Project Log

## Phase 1 — Core collaborative editing (Done)
- Monorepo: client (Vite+React) + server (Express+Socket.IO)
- Socket rooms: join/leave, in-memory `rooms` Map (roomId -> {users, code})
- Real-time code sync via Monaco Editor, single shared buffer per room
- Echo prevention: socket.to() on server, isRemoteChange ref on client
- Language: hardcoded "cpp" for now (TEMP), will derive from filename in Phase 4
- DB (Postgres/Prisma/Supabase): NOT yet integrated — all state in-memory, lost on server restart

## Phase 2 — Cursor Presence (Done)

- Server assigns color per user on join (fixed palette, cycles if >6 users)
- Client throttles cursor-move emits (lodash.throttle, 50ms)
- Remote cursors rendered via Monaco deltaDecorations + dynamically injected CSS
- Ghost cursor cleanup on user-list update (removes disconnected users' cursors)


## Phase 3 — Collaborative Chat (Done)
- room.messages array (server, in-memory), sent via sync-messages on join
- chat-message uses io.to() (sender sees own message too) — no echo problem since messages append, not replace
- Typing indicators: "typing" emitted immediately, "stop-typing" debounced (1.5s) via lodash.debounce
- typingUsers keyed by socketId (not username) — usernames not guaranteed unique


## Phase 4 — Roles & Watch-only Mode (Done)

- First joiner = host (isHost: true, role: "editor")
- Subsequent joiners default to role: "viewer"
- Host can promote/demote via "change-role" (server verifies isHost)
- Server-side enforcement: code-change ignored if sender's role !== "editor"
(client readOnly is UX only; real security is server-side check)
- Monaco's built-in readOnly mode provides "cannot edit" feedback automatically