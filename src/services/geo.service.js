import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';
import { findUserFcmTokensByIds, findAllOtherUserFcmTokens } from '../models/user.model.js';

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

/**
 * Queries FCM tokens for nearby bystanders and users within a given geographic radius.
 * If Redis spatial index has no tracked locations, falls back to all registered app users with FCM tokens.
 * @param {object} params
 * @param {number} params.latitude - Geographic latitude of origin
 * @param {number} params.longitude - Geographic longitude of origin
 * @param {number} [params.radiusKm=8] - Radius in km
 * @param {string} [params.excludeUserId] - User ID to exclude (e.g. the victim)
 * @returns {Promise<{ fcmTokens: Array<string>, nearbyCount: number }>}
 */
export const getNearbyUserFcmTokens = async ({ latitude, longitude, radiusKm = 8, excludeUserId }) => {
  try {
    const nearbyBystanders = await queryNearbyInRedis('bystander', latitude, longitude, radiusKm);
    const nearbyVictims = await queryNearbyInRedis('victim', latitude, longitude, radiusKm);

    const allNearby = [...nearbyBystanders, ...nearbyVictims];
    const uniqueUserIds = [...new Set(allNearby.map(item => item.id))].filter(id => id !== excludeUserId);

    let fcmTokens = [];
    if (uniqueUserIds.length > 0) {
      fcmTokens = await findUserFcmTokensByIds(uniqueUserIds);
    }

    // Fallback: If no live locations stored in Redis, dispatch to all registered app users with valid FCM tokens
    if (fcmTokens.length === 0) {
      logger.info(`No live bystander positions found in Redis within ${radiusKm}km. Falling back to all registered user FCM tokens.`);
      fcmTokens = await findAllOtherUserFcmTokens(excludeUserId);
      return { fcmTokens, nearbyCount: fcmTokens.length };
    }

    return { fcmTokens, nearbyCount: uniqueUserIds.length };
  } catch (err) {
    logger.error('Error fetching FCM tokens for nearby users:', err);
    try {
      const fallbackTokens = await findAllOtherUserFcmTokens(excludeUserId);
      return { fcmTokens: fallbackTokens, nearbyCount: fallbackTokens.length };
    } catch (fallbackErr) {
      return { fcmTokens: [], nearbyCount: 0 };
    }
  }
};



