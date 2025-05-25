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
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    console.log(`${socket.id} joined room ${roomId}`);
  });

  // Chat message
  socket.on("send-message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive-message", {
      sender: socket.id,
      message
    });
  });
  
  // Code change (live collaboration)
  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("receive-code", code);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
