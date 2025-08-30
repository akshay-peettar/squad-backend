import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectMongo, connectPostgres } from './config/db';
import authRoutes from './routes/authRoutes';
import agentRoutes from './routes/agentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import messageRoutes from './routes/messageRoutes';
import JWTService from './services/jwtService';
import { socketHandler } from './socket/socketHandler';

const app = express();
app.use(express.json());
app.use(cors());

// 4. Create an HTTP server from our Express app
const server = http.createServer(app);

// 5. Create a new Socket.IO server and attach it to the HTTP server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://qdd26qdp-5173.inc1.devtunnels.ms"], // Allow our React app to connect
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Squad Room Server is running!');
});

app.use((req, res, next) => {
    req.app.set('socketio', io);
    next();
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: No token provided.'));
    }

    try {
        // Use our JWTService to verify the token
        console.log('Verifying token:', token);
        const payload = JWTService.verifyToken(token);
        // You can attach user info to the socket object if needed later
        // (socket as any).userId = payload.id; 
        next(); // Token is valid, proceed with the connection
    } catch (error) {
        console.error("Socket Auth Error:", error);
        next(new Error('Authentication error: Invalid token.')); // Token is invalid, reject connection
    }
});


connectMongo();
connectPostgres();

socketHandler(io)

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chat', messageRoutes);
app.use('/api/analytics', analyticsRoutes);




server.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});