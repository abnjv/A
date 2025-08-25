import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Connect to the server

function Room() {
  const { roomName } = useParams();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const username = localStorage.getItem('username') || 'ضيف';
  const messagesEndRef = useRef(null);

  useEffect(() => {
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

    // Clean up on component unmount
    return () => {
      socket.off('chat-message');
      socket.off('update-user-list');
    };
  }, [roomName, username]);

  useEffect(() => {
    // Scroll to the bottom of the chat on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        <header className="bg-gray-800 p-4 shadow-md">
          <h1 className="text-2xl font-bold">مرحبًا بك في {roomName}</h1>
        </header>

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
