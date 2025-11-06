# 🧠 StockPulse Data Ingestion & Storage

---

## 🚀 Features

- ✅ Ingest live ticks from Kafka  
- ✅ Convert ticks into 1-minute OHLCV candles  
- ✅ Store historical candles in PostgreSQL  
- ✅ Perform UPSERT logic (update existing candle for the same minute)

---

## 🐳 Kafka Setup

If Kafka is **not already running**, start it using Docker:

```bash
docker compose up -d
````

---

## 🧩 1. Install Node.js Dependencies

Initialize and install required packages:

```bash
npm init -y
npm install kafkajs dotenv pg redis
```

---

## 🐘 2. PostgreSQL Setup

### a. Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### b. Create Database and User

```bash
sudo -u postgres psql
```

Inside the PostgreSQL shell:

```sql
CREATE DATABASE stockpulse;
CREATE USER stockpulse_user WITH ENCRYPTED PASSWORD 'abcd1234';
GRANT ALL PRIVILEGES ON DATABASE stockpulse TO stockpulse_user;
\q
```

### c. Set Permissions

```bash
sudo -i -u postgres
psql -d stockpulse
```

Run the following SQL commands:

```sql
GRANT ALL PRIVILEGES ON SCHEMA public TO stockpulse_user;
ALTER SCHEMA public OWNER TO stockpulse_user;
GRANT CREATE ON DATABASE stockpulse TO stockpulse_user;
```

### d. Verify Schema Ownership

```sql
SELECT schema_name, schema_owner
FROM information_schema.schemata
WHERE schema_name = 'public';
```

**Expected Output:**

```
public | stockpulse_user
```

### e. Connect as Application User

```bash
psql -U stockpulse_user -d stockpulse -h localhost
```

### f. Create Candles Table

```sql
CREATE TABLE candles (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  open NUMERIC(30, 10) NOT NULL,
  high NUMERIC(30, 10) NOT NULL,
  low NUMERIC(30, 10) NOT NULL,
  close NUMERIC(30, 10) NOT NULL,
  volume NUMERIC(38, 18) DEFAULT 0,
  open_time BIGINT NOT NULL,
  close_time BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol, timeframe, open_time)
);

CREATE INDEX idx_candles_symbol_timeframe_time
ON candles (symbol, timeframe, open_time DESC);
```

---

## ⚙️ 3. Environment Setup

Copy `.env.example` → create your own `.env` file.

Edit `.env` and add your PostgreSQL username and password.

---

## ▶️ 4. Running the System

### Run the ingestion service

(Consumes live tick data from Kafka and stores candles)

### Run the storage service

```bash
node index.js
```

---

## 📊 Architecture Overview

```
Kafka Producer → Kafka Broker → Consumer Service → PostgreSQL + Redis
```

* **Kafka Producer**: Sends live tick data
* **Consumer (this project)**: Converts ticks into OHLCV candles
* **PostgreSQL**: Stores historical data
* **Redis**: Stores live tick cache