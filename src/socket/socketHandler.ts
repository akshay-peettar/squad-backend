import { Server, Socket } from 'socket.io';
import JWTService from '../services/jwtService';

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

  io.on('connection', (socket: Socket) => {
    console.log('✅ Authenticated user connected:', socket.id);

    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on('leave_chat', (chatId) => {
        socket.leave(chatId);
        console.log(`User ${socket.id} left chat ${chatId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('🔥 Authenticated user disconnected:', socket.id);
    });
  });
};