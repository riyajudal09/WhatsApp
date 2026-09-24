require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDb = require('./config/dbconnect');
const initializeSocket = require('./services/socketService');
const authRoutes = require('./routes/authRoute');
const chatRoutes = require('./routes/chatRoute');
const statusRoutes = require('./routes/statusRoute');
const { createCorsOriginValidator } = require('./config/corsConfig');

const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1);

app.use(cors({ origin: createCorsOriginValidator(), credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const io = initializeSocket(server);
app.use((req, _res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap;
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'success', message: 'API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/status', statusRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: err.message || 'Internal server error', data: null });
});

const PORT = Number(process.env.PORT || 5000);
connectDb().then(() => {
  server.listen(PORT, () => console.log(`WhatsApp Clone API running on http://localhost:${PORT}`));
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
