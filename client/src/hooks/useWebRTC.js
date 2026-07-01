import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "../socket";

const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTC(roomId, users) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callActive, setCallActive] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [sessionEnded, setSessionEnded] = useState(false);

    const pcRef = useRef(null);
    const localStreamRef = useRef(null);

    const hangUp = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop();
                localStreamRef.current.removeTrack(track);
            });
        }
        pcRef.current?.close();
        pcRef.current = null;
        localStreamRef.current = null;
        setLocalStream(null);
        setRemoteStream(null);
        setCallActive(false);
        setMicOn(true);
        setCamOn(true);
    }, []);

    // Host ends session for everyone
    const endSession = useCallback(() => {
        socket.emit("end-session", { roomId });
        hangUp();
    }, [roomId, hangUp]);

    const toggleMic = useCallback(() => {
        if (!localStreamRef.current) return;
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (!audioTrack) return;
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
    }, []);

    const toggleCam = useCallback(() => {
        if (!localStreamRef.current) return;
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (!videoTrack) return;
        videoTrack.enabled = !videoTrack.enabled;
        setCamOn(videoTrack.enabled);
    }, []);

    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc-ice-candidate", {
                    roomId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            setCallActive(true);
        };

        pc.onconnectionstatechange = () => {
            console.log("WebRTC connection state:", pc.connectionState);
            if (
                pc.connectionState === "disconnected" ||
                pc.connectionState === "failed"
            ) {
                hangUp();
            }
        };

        return pc;
    }, [roomId, hangUp]);

    const startLocalStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
    }, []);

    const startCall = useCallback(async () => {
        try {
            const stream = await startLocalStream();
            const pc = createPeerConnection();
            pcRef.current = pc;
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("webrtc-offer", { roomId, offer });
        } catch (err) {
            console.error("startCall error:", err);
        }
    }, [roomId, startLocalStream, createPeerConnection]);

    const handleOffer = useCallback(
        async (offer) => {
            try {
                const stream = await startLocalStream();
                const pc = createPeerConnection();
                pcRef.current = pc;
                stream
                    .getTracks()
                    .forEach((track) => pc.addTrack(track, stream));
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("webrtc-answer", { roomId, answer });
            } catch (err) {
                console.error("handleOffer error:", err);
            }
        },
        [roomId, startLocalStream, createPeerConnection],
    );

    useEffect(() => {
        socket.off("webrtc-offer");
        socket.off("webrtc-answer");
        socket.off("webrtc-ice-candidate");
        socket.off("session-ended");

        socket.on("webrtc-offer", async ({ offer }) => {
            await handleOffer(offer);
        });

        socket.on("webrtc-answer", async ({ answer }) => {
            if (pcRef.current) {
                await pcRef.current.setRemoteDescription(
                    new RTCSessionDescription(answer),
                );
            }
        });

        socket.on("webrtc-ice-candidate", async ({ candidate }) => {
            if (pcRef.current) {
                try {
                    await pcRef.current.addIceCandidate(
                        new RTCIceCandidate(candidate),
                    );
                } catch (err) {
                    console.error("ICE candidate error:", err);
                }
            }
        });

        // Candidate receives this and gets booted
        socket.on("session-ended", () => {
            hangUp();
            setSessionEnded(true);
        });

        return () => {
            socket.off("webrtc-offer");
            socket.off("webrtc-answer");
            socket.off("webrtc-ice-candidate");
            socket.off("session-ended");
        };
    }, [roomId, handleOffer, hangUp]);

    useEffect(() => {
        if (users.length === 2) {
            const me = users.find((u) => u.socketId === socket.id);
            if (me && !me.isHost) {
                setTimeout(() => startCall(), 0);
            }
        }
        if (users.length < 2 && callActive) {
            setTimeout(() => hangUp(), 0);
        }
    }, [users, callActive, startCall, hangUp]);

    return {
        localStream,
        remoteStream,
        callActive,
        micOn,
        camOn,
        toggleMic,
        toggleCam,
        endSession,
        sessionEnded,
    };
}
