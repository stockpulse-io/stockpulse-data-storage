const { Kafka } = require("kafkajs");
const { upsertCandle } = require("../services/candleService");

async function runConsumer() {
  const kafka = new Kafka({
    clientId: "stockpulse-io-consumer",
    brokers: [process.env.BROKER_NAME], // localhost:9092
  });

  const consumer = kafka.consumer({ groupId: "stockpulse-stream-group" });

  await consumer.connect();
  console.log("Kafka Consumer connected...");

  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const tick = JSON.parse(message.value.toString());
      console.log(`Tick: ${tick.symbol} | Price: ${tick.price}`);

      try {
        await upsertCandle(tick);
      } catch (err) {
        handleError(err, "PG_INSERT_ERROR");
      }
    },
  });
}

module.exports = runConsumer;