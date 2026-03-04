-- ============================================
-- AI Shopify Store Creator — Database Schema
-- ============================================

-- Store creation runs
CREATE TABLE IF NOT EXISTS store_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  niche TEXT NOT NULL,
  target_audience TEXT,
  budget_tier VARCHAR(20),
  unique_selling_point TEXT,
  contact_email VARCHAR(255),
  store_url TEXT,
  admin_url TEXT,
  qa_score INTEGER,
  error_message TEXT,
  current_phase VARCHAR(100),
  progress INTEGER DEFAULT 0
);

-- Phase logs for each run
CREATE TABLE IF NOT EXISTS phase_logs (
  id SERIAL PRIMARY KEY,
  run_id UUID REFERENCES store_runs(id),
  phase VARCHAR(100),
  status VARCHAR(50),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,6),
  output JSONB,
  error TEXT
);

-- Generated products for each run
CREATE TABLE IF NOT EXISTS generated_products (
  id SERIAL PRIMARY KEY,
  run_id UUID REFERENCES store_runs(id),
  shopify_product_id BIGINT,
  title TEXT,
  description TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  collection TEXT,
  tags TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Error log
CREATE TABLE IF NOT EXISTS error_log (
  id SERIAL PRIMARY KEY,
  run_id UUID,
  phase VARCHAR(100),
  error_type VARCHAR(100),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
