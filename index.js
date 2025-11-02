require("dotenv").config();
const runConsumer = require("./src/kafka/consumer");

(async () => {
  try {
    console.log("Starting StockPulse Data Storage Service...");
    await runConsumer();
  } catch (err) {
    handleError(err, "FAILED_TO_START_SERVICE");
    process.exit(1);
  }
})();