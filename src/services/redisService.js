const { redisClient } = require("../config/redis");
const { handleError } = require("../helpers/errorHandler");

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Redis connected...");
  } catch (err) {
    handleError(err, "REDIS_CONNECTION_ERROR");
  }
}

async function saveLiveTick(tick) {
  try {
    const redisKey = `live:${tick.symbol}`;
    await redisClient.set(redisKey, JSON.stringify(tick));
    await redisClient.publish("live_ticks", JSON.stringify(tick));
  } catch (err) {
    handleError(err, "REDIS_SAVE_TICK_ERROR");
  }
}

module.exports = {
  connectRedis,
  saveLiveTick,
};
