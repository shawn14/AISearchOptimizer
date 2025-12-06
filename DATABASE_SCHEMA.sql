-- AISearchOptimizer Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    company VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, business, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
    subscription_ends_at TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Brands table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    target_keywords TEXT[], -- Array of keywords
    brand_voice_profile JSONB, -- Store brand voice characteristics
    monitoring_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Queries table (monitoring prompts)
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    query_type VARCHAR(50), -- brand_mention, competitor_comparison, industry_question
    category VARCHAR(100), -- topic category
    priority INTEGER DEFAULT 1, -- 1-5 priority for scheduling
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Platforms enum
CREATE TYPE ai_platform AS ENUM ('chatgpt', 'claude', 'perplexity', 'gemini', 'grok');

-- AI Responses table (raw responses)
CREATE TABLE ai_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    platform ai_platform NOT NULL,
    response_text TEXT NOT NULL,
    response_metadata JSONB, -- Model used, tokens, cost, etc.
    execution_time_ms INTEGER,
    error_message TEXT,
    status VARCHAR(50) DEFAULT 'success', -- success, error, rate_limited
    created_at TIMESTAMP DEFAULT NOW()
);

-- Brand Mentions table (parsed mentions from responses)
CREATE TABLE brand_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_response_id UUID NOT NULL REFERENCES ai_responses(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    platform ai_platform NOT NULL,
    mentioned BOOLEAN DEFAULT false,
    mention_position INTEGER, -- Position in response (1-based)
    prominence_score FLOAT, -- 0-1 score based on position and context
    sentiment VARCHAR(50), -- positive, negative, neutral
    sentiment_score FLOAT, -- -1 to 1
    citation_url TEXT, -- If URL was cited
    context_snippet TEXT, -- Text around the mention
    is_primary_result BOOLEAN DEFAULT false, -- First/main result
    created_at TIMESTAMP DEFAULT NOW()
);

-- Competitors table
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(brand_id, competitor_name)
);

-- Competitor Mentions table
CREATE TABLE competitor_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_response_id UUID NOT NULL REFERENCES ai_responses(id) ON DELETE CASCADE,
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    platform ai_platform NOT NULL,
    mentioned BOOLEAN DEFAULT false,
    mention_position INTEGER,
    prominence_score FLOAT,
    sentiment VARCHAR(50),
    sentiment_score FLOAT,
    citation_url TEXT,
    context_snippet TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Content table (generated or analyzed content)
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    title VARCHAR(500),
    content_text TEXT,
    content_html TEXT,
    content_type VARCHAR(50), -- article, blog, faq, product_description
    target_keywords TEXT[],
    schema_markup JSONB, -- Schema.org JSON-LD
    aeo_score FLOAT, -- Answer Engine Optimization score (0-100)
    optimization_suggestions JSONB,
    generated_by VARCHAR(50), -- ai_generated, user_created, imported
    ai_model_used VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
    published_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics table (aggregated metrics)
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    platform ai_platform NOT NULL,
    total_queries INTEGER DEFAULT 0,
    total_mentions INTEGER DEFAULT 0,
    mention_rate FLOAT, -- Percentage of queries with mentions
    avg_prominence_score FLOAT,
    avg_sentiment_score FLOAT,
    citations_count INTEGER DEFAULT 0,
    primary_results_count INTEGER DEFAULT 0,
    share_of_voice FLOAT, -- vs competitors
    visibility_score FLOAT, -- Composite score (0-100)
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(brand_id, date, platform)
);

-- Competitor Analytics table
CREATE TABLE competitor_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    platform ai_platform NOT NULL,
    total_mentions INTEGER DEFAULT 0,
    mention_rate FLOAT,
    avg_prominence_score FLOAT,
    avg_sentiment_score FLOAT,
    citations_count INTEGER DEFAULT 0,
    visibility_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(competitor_id, date, platform)
);

-- Jobs table (scheduled monitoring jobs)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL, -- monitor_queries, generate_analytics, send_alerts
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    scheduled_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    results JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- visibility_drop, competitor_surge, negative_sentiment
    severity VARCHAR(50) DEFAULT 'info', -- info, warning, critical
    title VARCHAR(500),
    message TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    notified_via_email BOOLEAN DEFAULT false,
    notified_via_webhook BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys table (for user's own AI API keys)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform ai_platform NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    event_types TEXT[], -- alert_created, mention_detected, report_generated
    is_active BOOLEAN DEFAULT true,
    secret_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_queries_brand_id ON queries(brand_id);
CREATE INDEX idx_ai_responses_query_id ON ai_responses(query_id);
CREATE INDEX idx_ai_responses_created_at ON ai_responses(created_at);
CREATE INDEX idx_brand_mentions_brand_id ON brand_mentions(brand_id);
CREATE INDEX idx_brand_mentions_query_id ON brand_mentions(query_id);
CREATE INDEX idx_brand_mentions_platform ON brand_mentions(platform);
CREATE INDEX idx_brand_mentions_created_at ON brand_mentions(created_at);
CREATE INDEX idx_competitors_brand_id ON competitors(brand_id);
CREATE INDEX idx_competitor_mentions_competitor_id ON competitor_mentions(competitor_id);
CREATE INDEX idx_analytics_brand_date ON analytics(brand_id, date);
CREATE INDEX idx_analytics_platform ON analytics(platform);
CREATE INDEX idx_jobs_brand_status ON jobs(brand_id, status);
CREATE INDEX idx_jobs_scheduled_at ON jobs(scheduled_at);
CREATE INDEX idx_alerts_brand_user ON alerts(brand_id, user_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- Full-text search indexes
CREATE INDEX idx_content_title_fts ON content USING GIN(to_tsvector('english', title));
CREATE INDEX idx_content_text_fts ON content USING GIN(to_tsvector('english', content_text));

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queries_updated_at BEFORE UPDATE ON queries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
