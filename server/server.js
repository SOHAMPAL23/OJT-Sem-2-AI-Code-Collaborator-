require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const auth = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Socket.io setup with CORS
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000
});

// Pre-flight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Mount auth routes
app.use('/api/auth', auth);

// Store room data
const rooms = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User Connected:', socket.id);

  // Handle joining a room
  socket.on('join', ({ roomId, userName }) => {
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        code: '',
        language: 'javascript'
      });
    }

    // Add user to room
    const room = rooms.get(roomId);
    room.users.set(socket.id, userName);

    // Notify others in the room
    io.to(roomId).emit('userNotification', {
      type: 'join',
      user: userName
    });

    // Send room info to all users
    io.to(roomId).emit('roomInfo', {
      users: Array.from(room.users.values()),
      activity: `${userName} joined`
    });

    // Send current code and language to the new user
    socket.emit('codeUpdate', room.code);
    socket.emit('languageUpdate', room.language);
  });

  // Handle code changes
  socket.on('codeChange', ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
      socket.to(roomId).emit('codeUpdate', code);
    }
  });

  // Handle language changes
  socket.on('languageChange', ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.language = language;
      socket.to(roomId).emit('languageUpdate', language);
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ roomId, userName }) => {
    socket.to(roomId).emit('userTyping', userName);
  });

  // Handle code execution
  socket.on('compileCode', async ({ code, roomId, language }) => {
    try {
      // Here you would integrate with your code execution service
      // For now, we'll just echo back the code
      const response = {
        run: {
          output: `Code execution not implemented yet.\nReceived ${language} code:\n${code}`,
          stderr: null
        }
      };
      
      io.to(roomId).emit('codeResponse', response);
    } catch (error) {
      socket.emit('error', { message: 'Code execution failed' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User Disconnected:', socket.id);
    
    // Find and clean up user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const userName = room.users.get(socket.id);
        room.users.delete(socket.id);
        
        // Notify others in the room
        io.to(roomId).emit('userNotification', {
          type: 'leave',
          user: userName
        });
        
        // Update room info
        io.to(roomId).emit('roomInfo', {
          users: Array.from(room.users.values()),
          activity: `${userName} left`
        });
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });

  // Handle explicit leave room
  socket.on('leaveRoom', () => {
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const userName = room.users.get(socket.id);
        room.users.delete(socket.id);
        socket.leave(roomId);
        
        // Notify others
        io.to(roomId).emit('userNotification', {
          type: 'leave',
          user: userName
        });
        
        io.to(roomId).emit('roomInfo', {
          users: Array.from(room.users.values()),
          activity: `${userName} left`
        });
        
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Create room endpoint
app.post('/api/room', (req, res) => {
  const roomId = uuidv4();
  rooms.set(roomId, {
    users: new Map(),
    code: '',
    language: 'javascript'
  });
  res.json({ roomId });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server time: ${new Date().toISOString()}`);
  console.log(`CORS enabled for origins:`, corsOptions.origin);
});
