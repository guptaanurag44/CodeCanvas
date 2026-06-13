import Editor from "@monaco-editor/react";
import { useRef, useEffect } from "react";
import throttle from "lodash.throttle";
import { socket } from "../socket";

export function CodeEditor({ code, onChange, roomId, remoteCursors, users }) {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleMount = (editor) => {
    editorRef.current = editor;

    const throttledEmit = throttle((position) => {
      socket.emit("cursor-move", { roomId, position });
    }, 50);

    editor.onDidChangeCursorPosition((e) => {
      throttledEmit(e.position);
    });
  };

  // Effect 1: inject/update CSS rules for each user's color (runs when `users` changes)
  useEffect(() => {
    let styleTag = document.getElementById("remote-cursor-styles");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "remote-cursor-styles";
      document.head.appendChild(styleTag);
    }

    const css = users
      .map(
        (u) => `
        .remote-cursor-${u.socketId} {
          border-left: 2px solid ${u.color};
          position: relative;
        }
        .remote-cursor-${u.socketId}::after {
          content: "${u.username}";
          position: absolute;
          top: -1.2em;
          left: 0;
          background: ${u.color};
          color: #000;
          font-size: 11px;
          padding: 0 4px;
          border-radius: 2px;
          white-space: nowrap;
        }
      `
      )
      .join("\n");

    styleTag.textContent = css;
  }, [users]);

  // Effect 2: update decoration POSITIONS (runs when remoteCursors changes)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !window.monaco) return;

    const newDecorations = Object.entries(remoteCursors).map(([socketId, position]) => ({
      range: new window.monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      ),
      options: {
        className: `remote-cursor-${socketId}`,
        stickiness: 1,
      },
    }));

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [remoteCursors]);

  return (
    <div style={{ flex: 1 }}>
      <Editor
        height="100%"
        language="cpp"
        value={code}
        onChange={onChange}
        onMount={handleMount}
        theme="vs-dark"
      />
    </div>
  );
}