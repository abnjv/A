import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import AudioPlayer from './AudioPlayer'; // Import the new component

const socket = io('http://localhost:3001'); // Connect to the server

function Room() {
  const { roomName } = useParams();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const username = localStorage.getItem('username') || 'ضيف';
  const messagesEndRef = useRef(null);

  const [micSlots, setMicSlots] = useState([]);
  const [localStream, setLocalStream] = useState();
  const [peers, setPeers] = useState({});
  const [isMuted, setMuted] = useState(false);
  const peersRef = useRef({});

  useEffect(() => {
    // Get user's audio stream
    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then(stream => {
        setLocalStream(stream);
      })
      .catch(console.error);

    // Join the room
    socket.emit('join-room', { roomId: roomName, username });

    // Listen for chat messages
    socket.on('chat-message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Listen for user list updates
    socket.on('update-user-list', (userList) => {
      setUsers(userList);
    });

    // Listen for mic state updates
    socket.on('mic-state-update', (updatedMicSlots) => {
      setMicSlots(updatedMicSlots);
    });

    // Clean up on component unmount
    return () => {
      socket.off('chat-message');
      socket.off('update-user-list');
      socket.off('mic-state-update');
      // Clean up local stream and peers
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => peer.destroy());
    };
  }, [roomName, username]);

  useEffect(() => {
    // Scroll to the bottom of the chat on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effect for handling peer connections
  useEffect(() => {
    if (!localStream) return;

    // When mic slots change, create/destroy peers
    micSlots.forEach((socketId, index) => {
      if (socketId && socketId !== socket.id) {
        // This is a remote user on a mic
        if (!peersRef.current[socketId]) {
          // Create a new peer if it doesn't exist
          const peer = createPeer(socketId, socket.id, localStream);
          peersRef.current[socketId] = peer;
          setPeers(prev => ({ ...prev, [socketId]: peer }));
        }
      }
    });

    // Clean up disconnected peers
    Object.keys(peersRef.current).forEach(peerId => {
      if (!micSlots.includes(peerId)) {
        destroyPeer(peerId);
      }
    });

  }, [micSlots, localStream]);

  // Effect for handling signals
  useEffect(() => {
    socket.on('signal', ({ from, signal }) => {
      const peer = peersRef.current[from];
      if (peer) {
        peer.signal(signal);
      }
    });

    return () => {
      socket.off('signal');
    }
  }, []);

  function createPeer(targetSocketId, myId, stream) {
    const peer = new Peer({
      initiator: myId < targetSocketId, // The user with the smaller ID initiates
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('signal', { target: targetSocketId, from: myId, signal });
    });

    return peer;
  }

  function destroyPeer(peerId) {
    const peer = peersRef.current[peerId];
    if (peer) {
      peer.destroy();
      delete peersRef.current[peerId];
      setPeers(prev => {
        const newPeers = { ...prev };
        delete newPeers[peerId];
        return newPeers;
      });
    }
  }

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat-message', {
        roomId: roomName,
        message,
        username,
      });
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {Object.values(peers).map((peer, index) => (
        <AudioPlayer key={index} peer={peer} />
      ))}
      {/* User List */}
      <div className="w-1/4 bg-gray-800 p-6 border-r border-gray-700">
        <h2 className="text-2xl font-bold mb-6">المستخدمون ({users.length})</h2>
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="flex items-center">
              <img
                src={`https://avatar.iran.liara.run/public/boy?username=${user.username}`}
                alt={user.username}
                className="w-10 h-10 rounded-full mr-4"
              />
              <span className="font-semibold">{user.username}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-bold">مرحبًا بك في {roomName}</h1>
          <div>
            {micSlots.includes(socket.id) ? (
              <button
                onClick={() => socket.emit('leave-mic', { roomId: roomName })}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold"
              >
                مغادرة الميكروفون
              </button>
            ) : (
              <button
                onClick={() => socket.emit('request-mic', { roomId: roomName })}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-semibold"
              >
                الانضمام إلى الميكروفون
              </button>
            )}
            <button
              onClick={() => {
                const newMutedState = !isMuted;
                setMuted(newMutedState);
                localStream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
              }}
              className={`ml-4 px-4 py-2 rounded-lg font-semibold ${
                isMuted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              {isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            </button>
          </div>
        </header>

        {/* Mic Slots */}
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <h3 className="text-lg font-semibold mb-4">الميكروفونات</h3>
          <div className="flex justify-center gap-8">
            {micSlots.map((slot, index) => {
              const userOnMic = users.find(u => u.id === slot);
              return (
                <div key={index} className="flex flex-col items-center text-center w-24">
                  {userOnMic ? (
                    <>
                      <img
                        src={`https://avatar.iran.liara.run/public/boy?username=${userOnMic.username}`}
                        alt={userOnMic.username}
                        className="w-16 h-16 rounded-full border-4 border-green-500"
                      />
                      <span className="mt-2 font-semibold truncate">{userOnMic.username}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                        <i className="fas fa-microphone-slash text-2xl text-gray-500"></i>
                      </div>
                      <span className="mt-2 text-gray-500">فارغ</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  msg.username === username ? 'flex-row-reverse' : ''
                }`}
              >
                <img
                  src={`https://avatar.iran.liara.run/public/boy?username=${msg.username}`}
                  alt={msg.username}
                  className="w-10 h-10 rounded-full"
                />
                <div
                  className={`p-4 rounded-xl max-w-lg ${
                    msg.username === username
                      ? 'bg-blue-600 rounded-br-none'
                      : 'bg-gray-700 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-bold">{msg.username}</span>
                    <span className="text-xs text-gray-400">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-6 bg-gray-800 border-t border-gray-700">
          <form onSubmit={sendMessage} className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold transition-all"
            >
              إرسال
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Room;
