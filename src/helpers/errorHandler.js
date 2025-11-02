const fs = require('fs');
const path = require('path');

function handleError(error, context) {
  const timestamp = new Date().toISOString();
  const logDir = path.join(__dirname, '..', '..', 'logs');
  const logFile = path.join(logDir, 'error.log');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Prepare error message safely
  const messageText = error instanceof Error
    ? error.stack || error.message
    : typeof error === 'string'
      ? error
      : JSON.stringify(error, null, 2);

  const message = `[${timestamp}] [${context}] ${messageText}\n`;

  try {
    // Synchronous write ensures log is saved before exit
    fs.appendFileSync(logFile, message);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }

  console.error(message);

  if (error.isFatal) {
    console.error('Fatal error occurred. Exiting...');
    process.exit(1);
  }
}

module.exports = handleError;