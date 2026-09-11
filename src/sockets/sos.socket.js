import { updateLiveLocationInRedis } from '../services/geo.service.js';
import logger from '../utils/logger.js';

/**
 * Registers real-time Socket.io event listeners for active SOS incidents.
 * @param {import('socket.io').Server} io - Socket.io server instance
 * @param {import('socket.io').Socket} socket - Connected client socket instance
 */
export const registerSosSocketHandlers = (io, socket) => {
  socket.on('join:nearby_incidents', async (payload) => {
    try {
      socket.join('nearby_incidents');
      logger.info(`Socket ${socket.id} joined room: nearby_incidents`);

      if (payload && payload.latitude != null && payload.longitude != null && socket.user?.id) {
        await updateLiveLocationInRedis(socket.user.id, 'bystander', payload.latitude, payload.longitude);
      }
    } catch (err) {
      logger.error('Error handling join:nearby_incidents socket event:', err);
    }
  });

  socket.on('leave:nearby_incidents', () => {
    try {
      socket.leave('nearby_incidents');
      logger.info(`Socket ${socket.id} left room: nearby_incidents`);
    } catch (err) {
      logger.error('Error handling leave:nearby_incidents socket event:', err);
    }
  });

  socket.on('sos:location_update', async (payload) => {
    try {
      const { alertId, latitude, longitude, accuracy, speed, heading } = payload;

      logger.debug(`SOS Location Update for Alert ${alertId}: (${latitude}, ${longitude})`);

      if (socket.user?.id) {
        await updateLiveLocationInRedis(socket.user.id, 'victim', latitude, longitude);
      }

      io.to(`alert:${alertId}`).emit('track:position_changed', {
        event: 'track:position_changed',
        data: {
          alertId,
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      logger.error('Error handling sos:location_update socket event:', err);
    }
  });
};

