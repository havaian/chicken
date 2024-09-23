const moment = require('moment-timezone');
const { logger } = require('../logging');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

const ACTIVITIES_CACHE_KEY = 'all_todays_activities_cache';
const CACHE_EXPIRY = 86400; // 24 hours in seconds

const activitiesCacheUtils = {
  async cacheAllTodaysActivities(activitiesData) {
    try {
      await redis.setex(ACTIVITIES_CACHE_KEY, CACHE_EXPIRY, JSON.stringify(activitiesData));
      logger.info('All today\'s activities cached successfully');
    } catch (error) {
      logger.error('Error caching all today\'s activities:', error);
    }
  },

  async getCachedAllTodaysActivities() {
    try {
      const cachedData = await redis.get(ACTIVITIES_CACHE_KEY);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      logger.error('Error retrieving cached all today\'s activities:', error);
      return null;
    }
  },

  async invalidateCache() {
    try {
      await redis.del(ACTIVITIES_CACHE_KEY);
      logger.info('All today\'s activities cache invalidated');
    } catch (error) {
      logger.error('Error invalidating all today\'s activities cache:', error);
    }
  },

  isCacheValid() {
    const now = moment().tz('Asia/Tashkent');
    const sixAM = moment().tz('Asia/Tashkent').startOf('day').add(6, 'hours');
    return now.isAfter(sixAM);
  },

  async getOrSetAllTodaysActivities(fetchFunction) {
    if (this.isCacheValid()) {
      const cachedData = await this.getCachedAllTodaysActivities();
      if (cachedData) {
        return cachedData;
      }
    }

    const freshData = await fetchFunction();
    await this.cacheAllTodaysActivities(freshData);
    return freshData;
  },

  async refreshCacheIfNeeded(fetchFunction) {
    if (!this.isCacheValid()) {
      const freshData = await fetchFunction();
      await this.cacheAllTodaysActivities(freshData);
    }
  },
};

module.exports = activitiesCacheUtils;