import 'dotenv/config';
import http from 'http';

import app from './src/app.js';
import { initializeSocketIO } from './src/sockets/index.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initializeSocketIO(server);

const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || `http://localhost:${PORT}`;
const wsUrl = baseUrl.replace(/^http/, 'ws');

server.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(`🚨 Echo Safety Backend Server running on port ${PORT}`);
  logger.info(`📡 HTTP Endpoint: ${baseUrl}/api/v1`);
  logger.info(`📚 Swagger UI Docs: ${baseUrl}/docs`);
  logger.info(`⚡ WebSocket Endpoint: ${wsUrl}`);
  logger.info(`==================================================`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
});

