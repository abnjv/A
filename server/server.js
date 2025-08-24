const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

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

  socket.on('chat-message', (data) => {
    // When a chat message is received, broadcast it to the room
    const { roomId, message, username } = data;
    console.log(`Message received for room ${roomId}: ${message} from ${username}`);
    // We emit to the room, including the sender
    io.to(roomId).emit('chat-message', {
      message: message,
      username: username,
      socketId: socket.id
    });
  });

  // --- Admin Actions ---

  socket.on('admin-kick-user', (data) => {
    const { roomId, socketIdToKick } = data;
    console.log(`Admin ${socket.id} kicking user ${socketIdToKick} from room ${roomId}`);
    // Emit kick event directly to the specific user
    io.to(socketIdToKick).emit('you-have-been-kicked', {
      message: 'لقد تم طردك من قبل المشرف.'
    });
    // Optional: Make the user leave the socket.io room on the server
    const targetSocket = io.sockets.sockets.get(socketIdToKick);
    if(targetSocket) {
        targetSocket.leave(roomId);
    }
  });

  socket.on('admin-mute-all', (data) => {
    const { roomId } = data;
    console.log(`Admin ${socket.id} muting everyone in room ${roomId}`);
    // Broadcast to everyone else in the room
    socket.broadcast.to(roomId).emit('force-mute', {
        message: 'لقد قام المشرف بكتم صوت الجميع.'
    });
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Signaling server is running on port ${PORT}`);
});
