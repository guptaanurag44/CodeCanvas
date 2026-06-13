export function OutputPanel({ output, running, runner , currentUsername}) {
    const runnerLabel = runner === currentUsername ? "You" : runner;
    return (
        <div
            style={{
                height: "150px",
                background: "#1e1e1e",
                color: "#fff",
                padding: "8px",
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: "13px",
            }}
        >
            {running && (
                <div style={{ color: "#ffb74d" }}>
                    {runnerLabel} {runner === currentUsername ? "are" : "is"} running code...
                </div>
            )}
            {!running && output && (
                <>
                    <div style={{ color: "#888", marginBottom: "4px" }}>
                        Run by {output.username}
                    </div>
                    {output.error && (
                        <div style={{ color: "#e57373" }}>{output.error}</div>
                    )}
                    {output.compile_output && (
                        <div style={{ color: "#ffb74d" }}>
                            {output.compile_output}
                        </div>
                    )}
                    {output.stdout && (
                        <pre style={{ margin: 0 }}>{output.stdout}</pre>
                    )}
                    {output.stderr && (
                        <div style={{ color: "#e57373" }}>{output.stderr}</div>
                    )}
                    {!output.stdout &&
                        !output.stderr &&
                        !output.compile_output &&
                        !output.error && (
                            <div style={{ color: "#888" }}>(no output)</div>
                        )}
                </>
            )}
        </div>
    );
}
