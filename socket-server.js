const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Store room participants
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a meeting room
    socket.on('join-room', ({ roomId, userId, userName, role }) => {
      socket.join(roomId);
      
      // Store user info
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      rooms.get(roomId).set(socket.id, { userId, userName, role });

      // Notify others in the room
      socket.to(roomId).emit('user-joined', { socketId: socket.id, userId, userName, role });

      // Send existing participants to the new user
      const participants = [];
      rooms.get(roomId).forEach((user, id) => {
        if (id !== socket.id) {
          participants.push({ socketId: id, ...user });
        }
      });
      socket.emit('existing-participants', participants);

      console.log(`User ${userName} joined room ${roomId}`);
    });

    // WebRTC signaling - Offer
    socket.on('offer', ({ roomId, offer, to }) => {
      io.to(to).emit('offer', { offer, from: socket.id });
    });

    // WebRTC signaling - Answer
    socket.on('answer', ({ roomId, answer, to }) => {
      io.to(to).emit('answer', { answer, from: socket.id });
    });

    // WebRTC signaling - ICE Candidate
    socket.on('ice-candidate', ({ roomId, candidate, to }) => {
      io.to(to).emit('ice-candidate', { candidate, from: socket.id });
    });

    // Chat messages
    socket.on('chat-message', ({ roomId, message, userName }) => {
      io.to(roomId).emit('chat-message', { message, userName, timestamp: new Date().toISOString() });
    });

    // Raise hand
    socket.on('raise-hand', ({ roomId, userName }) => {
      io.to(roomId).emit('raise-hand', { userName });
    });

    // Mute/unmute notification
    socket.on('toggle-mute', ({ roomId, isMuted, userName }) => {
      socket.to(roomId).emit('user-muted', { socketId: socket.id, isMuted, userName });
    });

    // Camera on/off notification
    socket.on('toggle-camera', ({ roomId, isOff, userName }) => {
      socket.to(roomId).emit('user-camera-off', { socketId: socket.id, isOff, userName });
    });

    // Leave room
    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      
      if (rooms.has(roomId)) {
        const user = rooms.get(roomId).get(socket.id);
        rooms.get(roomId).delete(socket.id);
        
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
        
        socket.to(roomId).emit('user-left', { socketId: socket.id, userName: user?.userName });
      }
      
      console.log(`User left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove from all rooms
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          const user = participants.get(socket.id);
          participants.delete(socket.id);
          
          if (participants.size === 0) {
            rooms.delete(roomId);
          }
          
          io.to(roomId).emit('user-left', { socketId: socket.id, userName: user?.userName });
        }
      });
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Socket.IO server ready on http://localhost:${PORT}`);
  });
});
