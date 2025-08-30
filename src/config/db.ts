// ensures all env vars are loaded

import mongoose from 'mongoose';
import { Pool } from 'pg';

// --- MongoDB Connection ---
const connectMongo = async () => {
    try {
        console.log('🍃 Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI!);
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        process.exit(1);
    }
};

// --- PostgreSQL Connection ---
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT || '5432'),
});

const connectPostgres = async () => {
    try {
        console.log('🐘 Connecting to PostgreSQL...');
        await pool.query('SELECT NOW()'); // A simple query to check the connection
        console.log('🐘 PostgreSQL Connected');
    } catch (error: any) {
        console.error(`❌ PostgreSQL Error: ${error.message}`);
        process.exit(1);
    }
};

export { connectMongo, connectPostgres, pool as pgPool };