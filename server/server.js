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

const rooms = {}; // This will now store { id: socket.id, username: username }

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    // Add new user to the room
    rooms[roomId].push({ id: socket.id, username: username });

    // Broadcast the updated user list to everyone in the room
    io.to(roomId).emit('update-user-list', rooms[roomId]);

    console.log(`User ${username} (${socket.id}) joined room ${roomId}.`);
  });

  socket.on('disconnecting', () => {
    for (const roomId in rooms) {
      const userIndex = rooms[roomId].findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        rooms[roomId].splice(userIndex, 1); // Remove user from room
        // Broadcast the updated user list
        io.to(roomId).emit('update-user-list', rooms[roomId]);
        console.log(`User ${socket.id} left room ${roomId}.`);
        break; // Assume user is in one room at a time
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });

  // Relay signals for WebRTC (if still needed)
  socket.on('signal', (payload) => {
    io.to(payload.target).emit('signal', { from: payload.from, signal: payload.signal });
  });

  // Chat message logic remains the same
  socket.on('chat-message', (data) => {
    const { roomId, message, username } = data;
    io.to(roomId).emit('chat-message', {
      message: message,
      username: username,
      socketId: socket.id
    });
  });

  // --- Admin Actions ---
  socket.on('admin-kick-user', (data) => {
    const { roomId, socketIdToKick } = data;
    const targetSocket = io.sockets.sockets.get(socketIdToKick);

    if (targetSocket) {
      console.log(`Admin ${socket.id} kicking user ${socketIdToKick} from room ${roomId}`);
      // Emit kick event directly to the specific user
      targetSocket.emit('you-have-been-kicked', {
        message: 'لقد تم طردك من قبل المشرف.'
      });
      // Force disconnect the user
      targetSocket.disconnect(true);
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
