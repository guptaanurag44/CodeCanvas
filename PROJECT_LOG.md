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

## Phase 7 — WebRTC Video (Interview Mode)**

- Added peer-to-peer video calling that activates exclusively in interview mode, selected by the host at join time
- WebRTC connection uses STUN-based ICE negotiation — no media touches the server, server acts as pure signaling relay
- Candidate (second joiner) initiates the offer automatically when both participants are in the room
- Both participants get mic and camera toggles during the call
- Only the host can end the session — candidate has no end call button, mirroring a real interview environment
- Ending the session stops all media tracks, closes the peer connection, and redirects both participants back to home screen
- Video call is P2P between interviewer and candidate only — additional observers can join as viewers without affecting the call
- Mode is locked at join time, cannot be toggled mid-session
- STUN only, no TURN server — works on standard networks, acceptable limitation for a portfolio demo


## Phase 8 — Postgres Persistence

- Migrated from fully in-memory state to Postgres (Supabase) via Prisma ORM — server restarts no longer wipe active rooms
- Prisma 7: connection URLs moved out of schema.prisma into prisma.config.ts; PrismaClient now requires an explicit driver adapter (@prisma/adapter-pg) instead of implicit config
- Supabase connection uses split pooler URLs — DATABASE_URL (transaction pooler, 6543, pgbouncer=true) for the app at runtime, DIRECT_URL (session pooler, 5432) for Prisma CLI/migrations — avoids IPv4/IPv6 direct-connection issues entirely
- Room model: roomId (unique), code, language, createdAt, updatedAt — first-pass schema, chat/execution history intentionally deferred
- On first joiner: checks DB for existing roomId — hydrates in-memory room from saved code/language if found (server-restart recovery), else creates a fresh row
- Subsequent joiners skip the DB check entirely — read from the already-hydrated in-memory room, same as before
- code-change: debounced DB writes (2s after typing stops) — broadcast to collaborators stays instant, only persistence is delayed, avoids write-per-keystroke
- language-change: persisted immediately (cheap, low-frequency event, no debounce needed)
- Scope decision: no `users` table — identity stays socket-based per session. Room-scoped ephemeral identity (same model as Google Docs share-link mode) is sufficient for the collab/interview use case; would only be needed for cross-session history or auth, neither of which the app currently requires
- Scope decision: chat messages and Judge0 execution history remain in-memory only — survive browser refresh (server memory intact) but not server restart. Deferred as optional future phases, not a current gap