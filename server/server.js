const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    const usersInThisRoom = rooms[roomId] ? [...rooms[roomId]] : [];

    if (!rooms[roomId]) {
      rooms[roomId] = new Set();
    }
    rooms[roomId].add(socket.id);

    // Send existing users to the new joiner
    socket.emit('existing-users', usersInThisRoom);

    // Notify OTHERS that a new user has joined
    socket.to(roomId).emit('user-joined', socket.id);

    console.log(`User ${socket.id} joined room ${roomId}. Room size: ${rooms[roomId].size}`);
  });

  // Relay signals
  socket.on('signal', (payload) => {
    console.log(`Relaying signal from ${payload.from} to ${payload.target}`);
    io.to(payload.target).emit('signal', { from: payload.from, signal: payload.signal });
  });

  socket.on('disconnecting', () => {
    const roomsSocketIsIn = Array.from(socket.rooms);
    roomsSocketIsIn.forEach(roomId => {
      if (roomId !== socket.id && rooms[roomId]) {
        rooms[roomId].delete(socket.id);
        console.log(`User ${socket.id} left room ${roomId}. Room size: ${rooms[roomId].size}`);
        socket.to(roomId).emit('user-disconnected', socket.id);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Signaling server is running on port ${PORT}`);
});
