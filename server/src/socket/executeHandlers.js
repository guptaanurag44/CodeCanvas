const LANGUAGE_IDS = {
    javascript: 63,
    python: 71,
    cpp: 54,
    c: 50,
    java: 62,
    typescript: 74,
    go: 60,
    rust: 73,
};

const JUDGE0_URL = "https://ce.judge0.com";

export function registerExecuteHandlers(io, socket) {
    socket.on(
        "run-code",
        async ({ roomId, code, language, username, stdin }) => {
            const languageId = LANGUAGE_IDS[language];
            if (!languageId) return;

            io.to(roomId).emit("code-running", { running: true, username });

            try {
                const output = await executeCode(code, languageId, stdin);
                io.to(roomId).emit("code-output", { ...output, username });
            } catch (err) {
                io.to(roomId).emit("code-output", {
                    error: "Execution failed: " + err.message,
                    username,
                });
            } finally {
                io.to(roomId).emit("code-running", {
                    running: false,
                    username,
                });
            }
        },
    );
}

async function executeCode(code, languageId, stdin = "") {
    const createRes = await fetch(
        `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                source_code: Buffer.from(code).toString("base64"),
                language_id: languageId,
                stdin: Buffer.from(stdin).toString("base64"),
            }),
        },
    );

    const { token } = await createRes.json();

    return await pollResult(token);
}

async function pollResult(token, maxAttempts = 10, delayMs = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        const res = await fetch(
            `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
        );
        const data = await res.json();

        if (data.status.id > 2) {
            return {
                stdout: data.stdout
                    ? Buffer.from(data.stdout, "base64").toString()
                    : "",
                stderr: data.stderr
                    ? Buffer.from(data.stderr, "base64").toString()
                    : "",
                compile_output: data.compile_output
                    ? Buffer.from(data.compile_output, "base64").toString()
                    : "",
                status: data.status.description,
            };
        }
    }

    return { error: "Execution timed out (polling exceeded)" };
}
