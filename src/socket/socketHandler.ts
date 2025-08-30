import { Server, Socket } from 'socket.io';
import JWTService from '../services/jwtService';
import Message from '../models/messageModel';

export const socketHandler = (io: Server) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }
    try {
      const payload = JWTService.verifyToken(token);
      (socket as any).user = payload;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    console.log('✅ Authenticated user connected:', socket.id);

    // Load message history on connection
    try {
      const messages = await Message.find().sort({ createdAt: 'asc' }).limit(50);
      socket.emit('load_messages', messages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }

    // The 'send_message' listener is now GONE from here.

    socket.on('disconnect', () => {
      console.log('🔥 Authenticated user disconnected:', socket.id);
    });
  });
};