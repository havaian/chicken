const Redis = require('ioredis');
const moment = require('moment-timezone');

const { logger } = require('../logging');

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
  logger.info('Redis ✅');
});

redis.on('error', (err) => {
  logger.info('❌ Redis:', err);
});

// Function to get today's 6 a.m. in UTC+5
const getTodaySixAMUTCPlusFive = () => {
  const timeZone = 'Asia/Tashkent'; // UTC+5
  return moment.tz(timeZone).startOf('day').add(6, 'hours');
};

// Function to get the start of the current "day" (6 a.m. today or 6 a.m. yesterday if it's before 6 a.m.)
const getCurrentDayStart = () => {
  const now = moment.tz('Asia/Tashkent');
  const todaySixAM = getTodaySixAMUTCPlusFive();
  return now.isBefore(todaySixAM) ? todaySixAM.subtract(1, 'day') : todaySixAM;
};

const COURIER_ACTIVITY_PREFIX = 'courier_activity_';
const COURIER_PREFIX = 'courier_';
const DEFAULT_EXPIRY = 1800; // 30 minutes in seconds

const redisUtils = {
  async getOrSetCourierActivity(phoneNum, fetchFunction) {
    const key = COURIER_ACTIVITY_PREFIX + phoneNum;
    try {
      let data = await redis.get(key);
      if (data) {
        return JSON.parse(data);
      }
      data = await fetchFunction();
      await redis.setex(key, DEFAULT_EXPIRY, JSON.stringify(data));
      return data;
    } catch (error) {
      logger.error(`Redis error for courier activity ${phoneNum}: ${error}`);
      return null;
    }
  },

  async getOrSetCourierActivityWithConditions(phoneNum, fetchFunction) {
    const key = COURIER_ACTIVITY_PREFIX + phoneNum;
    try {
      let data = await redis.get(key);
      const currentDayStart = getCurrentDayStart();

      if (data) {
        data = JSON.parse(data);
        // Check if the cached data is for the current day and meets special conditions
        if (moment(data.date).isSame(currentDayStart, 'day')) {
          if (data.unfinished === true) {
            return data;  // Return the exact activity if unfinished is true
          } else if (data.day_finished === true) {
            // If day_finished is true, we need to fetch a new activity
            data = await fetchFunction();
            if (data) {
              await redis.setex(key, DEFAULT_EXPIRY, JSON.stringify(data));
            }
            return data;
          }
        }
      }

      // If we reach here, we need to fetch new data
      data = await fetchFunction();
      if (data) {
        await redis.setex(key, DEFAULT_EXPIRY, JSON.stringify(data));
      }

      return data;
    } catch (error) {
      logger.error(`Redis error for courier activity ${phoneNum}: ${error}`);
      return null;
    }
  },

  async updateCourierActivity(phoneNum, data) {
    const key = COURIER_ACTIVITY_PREFIX + phoneNum;
    try {
      await redis.setex(key, DEFAULT_EXPIRY, JSON.stringify(data));
    } catch (error) {
      logger.error(`Redis error updating courier activity ${phoneNum}: ${error}`);
    }
  },

  async getOrSetCourier(phoneNum, fetchFunction) {
    const key = COURIER_PREFIX + phoneNum;
    try {
      let data = await redis.get(key);
      if (data) {
        return JSON.parse(data);
      }
      data = await fetchFunction();
      await redis.setex(key, DEFAULT_EXPIRY, JSON.stringify(data));
      return data;
    } catch (error) {
      logger.error(`Redis error for courier ${phoneNum}: ${error}`);
      return null;
    }
  },

  async updateCourier(phoneNum, data) {
    const key = COURIER_PREFIX + phoneNum;
    try {
      await redis.setex(key, DEFAULT_EXPIRY, JSON.stringify(data));
    } catch (error) {
      logger.error(`Redis error updating courier ${phoneNum}: ${error}`);
    }
  },

  async invalidateCourierActivity(phoneNum) {
    const key = COURIER_ACTIVITY_PREFIX + phoneNum;
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Redis error invalidating courier activity ${phoneNum}: ${error}`);
    }
  },

  async invalidateCourier(phoneNum) {
    const key = COURIER_PREFIX + phoneNum;
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Redis error invalidating courier ${phoneNum}: ${error}`);
    }
  }
};

module.exports = redisUtils;