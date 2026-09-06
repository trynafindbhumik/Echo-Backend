import { updateLiveLocationInRedis } from '../services/geo.service.js';
import logger from '../utils/logger.js';

/**
 * Registers real-time Socket.io event listeners for live tracking and bystander updates.
 * @param {import('socket.io').Server} io - Socket.io server instance
 * @param {import('socket.io').Socket} socket - Connected client socket instance
 */
export const registerTrackSocketHandlers = (io, socket) => {
  socket.on('bystander:location_update', async (payload) => {
    try {
      const { latitude, longitude } = payload;
      if (socket.user?.id) {
        await updateLiveLocationInRedis(socket.user.id, 'bystander', latitude, longitude);
      }
    } catch (err) {
      logger.error('Error handling bystander:location_update socket event:', err);
    }
  });

  socket.on('subscribe:alert', (alertId) => {
    socket.join(`alert:${alertId}`);
    logger.info(`Socket ${socket.id} subscribed to alert room: alert:${alertId}`);
  });
};

