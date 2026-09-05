import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { registerSosSocketHandlers } from './sos.socket.js';
import { registerTrackSocketHandlers } from './track.socket.js';
import logger from '../utils/logger.js';

let ioInstance = null;

/**
 * Initializes the global Socket.io server and registers connection middlewares.
 * @param {import('http').Server} httpServer - Node.js HTTP server instance
 * @returns {import('socket.io').Server} Configured Socket.io server
 */
export const initializeSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Allow anonymous connection for public tracking view
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      socket.user = decoded;
      next();
    } catch (err) {
      logger.error('Socket JWT authentication failed:', err.message);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`New WebSocket client connected: ${socket.id} (User: ${socket.user?.id || 'Anonymous'})`);

    registerSosSocketHandlers(io, socket);
    registerTrackSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

/**
 * Returns the active global Socket.io instance for REST controller broadcasts.
 * @returns {import('socket.io').Server | null} Socket.io server instance
 */
export const getIO = () => ioInstance;


