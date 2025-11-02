require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  port: process.env.PG_PORT,
});

async function upsertCandle(tick) {
  const symbol = tick.symbol;
  const price = parseFloat(tick.price);
  const volume = parseFloat(tick.volume);
  const timestamp = tick.event_time;

  const openTime = timestamp - (timestamp % 60000);
  const closeTime = openTime + 60000;

  const query = `
    INSERT INTO candles (symbol, timeframe, open, high, low, close, volume, open_time, close_time)
    VALUES ($1, '1m', $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (symbol, timeframe, open_time)
    DO UPDATE SET
      open = candles.open, -- ✅ keep original open
      high = GREATEST(candles.high, EXCLUDED.high),
      low = LEAST(candles.low, EXCLUDED.low),
      close = EXCLUDED.close,
      volume = candles.volume + EXCLUDED.volume;
  `;

  const values = [
    symbol,
    price,  // open
    price,  // high
    price,  // low
    price,  // close
    volume,
    openTime,
    closeTime
  ];

  await pool.query(query, values);
}

module.exports = { upsertCandle };