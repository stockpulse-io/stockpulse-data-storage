require("dotenv").config();
const { Kafka } = require("kafkajs");
const { upsertCandle } = require("../services/candleService")
const { handleError } = require("../helpers/errorHandler");
const { connectRedis, saveLiveTick } = require("../services/redisService");

async function runConsumer() {
  const kafka = new Kafka({
    clientId: "stockpulse-io-consumer",
    brokers: [process.env.BROKER_NAME],
  });

  const consumer = kafka.consumer({ groupId: "stockpulse-stream-group" });

  await consumer.connect();
  console.log("Kafka Consumer connected...");

  await connectRedis();

  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const tick = JSON.parse(message.value.toString());
      console.log(`Tick: ${tick.symbol} | Price: ${tick.price}`);

      try {
        await upsertCandle(tick);   // Store in Postgres
        await saveLiveTick(tick);  // Store in Redis
      } catch (err) {
        handleError(err, "CONSUMER_ERROR");
      }
    },
  });
}

module.exports = runConsumer;