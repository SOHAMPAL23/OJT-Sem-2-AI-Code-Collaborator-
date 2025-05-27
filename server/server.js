const express = require('express');
const connectDB = require('./config/db');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const app = express();
const dotenv = require('dotenv');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

dotenv.config();
connectDB();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Mount routes
app.use('/api', require('./routes/compiler'));
app.use('/api/auth', require('./routes/auth'));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});


// Socket.io logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on("join-room", ({roomId,name}) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.username=name;
    console.log(`${name} joined room ${roomId}`);
  });

  // Chat message
  socket.on("send-message", ({ roomId, message }) => {
    const senderName=socket.username || 'Anonymous'
    socket.to(roomId).emit("receive-message", {
      sender: senderName,
      message
    });
  });
  
  // Code change (live collaboration) 
  socket.on("code-change", ({ roomId, code }) => {
    console.log(`Received code-change from ${socket.username || 'Anonymous'} in room ${roomId}`);
    socket.to(roomId).emit("receive-code", code);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
