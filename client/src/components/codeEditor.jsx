import Editor from "@monaco-editor/react";
import { useRef } from "react";
import throttle from "lodash.throttle";
import { socket } from "../socket";

export function CodeEditor({ code, onChange, roomId }) {
  const editorRef = useRef(null);

  const handleMount = (editor) => {
    editorRef.current = editor;

    const throttledEmit = throttle((position) => {
      socket.emit("cursor-move", { roomId, position });
    }, 50);

    editor.onDidChangeCursorPosition((e) => {
      console.log("cursor moved:", e.position); 
      throttledEmit(e.position);
    });
  };

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