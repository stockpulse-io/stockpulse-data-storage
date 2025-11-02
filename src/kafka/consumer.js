require("dotenv").config();
const { Kafka } = require("kafkajs");
const handleError = require("../helpers/errorHandler"); 

async function runConsumer() {
  const kafka = new Kafka({
    clientId: "stockpulse-io-consumer",
    brokers: [process.env.BROKER_NAME],
  });

  const consumer = kafka.consumer({
    groupId: "stockpulse-stream-group", 
  });

  try {
    await consumer.connect();
    console.log("Kafka Consumer connected...");

    await consumer.subscribe({ topic: process.env.TOPIC, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log("Tick Received:", data);
        } catch (err) {
          handleError(err, "KAFKA_CONSUMER_PARSE");
        }
      },
    });

  } catch (error) {
    handleError(error, "KAFKA_CONSUMER");
  }
}

runConsumer();
