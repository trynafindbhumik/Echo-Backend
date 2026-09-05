import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Updates a victim or bystander's location in the Redis spatial index.
 * @param {string} entityId - User identifier
 * @param {string} entityType - Entity type ('victim' | 'bystander')
 * @param {number} latitude - Geographic latitude
 * @param {number} longitude - Geographic longitude
 */
export const updateLiveLocationInRedis = async (entityId, entityType, latitude, longitude) => {
  try {
    const key = `geo:${entityType}s`;
    await redisClient.geoadd(key, longitude, latitude, entityId);
  } catch (err) {
    logger.error(`Error storing live location in Redis for ${entityType}:${entityId}:`, err);
  }
};

/**
 * Queries nearby responders or incidents within a given radius using Redis spatial indexing.
 * @param {string} entityType - Entity type ('victim' | 'bystander')
 * @param {number} latitude - Target latitude
 * @param {number} longitude - Target longitude
 * @param {number} [radiusKm=8] - Query radius in kilometers
 * @returns {Promise<Array<{ id: string, distanceKm: number }>>} Nearby entities sorted by distance
 */
export const queryNearbyInRedis = async (entityType, latitude, longitude, radiusKm = 8) => {
  try {
    const key = `geo:${entityType}s`;
    const results = await redisClient.georadius(key, longitude, latitude, radiusKm, 'km', 'WITHDIST', 'ASC');
    return results.map(([id, distance]) => ({
      id,
      distanceKm: parseFloat(distance),
    }));
  } catch (err) {
    logger.error(`Error querying nearby ${entityType}s in Redis:`, err);
    return [];
  }
};

