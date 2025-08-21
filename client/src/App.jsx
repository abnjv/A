import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './index.css';

// Audio component for remote peers
const Audio = ({ peer, isDeafened }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on('stream', stream => {
            if (ref.current) ref.current.srcObject = stream;
        });
    }, [peer]);

    useEffect(() => {
        if (ref.current) ref.current.muted = isDeafened;
    }, [isDeafened]);

    return <audio playsInline autoPlay ref={ref} />;
};

// ParticipantCard component with SVG icon
const ParticipantCard = ({ id, isMuted, isSelf, children }) => {
    return (
        <div className="participant-card">
            <div className={`participant-icon-wrapper ${isMuted ? 'muted' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="participant-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    {isMuted && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5l14 14" />}
                </svg>
            </div>
            <p className="participant-name" title={id}>{isSelf ? "You" : id.substring(0, 8)}</p>
            {children}
        </div>
    );
};


const App = () => {
    const [roomId, setRoomId] = useState('');
    const [inRoom, setInRoom] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isDeafened, setIsDeafened] = useState(false);

    const [peers, setPeers] =useState([]);
    const socketRef = useRef();
    const userAudioRef = useRef();
    const peersRef = useRef([]);

    useEffect(() => {
        if (!inRoom) return;

        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then(stream => {
                if (userAudioRef.current) userAudioRef.current.srcObject = stream;
                stream.getAudioTracks()[0].enabled = !isMuted;

                socketRef.current = io.connect("http://localhost:3001");
                socketRef.current.emit("join-room", roomId);

                socketRef.current.on('existing-users', users => {
                    const newPeers = users.map(userID => {
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        return { peerID: userID, peer };
                    });
                    peersRef.current = newPeers;
                    setPeers(newPeers);
                });

                socketRef.current.on('user-joined', userID => {
                    const peer = addPeer(userID, stream);
                    const peerObj = { peerID: userID, peer };
                    peersRef.current.push(peerObj);
                    setPeers(prevPeers => [...prevPeers, peerObj]);
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
            peersRef.current.forEach(({ peer }) => {
                if (peer && !peer.destroyed) peer.destroy();
            });
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

    const handleJoinRoom = e => {
        e.preventDefault();
        if (roomId.trim()) setInRoom(true);
    };

    const leaveRoom = () => {
        setInRoom(false);
        setIsMuted(false);
        setIsDeafened(false);
    };

    const toggleMute = () => {
        if (userAudioRef.current && userAudioRef.current.srcObject) {
            const stream = userAudioRef.current.srcObject;
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleDeafen = () => {
        setIsDeafened(prevState => !prevState);
    };

    if (!inRoom) {
        return (
            <div className="lobby-container">
                <h1>Voice Chat</h1>
                <form onSubmit={handleJoinRoom}>
                    <input
                        type="text"
                        placeholder="Enter Room Name"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        required
                    />
                    <button type="submit">Join Room</button>
                </form>
            </div>
        );
    }

    return (
        <div className="room-container">
            <div className="room-header">
                <h1>Room: {roomId}</h1>
            </div>
            <div className="participants-grid">
                <ParticipantCard id="You" isSelf={true} isMuted={isMuted}>
                    <audio muted ref={userAudioRef} autoPlay playsInline />
                </ParticipantCard>
                {peers.map((peerObj) => (
                    <ParticipantCard key={peerObj.peerID} id={peerObj.peerID}>
                         <Audio peer={peerObj.peer} isDeafened={isDeafened} />
                    </ParticipantCard>
                ))}
            </div>
            <div className="room-controls">
                <button className={`control-button mute ${isMuted ? 'active' : ''}`} onClick={toggleMute}>
                    {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button className={`control-button deafen ${isDeafened ? 'active' : ''}`} onClick={toggleDeafen}>
                    {isDeafened ? 'Undeafen' : 'Deafen'}
                </button>
                <button className="control-button leave" onClick={leaveRoom}>Leave Room</button>
            </div>
        </div>
    );
};

export default App;
