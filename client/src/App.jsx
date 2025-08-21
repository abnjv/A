import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './App.css';
import './index.css';

const ParticipantCard = ({ children, name }) => (
    <div className="participant-card">
        <div className="participant-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" className="participant-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        </div>
        <p className="participant-name">{name}</p>
        {children}
    </div>
);

const Audio = ({ peer, isDeafened }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on('stream', stream => {
            if (ref.current) ref.current.srcObject = stream;
        });
        peer.on('error', err => console.error('peer error', err));
        return () => { if (peer) peer.destroy(); };
    }, [peer]);

    useEffect(() => {
        if (ref.current) {
            ref.current.muted = isDeafened;
        }
    }, [isDeafened]);

    return <audio playsInline autoPlay ref={ref} />;
};

const App = () => {
    const [roomId, setRoomId] = useState('');
    const [inRoom, setInRoom] = useState(false);
    const [peers, setPeers] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isDeafened, setIsDeafened] = useState(false);

    const socketRef = useRef();
    const userAudioRef = useRef();
    const peersRef = useRef([]);

    useEffect(() => {
        if (!inRoom) return;

        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then(stream => {
                if (userAudioRef.current) userAudioRef.current.srcObject = stream;

                // Mute the stream by default if isMuted is true initially
                stream.getAudioTracks()[0].enabled = !isMuted;

                socketRef.current = io.connect("http://localhost:3001");
                socketRef.current.emit("join-room", roomId);

                socketRef.current.on('existing-users', users => {
                    const newPeers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        newPeers.push({ peerID: userID, peer });
                    });
                    peersRef.current = newPeers;
                    setPeers(newPeers);
                });

                socketRef.current.on('user-joined', userID => {
                    const peer = addPeer(userID, stream);
                    peersRef.current.push({ peerID: userID, peer });
                    setPeers(prevPeers => [...prevPeers, { peerID: userID, peer }]);
                });

                socketRef.current.on('signal', payload => {
                    const peerObj = peersRef.current.find(p => p.peerID === payload.from);
                    if (peerObj) peerObj.peer.signal(payload.signal);
                });

                socketRef.current.on('user-disconnected', userID => {
                    const peerObj = peersRef.current.find(p => p.peerID === userID);
                    if (peerObj) peerObj.peer.destroy();
                    const filteredPeers = peersRef.current.filter(p => p.peerID !== userID);
                    peersRef.current = filteredPeers;
                    setPeers(filteredPeers);
                });
            })
            .catch(error => {
                console.error("Error getting user media:", error);
                alert("Could not access your microphone. Please check permissions and try again.");
                setInRoom(false);
            });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            peersRef.current.forEach(({ peer }) => { if (peer) peer.destroy(); });
            setPeers([]);
            peersRef.current = [];
        };
    }, [inRoom, roomId]);

    useEffect(() => {
        if (userAudioRef.current && userAudioRef.current.srcObject) {
            userAudioRef.current.srcObject.getAudioTracks()[0].enabled = !isMuted;
        }
    }, [isMuted]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on('signal', signal => {
            socketRef.current.emit('signal', { target: userToSignal, from: callerID, signal });
        });
        return peer;
    }

    function addPeer(incomingUser, stream) {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on('signal', signal => {
            socketRef.current.emit('signal', { target: incomingUser, from: socketRef.current.id, signal });
        });
        return peer;
    }

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (roomId.trim()) setInRoom(true);
    };

    const leaveRoom = () => setInRoom(false);

    if (!inRoom) {
        return (
            <div className="app-container">
                <div className="lobby-card">
                    <h1 className="lobby-title">Voice Chat</h1>
                    <p className="lobby-subtitle">Enter a room and start talking</p>
                    <form onSubmit={handleJoinRoom} className="lobby-form">
                        <input
                            type="text"
                            placeholder="Enter Room Name"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            required
                            className="form-input"
                        />
                        <button type="submit" className="form-button">
                            Join Room
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container room-view">
            <header className="room-header">
                <h1 className="room-title">Room: <span>{roomId}</span></h1>
                <div className="controls-container">
                    <button onClick={() => setIsMuted(!isMuted)} className={`control-button ${isMuted ? 'active' : ''}`}>
                        {isMuted ? "Unmute" : "Mute"}
                    </button>
                    <button onClick={() => setIsDeafened(!isDeafened)} className={`control-button ${isDeafened ? 'active' : ''}`}>
                        {isDeafened ? "Undeafen" : "Deafen"}
                    </button>
                    <button onClick={leaveRoom} className="leave-button">
                        Leave Room
                    </button>
                </div>
            </header>
            <main className="participants-grid">
                <ParticipantCard name="You">
                    <audio muted ref={userAudioRef} autoPlay playsInline />
                </ParticipantCard>
                {peers.map(({ peerID, peer }) => (
                    <ParticipantCard key={peerID} name={`User ${peerID.substring(0, 4)}`}>
                        <Audio peer={peer} isDeafened={isDeafened} />
                    </ParticipantCard>
                ))}
            </main>
        </div>
    );
};

export default App;
