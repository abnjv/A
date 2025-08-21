import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './App.css';
import './index.css';

const Audio = ({ peer }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on('stream', stream => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        });
        peer.on('error', err => console.error('peer error', err));

        // Cleanup when the component unmounts
        return () => {
            if (peer) {
                peer.destroy();
            }
        };
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
                if (userAudioRef.current) {
                    userAudioRef.current.srcObject = stream;
                }

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
                    if (peerObj) {
                        peerObj.peer.signal(payload.signal);
                    }
                });

                socketRef.current.on('user-disconnected', userID => {
                    const peerObj = peersRef.current.find(p => p.peerID === userID);
                    if (peerObj) {
                        peerObj.peer.destroy();
                    }
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
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            peersRef.current.forEach(({ peer }) => {
                if (peer) peer.destroy();
            });
            setPeers([]);
            peersRef.current = [];
        };
    }, [inRoom, roomId]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socketRef.current.emit('signal', { target: userToSignal, from: callerID, signal });
        });

        return peer;
    }

    function addPeer(incomingUser, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socketRef.current.emit('signal', { target: incomingUser, from: socketRef.current.id, signal });
        });

        return peer;
    }

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            setInRoom(true);
        }
    };

    if (!inRoom) {
        return (
            <div className="lobby-container">
                <h1>Simple Voice Chat</h1>
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
        <div>
            <h1>Room: {roomId}</h1>
            <p>Your audio is muted for you, but others can hear you.</p>
            <div id="videos-grid">
                <audio muted ref={userAudioRef} autoPlay playsInline />
                {peers.map((peer, index) => (
                    <Audio key={index} peer={peer} />
                ))}
            </div>
        </div>
    );
};

export default App;
