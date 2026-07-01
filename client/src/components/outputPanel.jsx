export function OutputPanel({
    output,
    running,
    runner,
    currentUsername,
    stdin,
    onStdinChange,
}) {
    const runnerLabel = runner === currentUsername ? "You" : runner;
    return (
        <div>
            <div style={{ padding: "6px 8px", background: "#252526" }}>
                <label
                    style={{
                        display: "block",
                        color: "#aaa",
                        fontSize: "11px",
                        marginBottom: "4px",
                        fontFamily: "monospace",
                    }}
                >
                    stdin (one input per line)
                </label>
                <textarea
                    value={stdin}
                    onChange={(e) => onStdinChange(e.target.value)}
                    placeholder="Input passed to the program..."
                    style={{
                        width: "100%",
                        height: "50px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #3c3c3c",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        resize: "vertical",
                        boxSizing: "border-box",
                        padding: "4px",
                    }}
                />
            </div>
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
                        {runnerLabel}{" "}
                        {runner === currentUsername ? "are" : "is"} running
                        code...
                    </div>
                )}
                {!running && output && (
                    <>
                        <div style={{ color: "#888", marginBottom: "4px" }}>
                            Run by {output.username}
                        </div>
                        {output.error && (
                            <div style={{ color: "#e57373" }}>
                                {output.error}
                            </div>
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
                            <div style={{ color: "#e57373" }}>
                                {output.stderr}
                            </div>
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
        </div>
    );
}
