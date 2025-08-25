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

const rooms = {}; // This will now store users and mic slots
const NUM_MIC_SLOTS = 4; // Define the number of mic slots

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        micSlots: Array(NUM_MIC_SLOTS).fill(null),
      };
    }

    // Add new user to the room
    rooms[roomId].users.push({ id: socket.id, username: username });

    // Broadcast the updated user list to everyone in the room
    io.to(roomId).emit('update-user-list', rooms[roomId].users);

    // Send the current mic state to the new user
    socket.emit('mic-state-update', rooms[roomId].micSlots);

    console.log(`User ${username} (${socket.id}) joined room ${roomId}.`);
  });

  socket.on('disconnecting', () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const userIndex = room.users.findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        room.users.splice(userIndex, 1); // Remove user from room

        // Also remove user from any mic slot
        const micSlotIndex = room.micSlots.indexOf(socket.id);
        if (micSlotIndex !== -1) {
          room.micSlots[micSlotIndex] = null;
          io.to(roomId).emit('mic-state-update', room.micSlots);
        }

        // Broadcast the updated user list
        io.to(roomId).emit('update-user-list', room.users);
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

  // --- Mic Management ---
  socket.on('request-mic', (data) => {
    const { roomId } = data;
    const room = rooms[roomId];
    if (room) {
      const emptySlotIndex = room.micSlots.findIndex(slot => slot === null);
      if (emptySlotIndex !== -1) {
        // Ensure user isn't already on a mic
        if (!room.micSlots.includes(socket.id)) {
          room.micSlots[emptySlotIndex] = socket.id;
          io.to(roomId).emit('mic-state-update', room.micSlots);
        }
      }
    }
  });

  socket.on('leave-mic', (data) => {
    const { roomId } = data;
    const room = rooms[roomId];
    if (room) {
      const userMicIndex = room.micSlots.indexOf(socket.id);
      if (userMicIndex !== -1) {
        room.micSlots[userMicIndex] = null;
        io.to(roomId).emit('mic-state-update', room.micSlots);
      }
    }
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
