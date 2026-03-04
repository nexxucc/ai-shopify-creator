const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { storeCreateSchema } = require('../schemas/storeCreate');

module.exports = function (pool, redis) {
    const router = express.Router();
    const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

    // ── Shopify cleanup helper ─────────────────────────────
    async function cleanShopifyStore() {
        const https = require('https');
        const domain = process.env.SHOPIFY_STORE_DOMAIN;
        const token = process.env.SHOPIFY_ACCESS_TOKEN;
        const headers = { 'X-Shopify-Access-Token': token };

        const shopifyGet = (path) => new Promise((resolve, reject) => {
            https.get({ hostname: domain, path, headers }, r => {
                let b = '';
                r.on('data', c => b += c);
                r.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
            }).on('error', reject);
        });

        const shopifyDel = (path) => new Promise((resolve, reject) => {
            const rq = https.request({ hostname: domain, path, method: 'DELETE', headers }, r => {
                let b = ''; r.on('data', c => b += c); r.on('end', () => resolve(r.statusCode));
            });
            rq.on('error', reject);
            rq.end();
        });

        // Delete products
        const prods = await shopifyGet('/admin/api/2024-01/products.json?limit=250');
        for (const p of (prods.products || [])) {
            await shopifyDel(`/admin/api/2024-01/products/${p.id}.json`);
            await new Promise(r => setTimeout(r, 300));
        }

        // Delete collections
        const colls = await shopifyGet('/admin/api/2024-01/custom_collections.json?limit=250');
        for (const c of (colls.custom_collections || [])) {
            await shopifyDel(`/admin/api/2024-01/custom_collections/${c.id}.json`);
            await new Promise(r => setTimeout(r, 300));
        }

        // Delete pages
        const pages = await shopifyGet('/admin/api/2024-01/pages.json?limit=250');
        for (const pg of (pages.pages || [])) {
            await shopifyDel(`/admin/api/2024-01/pages/${pg.id}.json`);
            await new Promise(r => setTimeout(r, 300));
        }
    }

    // ── POST /api/stores/create ──────────────────────────
    router.post('/create', async (req, res, next) => {
        try {
            // Validate input
            const parsed = storeCreateSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: parsed.error.issues.map(i => ({
                        field: i.path.join('.'),
                        message: i.message
                    }))
                });
            }

            const { niche, targetAudience, budgetTier, uniqueSellingPoint, contactEmail, productCount } = parsed.data;

            // Clean existing Shopify store data before creating new
            console.log('🧹 Cleaning store before new run...');
            try {
                await cleanShopifyStore();
                console.log('✅ Store cleaned');
            } catch (cleanErr) {
                console.warn('⚠️ Store cleanup had issues:', cleanErr.message);
                // Continue anyway — non-fatal
            }

            // Insert run record
            const result = await pool.query(
                `INSERT INTO store_runs (niche, target_audience, budget_tier, unique_selling_point, contact_email, status, current_phase)
         VALUES ($1, $2, $3, $4, $5, 'pending', 'queued')
         RETURNING id`,
                [niche, targetAudience, budgetTier, uniqueSellingPoint, contactEmail]
            );

            const runId = result.rows[0].id;

            // Trigger n8n workflow with retry (3 attempts)
            let webhookSuccess = false;
            let lastError = null;

            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    await axios.post(
                        `${WEBHOOK_URL}/create-store`,
                        { runId, niche, targetAudience, budgetTier, uniqueSellingPoint, contactEmail, productCount },
                        { timeout: 10000 }
                    );
                    webhookSuccess = true;
                    break;
                } catch (err) {
                    lastError = err;
                    console.warn(`Webhook attempt ${attempt}/3 failed:`, err.message);
                    if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
                }
            }

            if (!webhookSuccess) {
                // Update run status to reflect webhook failure
                await pool.query(
                    `UPDATE store_runs SET status='webhook_failed', error_message=$1 WHERE id=$2`,
                    [`Webhook failed after 3 attempts: ${lastError?.message}`, runId]
                );
                return res.status(502).json({
                    error: 'Failed to trigger workflow',
                    runId,
                    message: 'The workflow engine is not responding. Please try again later.',
                    statusUrl: `/api/stores/${runId}/status`
                });
            }

            // Update status
            await pool.query(`UPDATE store_runs SET status='running' WHERE id=$1`, [runId]);

            res.status(201).json({
                runId,
                status: 'started',
                estimatedMinutes: 10,
                statusUrl: `/api/stores/${runId}/status`
            });
        } catch (err) {
            next(err);
        }
    });

    // ── GET /api/stores/:runId/status ────────────────────
    router.get('/:runId/status', async (req, res, next) => {
        try {
            const { runId } = req.params;

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(runId)) {
                return res.status(400).json({ error: 'Invalid run ID format' });
            }

            const result = await pool.query(
                `SELECT id as "runId", status, progress, current_phase as "currentPhase",
                created_at as "createdAt", updated_at as "updatedAt",
                error_message as "errorMessage", store_url as "storeUrl"
         FROM store_runs WHERE id = $1`,
                [runId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Run not found' });
            }

            res.json(result.rows[0]);
        } catch (err) {
            next(err);
        }
    });

    // ── GET /api/stores/:runId/result ────────────────────
    router.get('/:runId/result', async (req, res, next) => {
        try {
            const { runId } = req.params;

            const runResult = await pool.query(
                `SELECT * FROM store_runs WHERE id = $1`, [runId]
            );
            if (runResult.rows.length === 0) {
                return res.status(404).json({ error: 'Run not found' });
            }

            const run = runResult.rows[0];
            const products = await pool.query(
                `SELECT * FROM generated_products WHERE run_id = $1`, [runId]
            );
            const phases = await pool.query(
                `SELECT * FROM phase_logs WHERE run_id = $1 ORDER BY started_at`, [runId]
            );
            const errors = await pool.query(
                `SELECT * FROM error_log WHERE run_id = $1 ORDER BY created_at`, [runId]
            );

            res.json({
                run: {
                    id: run.id,
                    status: run.status,
                    niche: run.niche,
                    progress: run.progress,
                    storeUrl: run.store_url,
                    createdAt: run.created_at,
                    completedAt: run.updated_at,
                    errorMessage: run.error_message
                },
                products: products.rows,
                phases: phases.rows,
                errors: errors.rows,
                summary: {
                    totalProducts: products.rows.length,
                    totalPhases: phases.rows.length,
                    totalErrors: errors.rows.length
                }
            });
        } catch (err) {
            next(err);
        }
    });

    // ── GET /api/stores ──────────────────────────────────
    router.get('/', async (req, res, next) => {
        try {
            const result = await pool.query(
                `SELECT id, status, niche, progress, current_phase, qa_score, store_url, error_message, created_at
         FROM store_runs ORDER BY created_at DESC LIMIT 20`
            );
            res.json({ runs: result.rows });
        } catch (err) {
            next(err);
        }
    });

    // ── DELETE /api/stores/cleanup ───────────────────────
    // Cleans up test Shopify store data
    router.delete('/cleanup', async (req, res, next) => {
        try {
            const https = require('https');
            const domain = process.env.SHOPIFY_STORE_DOMAIN;
            const token = process.env.SHOPIFY_ACCESS_TOKEN;
            const headers = { 'X-Shopify-Access-Token': token };

            const shopifyGet = (path) => new Promise((resolve, reject) => {
                https.get({ hostname: domain, path, headers }, r => {
                    let b = '';
                    r.on('data', c => b += c);
                    r.on('end', () => {
                        try { resolve(JSON.parse(b)); } catch (e) { reject(e); }
                    });
                }).on('error', reject);
            });

            const shopifyDelete = (path) => new Promise((resolve, reject) => {
                const req = https.request({ hostname: domain, path, method: 'DELETE', headers }, r => {
                    let b = '';
                    r.on('data', c => b += c);
                    r.on('end', () => resolve(r.statusCode));
                });
                req.on('error', reject);
                req.end();
            });

            const deleted = { products: 0, collections: 0, pages: 0 };

            // Delete products (except gift cards)
            const prods = await shopifyGet('/admin/api/2024-01/products.json?limit=250');
            for (const p of (prods.products || [])) {
                if (p.product_type !== 'giftcard') {
                    await shopifyDelete(`/admin/api/2024-01/products/${p.id}.json`);
                    deleted.products++;
                    await new Promise(r => setTimeout(r, 300));
                }
            }

            // Delete custom collections
            const colls = await shopifyGet('/admin/api/2024-01/custom_collections.json?limit=250');
            for (const c of (colls.custom_collections || [])) {
                await shopifyDelete(`/admin/api/2024-01/custom_collections/${c.id}.json`);
                deleted.collections++;
                await new Promise(r => setTimeout(r, 300));
            }

            // Delete pages (except policy pages)
            const pages = await shopifyGet('/admin/api/2024-01/pages.json?limit=250');
            for (const pg of (pages.pages || [])) {
                await shopifyDelete(`/admin/api/2024-01/pages/${pg.id}.json`);
                deleted.pages++;
                await new Promise(r => setTimeout(r, 300));
            }

            // Clean database
            await pool.query('DELETE FROM generated_products');
            await pool.query('DELETE FROM phase_logs');
            await pool.query('DELETE FROM error_log');
            await pool.query('DELETE FROM store_runs');

            res.json({
                message: 'Store cleaned up successfully',
                deleted
            });
        } catch (err) {
            next(err);
        }
    });

    return router;
};
