const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const Redis = require('ioredis');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.API_PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// Request timeout middleware (120s to allow for cleanup)
app.use((req, res, next) => {
    res.setTimeout(120000, () => {
        if (!res.headersSent) {
            res.status(408).json({ error: 'Request timeout' });
        }
    });
    next();
});

// ── Database ───────────────────────────────────────────
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    database: 'shopify_ai',
    user: process.env.POSTGRES_USER || 'shopify_ai',
    password: process.env.POSTGRES_PASSWORD || 'changeme456',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// ── Redis ──────────────────────────────────────────────
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 1000,
    lazyConnect: true,
});

redis.connect().catch(err => {
    console.warn('⚠️  Redis not available:', err.message);
});

// ── Health Check ───────────────────────────────────────
app.get('/health', async (req, res) => {
    const status = { api: 'ok', timestamp: new Date().toISOString() };
    try {
        await pool.query('SELECT 1');
        status.postgres = 'ok';
    } catch (e) {
        status.postgres = 'error: ' + e.message;
    }
    try {
        await redis.ping();
        status.redis = 'ok';
    } catch (e) {
        status.redis = 'error: ' + e.message;
    }
    const overallOk = status.postgres === 'ok';
    res.status(overallOk ? 200 : 503).json(status);
});

// ── Routes ─────────────────────────────────────────────
const storeRoutes = require('./routes/stores');
app.use('/api/stores', storeRoutes(pool, redis));

const themeRoutes = require('./routes/theme');
app.use('/api/theme', themeRoutes());

// ── Serve Dashboard (React build) ──────────────────────
const dashboardPath = path.join(__dirname, '..', 'dashboard', 'dist');
app.use(express.static(dashboardPath));

// SPA catch-all: serve index.html for non-API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/health') {
        return res.status(404).json({ error: 'Not found', path: req.path });
    }
    if (req.method === 'GET' && req.accepts('html')) {
        return res.sendFile(path.join(dashboardPath, 'index.html'));
    }
    next();
});

// ── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// ── Graceful Shutdown ──────────────────────────────────
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    try {
        await pool.end();
        redis.disconnect();
        console.log('Database and Redis connections closed.');
        process.exit(0);
    } catch (e) {
        console.error('Error during shutdown:', e);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 AI Shopify Creator API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Stores: http://localhost:${PORT}/api/stores`);
    console.log('');
});
