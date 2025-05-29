require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const auth = require('./routes/auth');
const compileRouter = require('./routes/compiler');
const connectDB = require('./config/db')

connectDB(); // Assuming this connects to your database

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Your frontend development server
    'http://localhost:5174', // Another potential frontend port
    'http://localhost:3000', // Common React dev server port
    'http://localhost:3001'  // Another common dev server port
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
  pingTimeout: 60000 // Keep connection alive
});

// Pre-flight requests for all routes
app.options('/{*any}', cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON request bodies

// Mount authentication routes
app.use('/api/auth', auth);

// Store room data in memory (for simplicity; consider a database for persistence)
const rooms = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Server: User Connected:', socket.id);

  // Handle joining a room
  socket.on('join', ({ roomId, userName }) => {
    console.log(`Server: Received 'join' from ${userName} (${socket.id}) for room: ${roomId}`);
    socket.join(roomId); // Add the socket to the specified room

    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      console.log(`Server: Initializing new room: ${roomId}`);
      rooms.set(roomId, {
        users: new Map(), // Map to store user sockets and names
        code: INITIAL_CODE.javascript, // Default initial code for the room
        language: 'javascript' // Default language for the room
      });
    }

    // Add user to room's user list
    const room = rooms.get(roomId);
    room.users.set(socket.id, userName);
    console.log(`Server: User ${userName} added to room ${roomId}. Current users: ${Array.from(room.users.values()).join(', ')}`);

    // Notify others in the room about the new user
    console.log(`Server: Emitting 'userNotification' (join) to room ${roomId}`);
    io.to(roomId).emit('userNotification', {
      type: 'join',
      user: userName
    });

    // Send updated room info (user list, activity) to all users in the room
    console.log(`Server: Emitting 'roomInfo' to room ${roomId}`);
    io.to(roomId).emit('roomInfo', {
      users: Array.from(room.users.values()), // Convert Map values to Array for client
      activity: `${userName} joined`
    });
    // On your server side
socket.on('send-chat-message', (messageData) => {
  console.log('Server: Received message:', messageData);
  
  // Broadcast the message to all users in the room (including sender)
  io.to(messageData.roomId).emit('receive-chat-message', messageData);
  
  // Or if you want to exclude the sender:
  // socket.to(messageData.roomId).emit('receive-chat-message', messageData);
});

    // Send current code and language of the room to the newly joined user ONLY
    console.log(`Server: Emitting initial 'codeUpdate' and 'languageUpdate' to new user ${socket.id}`);
    socket.emit('codeUpdate', room.code);
    socket.emit('languageUpdate', room.language);
  });

  // Handle code changes from a client
  socket.on('codeChange', ({ roomId, code }) => {
    console.log(`Server: Received 'codeChange' for room ${roomId}. Code length: ${code?.length}`);
    const room = rooms.get(roomId);
    if (room) {
      room.code = code; // Update the room's stored code
      // Broadcast the code change to all other clients in the room (excluding sender)
      console.log(`Server: Broadcasting 'codeUpdate' to room ${roomId} (excluding sender)`);
      socket.to(roomId).emit('codeUpdate', code);
    } else {
      console.warn(`Server: 'codeChange' received for non-existent room: ${roomId}`);
    }
  });

  // Handle language changes from a client
  socket.on('languageChange', ({ roomId, language }) => {
    console.log(`Server: Received 'languageChange' for room ${roomId} to: ${language}`);
    const room = rooms.get(roomId);
    if (room) {
      room.language = language; // Update the room's stored language
      // Broadcast the language change to all clients in the room (including sender)
      console.log(`Server: Broadcasting 'languageUpdate' to room ${roomId} (including sender)`);
      io.to(roomId).emit('languageUpdate', language);
      // Also update code to initial for new language if room was empty or new language selected
      room.code = INITIAL_CODE[language] || ''; // Ensure server-side code matches frontend initial
      console.log(`Server: Also updating room code to initial for ${language}.`);
    } else {
      console.warn(`Server: 'languageChange' received for non-existent room: ${roomId}`);
    }
  });

  // Handle typing indicators from a client
  socket.on('typing', ({ roomId, userName }) => {
    console.log(`Server: Received 'typing' from ${userName} for room: ${roomId}`);
    // Broadcast typing indicator to all other clients in the room (excluding sender)
    console.log(`Server: Broadcasting 'userTyping' to room ${roomId} (excluding sender)`);
    socket.to(roomId).emit('userTyping', userName);
  });

  // Handle code execution request from a client
  socket.on('compileCode', async ({ code, roomId, language }) => {
    console.log(`Server: Received 'compileCode' request for room ${roomId}, language: ${language}`);
    try {
      // This is your current echo-back logic for socket compilation.
      // In a real app, you'd integrate with your compiler service here.
      const response = {
        run: {
          output: `Code execution via Socket.IO not fully implemented yet.
Received ${language} code:\n${code}`,
          stderr: null
        }
      };
      
      // Send the compilation response back to all clients in the room
      console.log(`Server: Emitting 'codeResponse' to room ${roomId}`);
      io.to(roomId).emit('codeResponse', response);
    } catch (error) {
      console.error('Server: Error during socket compileCode:', error);
      socket.emit('error', { message: 'Code execution failed on server via socket' });
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Server: User Disconnected:', socket.id);
    
    // Find and clean up user from all rooms they might have been in
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const userName = room.users.get(socket.id);
        room.users.delete(socket.id); // Remove user from room's list
        console.log(`Server: User ${userName} removed from room ${roomId} on disconnect.`);
        
        // Notify others in the room that a user left
        console.log(`Server: Emitting 'userNotification' (leave) to room ${roomId}`);
        io.to(roomId).emit('userNotification', {
          type: 'leave',
          user: userName
        });
        
        // Update room info (user list) for remaining users
        console.log(`Server: Emitting 'roomInfo' to room ${roomId} after disconnect`);
        io.to(roomId).emit('roomInfo', {
          users: Array.from(room.users.values()),
          activity: `${userName} left`
        });
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          console.log(`Server: Room ${roomId} is now empty, deleting it.`);
          rooms.delete(roomId);
        }
      }
    });
  });

  // Handle explicit leave room event from a client
  socket.on('leaveRoom', () => {
    console.log(`Server: Received 'leaveRoom' from ${socket.id}`);
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const userName = room.users.get(socket.id);
        room.users.delete(socket.id);
        socket.leave(roomId); // Remove socket from the room
        console.log(`Server: User ${userName} explicitly left room ${roomId}.`);
        
        // Notify others
        console.log(`Server: Emitting 'userNotification' (leave) to room ${roomId}`);
        io.to(roomId).emit('userNotification', {
          type: 'leave',
          user: userName
        });
        
        console.log(`Server: Emitting 'roomInfo' to room ${roomId} after explicit leave`);
        io.to(roomId).emit('roomInfo', {
          users: Array.from(room.users.values()),
          activity: `${userName} left`
        });
        
        if (room.users.size === 0) {
          console.log(`Server: Room ${roomId} is now empty after explicit leave, deleting it.`);
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

// Create room endpoint (HTTP)
app.post('/api/room', (req, res) => {
  const roomId = uuidv4(); // Generate a unique room ID
  // Initialize room with default code and language
  rooms.set(roomId, {
    users: new Map(),
    code: INITIAL_CODE.javascript, // Set initial code for new rooms
    language: 'javascript'
  });
  console.log(`Server: Created new room via API: ${roomId}`);
  res.json({ roomId });
});

// Mount the compiler router
app.use('/api/compile', compileRouter);

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Define INITIAL_CODE for server-side use if it's not imported
// This is important for new rooms to have initial code
const INITIAL_CODE = {
  javascript: `// JavaScript Hello World
console.log("Hello, World!");`,
  python: `# Python Hello World
print("Hello, World!")`,
  java: `// Java Hello World
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `// C++ Hello World
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  typescript: `// TypeScript Hello World
const greeting: string = "Hello, World!";
console.log(greeting);`,
  ruby: `# Ruby Hello World
puts "Hello, World!"`
};
