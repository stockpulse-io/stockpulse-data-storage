This repository ingests real-time tick data (trades) from a Kafka stream and converts them into candlestick (OHLCV) candles in PostgreSQL.

✅ Ingest live ticks from Kafka

✅ Convert ticks into 1-minute OHLCV candles

✅ Store history in PostgreSQL

✅ UPSERT logic (update existing candle per minute)

Steps:-
Kakfa Setup(If Kafka is not already running, start it using Docker):
    docker compose up -d

1. Install Node Dependencies

    npm init -y
    npm install kafkajs dotenv pg
    npm install pg
    npm install redis

2. PostgreSQL Setup

    a. Install PostgreSQL
        sudo apt install postgresql postgresql-contrib
        sudo service postgresql start

    b. Create DB & User
        sudo -u postgres psql

        CREATE DATABASE stockpulse;
        CREATE USER stockpulse_user WITH ENCRYPTED PASSWORD 'abcd1234';
        GRANT ALL PRIVILEGES ON DATABASE stockpulse TO stockpulse_user;

        \q
    c. Permissions
        sudo -i -u postgres

        psql -d stockpulse

        GRANT ALL PRIVILEGES ON SCHEMA public TO stockpulse_user;
        ALTER SCHEMA public OWNER TO stockpulse_user;
        GRANT CREATE ON DATABASE stockpulse TO stockpulse_user;
    d. Verify
        SELECT schema_name, schema_owner
        FROM information_schema.schemata
        WHERE schema_name = 'public';

        Expected Output:-
            public | stockpulse_user
    e. Connect as app user
        psql -U stockpulse_user -d stockpulse -h localhost
    f. Create Candles Table
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
        
3. Environment Setup

    Copy .env.example → create your own .env file
    Edit .env and add your Postgres username and password

4. Running the System

    Run ingestion service
    Run storage service:-
        node index.js
