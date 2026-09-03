import 'dotenv/config';
import http from 'http';

import app from './src/app.js';
import { initializeSocketIO } from './src/sockets/index.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initializeSocketIO(server);

server.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(`🚨 Echo Safety Backend Server running on port ${PORT}`);
  logger.info(`📡 HTTP Endpoint: http://localhost:${PORT}/api/v1`);
  logger.info(`📚 Swagger UI Docs: http://localhost:${PORT}/docs`);
  logger.info(`⚡ WebSocket Endpoint: ws://localhost:${PORT}`);
  logger.info(`==================================================`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
});

