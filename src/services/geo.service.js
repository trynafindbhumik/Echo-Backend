import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';
import { findUserFcmTokensByIds, findAllOtherUserFcmTokens } from '../models/user.model.js';

/**
 * Updates a victim or bystander's location in the Redis spatial index with a 15-minute TTL.
 * @param {string} entityId - User identifier
 * @param {string} entityType - Entity type ('victim' | 'bystander')
 * @param {number} latitude - Geographic latitude
 * @param {number} longitude - Geographic longitude
 */
export const updateLiveLocationInRedis = async (entityId, entityType, latitude, longitude) => {
  try {
    const key = `geo:${entityType}s`;
    await redisClient.geoadd(key, longitude, latitude, entityId);
    // Store companion location freshness timestamp with 15-minute expiration (900 seconds)
    const timestampKey = `geo:last_seen:${entityId}`;
    await redisClient.set(timestampKey, Date.now().toString(), 'EX', 900);
  } catch (err) {
    logger.error(`Error storing live location in Redis for ${entityType}:${entityId}:`, err);
  }
};

/**
 * Queries nearby responders or incidents within a given radius using Redis spatial indexing.
 * Filters out stale locations whose last_seen timestamp key has expired (>15 mins).
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
    
    // Verify location freshness for each candidate
    const freshResults = [];
    for (const [id, distance] of results) {
      const timestampKey = `geo:last_seen:${id}`;
      const lastSeen = await redisClient.get(timestampKey);
      if (lastSeen) {
        freshResults.push({
          id,
          distanceKm: parseFloat(distance),
        });
      }
    }
    return freshResults;
  } catch (err) {
    logger.error(`Error querying nearby ${entityType}s in Redis:`, err);
    return [];
  }
};

/**
 * Queries FCM tokens for nearby bystanders and users within a given geographic radius.
 * Only notifies users with fresh location updates within the last 15 minutes.
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

    return { fcmTokens, nearbyCount: uniqueUserIds.length };
  } catch (err) {
    logger.error('Error fetching FCM tokens for nearby users:', err);
    return { fcmTokens: [], nearbyCount: 0 };
  }
};



