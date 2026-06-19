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

## Phase 5 — Code Execution (Done)
- Judge0 CE public API (https://ce.judge0.com), no auth required
- Server-side execution: submit (async, base64) -> poll for result (max 10x1s)
- Supports: JavaScript, Python, C++, C, Java, Go
- room.language: shared state (like code), synced on join + broadcast on change
- "code-running"/"code-output" broadcast to whole room (collaborative - everyone sees who ran what)
- Output panel shows stdout/stderr/compile_output, attributes run to username ("You" for self)

=======
### Phase 6 — AI Code Assistance (Done)
- Added `aiHandlers.js` (server) — calls Gemini 1.5 Flash, streams chunks via `ai-chunk` socket events, relays `ai-done` when complete
- Added `useAI.js` + `AIPanel.jsx` (client) — displays streaming responses with typewriter effect, per-user "Share Code Context" toggle
- Host can disable AI for room via `toggle-ai` event — server-side isHost check, same auth pattern as change-role
- Key bugs: nested `socket.on` inside emit function (stacked listeners), StrictMode double-mount broke nested setState in `ai-done` (fixed with `useRef` + guard), Monaco `onChange` returning `undefined` on select-delete (fixed with `?? ""`)>>>>>>> 6b83983 (add gitignore files, remove .env from tracking)
