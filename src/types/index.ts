// Database types based on DATABASE_SCHEMA.sql

export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'
export type AIPlatform = 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'grok'
export type QueryType = 'brand_mention' | 'competitor_comparison' | 'industry_question'
export type ResponseStatus = 'success' | 'error' | 'rate_limited'
export type Sentiment = 'positive' | 'negative' | 'neutral'
export type ContentType = 'article' | 'blog' | 'faq' | 'product_description'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type JobType = 'monitor_queries' | 'generate_analytics' | 'send_alerts'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'
export type AlertType = 'visibility_drop' | 'competitor_surge' | 'negative_sentiment'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface User {
  id: string
  email: string
  password_hash?: string
  full_name?: string
  company?: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  subscription_ends_at?: Date
  stripe_customer_id?: string
  created_at: Date
  updated_at: Date
}

export interface Brand {
  id: string
  user_id: string
  name: string
  domain?: string
  description?: string
  industry?: string
  target_keywords?: string[]
  brand_voice_profile?: Record<string, any>
  monitoring_enabled: boolean
  created_at: Date
  updated_at: Date
}

export interface Query {
  id: string
  brand_id: string
  query_text: string
  query_type?: QueryType
  category?: string
  priority: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface AIResponse {
  id: string
  query_id: string
  platform: AIPlatform
  response_text: string
  response_metadata?: ResponseMetadata
  execution_time_ms?: number
  error_message?: string
  status: ResponseStatus
  created_at: Date
}

export interface ResponseMetadata {
  model: string
  tokens: number
  cost: number
  responseTime: number
  [key: string]: any
}

export interface BrandMention {
  id: string
  ai_response_id: string
  brand_id: string
  query_id: string
  platform: AIPlatform
  mentioned: boolean
  mention_position?: number
  prominence_score?: number
  sentiment?: Sentiment
  sentiment_score?: number
  citation_url?: string
  context_snippet?: string
  is_primary_result: boolean
  created_at: Date
}

export interface Competitor {
  id: string
  brand_id: string
  competitor_name: string
  competitor_domain?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CompetitorMention {
  id: string
  ai_response_id: string
  competitor_id: string
  query_id: string
  platform: AIPlatform
  mentioned: boolean
  mention_position?: number
  prominence_score?: number
  sentiment?: Sentiment
  sentiment_score?: number
  citation_url?: string
  context_snippet?: string
  created_at: Date
}

export interface Content {
  id: string
  brand_id: string
  title?: string
  content_text?: string
  content_html?: string
  content_type?: ContentType
  target_keywords?: string[]
  schema_markup?: Record<string, any>
  aeo_score?: number
  optimization_suggestions?: Record<string, any>
  generated_by?: string
  ai_model_used?: string
  status: ContentStatus
  published_url?: string
  created_at: Date
  updated_at: Date
}

export interface Analytics {
  id: string
  brand_id: string
  date: Date
  platform: AIPlatform
  total_queries: number
  total_mentions: number
  mention_rate: number
  avg_prominence_score?: number
  avg_sentiment_score?: number
  citations_count: number
  primary_results_count: number
  share_of_voice?: number
  visibility_score?: number
  created_at: Date
}

export interface CompetitorAnalytics {
  id: string
  competitor_id: string
  brand_id: string
  date: Date
  platform: AIPlatform
  total_mentions: number
  mention_rate: number
  avg_prominence_score?: number
  avg_sentiment_score?: number
  citations_count: number
  visibility_score?: number
  created_at: Date
}

export interface Job {
  id: string
  brand_id: string
  job_type: JobType
  status: JobStatus
  scheduled_at: Date
  started_at?: Date
  completed_at?: Date
  error_message?: string
  results?: Record<string, any>
  created_at: Date
}

export interface Alert {
  id: string
  brand_id: string
  user_id: string
  alert_type: AlertType
  severity: AlertSeverity
  title?: string
  message?: string
  metadata?: Record<string, any>
  is_read: boolean
  notified_via_email: boolean
  notified_via_webhook: boolean
  created_at: Date
}

export interface APIKey {
  id: string
  user_id: string
  platform: AIPlatform
  encrypted_api_key: string
  is_active: boolean
  last_used_at?: Date
  created_at: Date
  updated_at: Date
}

export interface Webhook {
  id: string
  user_id: string
  brand_id?: string
  url: string
  event_types: string[]
  is_active: boolean
  secret_key?: string
  created_at: Date
  updated_at: Date
}

// AI Client Response Types
export interface AIClientResponse {
  platform: AIPlatform
  text: string
  citations?: string[]
  metadata: ResponseMetadata
}

export interface QueryExecutionResult {
  query: Query
  responses: AIClientResponse[]
  mentions: BrandMention[]
  competitor_mentions?: CompetitorMention[]
  errors?: string[]
}
