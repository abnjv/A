import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './App.css';
import './index.css';

const ParticipantCard = ({ children, isMuted }) => (
    <div className="participant-card">
        <div className="participant-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" className={`participant-icon ${isMuted ? 'muted' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        </div>
        <p className="participant-name">{isMuted ? "You" : "Participant"}</p>
        {children}
    </div>
);

const Audio = ({ peer }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on('stream', stream => {
            if (ref.current) ref.current.srcObject = stream;
        });
        peer.on('error', err => console.error('peer error', err));
        return () => { if (peer) peer.destroy(); };
    }, [peer]);

    return <audio playsInline autoPlay ref={ref} />;
};

const App = () => {
    const [roomId, setRoomId] = useState('');
    const [inRoom, setInRoom] = useState(false);
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userAudioRef = useRef();
    const peersRef = useRef([]);

    useEffect(() => {
        if (!inRoom) return;

        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then(stream => {
                if (userAudioRef.current) userAudioRef.current.srcObject = stream;

                socketRef.current = io.connect("http://localhost:3001");
                socketRef.current.emit("join-room", roomId);

                socketRef.current.on('existing-users', users => {
                    const newPeers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        newPeers.push({ peerID: userID, peer });
                    });
                    peersRef.current = newPeers;
                    setPeers(newPeers.map(p => p.peer));
                });

                socketRef.current.on('user-joined', userID => {
                    const peer = addPeer(userID, stream);
                    peersRef.current.push({ peerID: userID, peer });
                    setPeers(prevPeers => [...prevPeers, peer]);
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
                    setPeers(filteredPeers.map(p => p.peer));
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
                <button onClick={leaveRoom} className="leave-button">
                    Leave Room
                </button>
            </header>
            <main className="participants-grid">
                <ParticipantCard isMuted={true}>
                    <audio muted ref={userAudioRef} autoPlay playsInline />
                </ParticipantCard>
                {peers.map((peer, index) => (
                    <ParticipantCard key={index} isMuted={false}>
                        <Audio peer={peer} />
                    </ParticipantCard>
                ))}
            </main>
        </div>
    );
};

export default App;
