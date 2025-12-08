# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AISearchOptimizer** is an AI Search Optimization (AEO) platform that tracks brand visibility across AI-powered search engines (ChatGPT, Claude, Perplexity, Google AI, Gemini). It monitors brand mentions, analyzes competitor visibility, generates AI-optimized content, and provides actionable insights for improving AI search presence.

**Current Status**: Planning phase - no code implementation yet. Database schema and detailed implementation plan are complete.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with TypeScript, App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Data Fetching**: SWR for client-side data fetching
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React

### Backend
- **Primary**: Next.js API Routes (serverless)
- **Database**: PostgreSQL (Supabase or Neon recommended)
- **Cache**: Redis (Upstash for serverless)
- **Authentication**: NextAuth.js or Supabase Auth
- **Job Scheduling**: Vercel Cron or Inngest

### AI Integration
- **OpenAI API**: GPT-4/GPT-3.5 for ChatGPT monitoring
- **Anthropic API**: Claude Sonnet/Haiku for content generation and monitoring
- **Perplexity API**: Sonar models for search monitoring
- **Google Gemini API**: For Google AI monitoring
- Multiple AI APIs are queried in parallel for each monitoring query

### Deployment
- **Hosting**: Vercel (recommended for Next.js + serverless)
- **Monitoring**: Sentry for errors, PostHog for analytics
- **CI/CD**: GitHub Actions

## Key Commands (When Implemented)

### Development
```bash
npm run dev          # Start Next.js development server on localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests (when implemented)
```

### Database
```bash
# Initialize Supabase database with schema
# Execute DATABASE_SCHEMA.sql in Supabase SQL Editor

# For local PostgreSQL development
psql -U postgres -d aisearchoptimizer -f DATABASE_SCHEMA.sql
```

### Project Setup (First Time)
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install @supabase/supabase-js openai anthropic @google/generative-ai
npm install @radix-ui/react-* lucide-react recharts date-fns zod swr next-auth
npm install -D prettier eslint-config-prettier prisma
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select table badge avatar dropdown-menu
```

## Architecture Overview

### Database Schema
The PostgreSQL schema (`DATABASE_SCHEMA.sql`) consists of 13 core tables:

**Core Entities**:
- `users`: User accounts with subscription tiers (free/pro/business/enterprise)
- `brands`: Brands being monitored (name, domain, keywords, brand voice profile)
- `queries`: Monitoring prompts/questions to test across AI platforms
- `competitors`: Competitor brands to track alongside primary brands

**AI Response Storage**:
- `ai_responses`: Raw responses from AI platforms (ChatGPT, Claude, Perplexity, Gemini)
- `brand_mentions`: Parsed brand mentions from responses with prominence scores
- `competitor_mentions`: Competitor mentions with positioning and sentiment

**Content & Analytics**:
- `content`: Generated or analyzed content with AEO scores and schema markup
- `analytics`: Daily aggregated metrics per brand/platform (visibility scores, mention rates)
- `competitor_analytics`: Daily competitor metrics for benchmarking

**Automation**:
- `jobs`: Scheduled monitoring jobs with status tracking
- `alerts`: User notifications for visibility changes, competitor surges, etc.
- `webhooks`: Webhook configurations for external integrations
- `api_keys`: User-provided AI API keys (encrypted storage)

### Planned Directory Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication routes (login, signup)
│   ├── (dashboard)/         # Main dashboard routes
│   │   ├── brands/          # Brand management
│   │   ├── analytics/       # Analytics and charts
│   │   ├── content/         # Content optimization
│   │   └── settings/        # User settings
│   ├── api/
│   │   ├── auth/            # Auth endpoints
│   │   ├── brands/          # Brand CRUD operations
│   │   ├── queries/         # Query management and execution
│   │   ├── monitoring/      # Execute monitoring across AI platforms
│   │   └── cron/            # Scheduled job endpoints
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard-specific components
│   └── shared/              # Reusable shared components
├── lib/
│   ├── ai-clients/          # AI API client abstractions
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── perplexity.ts
│   │   ├── gemini.ts
│   │   └── index.ts        # Unified interface for all platforms
│   ├── db/                  # Database helper functions
│   ├── supabase.ts          # Supabase client configuration
│   └── utils.ts             # Utility functions
└── types/
    └── index.ts             # TypeScript type definitions
```

## Core System Flows

### 1. AI Monitoring Flow
1. Scheduled job (Vercel Cron) triggers `/api/cron/monitor`
2. Fetch all active brands and their queries from database
3. For each query, execute in parallel across all AI platforms (ChatGPT, Claude, Perplexity, Gemini)
4. Store raw responses in `ai_responses` table
5. Parse responses for brand/competitor mentions using NLP
6. Calculate prominence scores (position in response, context, citations)
7. Store parsed mentions in `brand_mentions` and `competitor_mentions`
8. Generate daily analytics aggregates in `analytics` table
9. Check for alert conditions (visibility drops, competitor surges)
10. Send notifications via email/webhooks if alerts triggered

### 2. Content Optimization Flow
1. User provides content (URL or paste text)
2. Extract structured data and analyze AEO factors:
   - Question-based structure
   - Answer conciseness
   - Schema.org markup presence
   - E-E-A-T signals (expertise, authority, trustworthiness)
   - Freshness indicators
3. Generate optimization score (0-100)
4. Use Claude API to generate:
   - AI-optimized content variations
   - Schema.org JSON-LD structured data
   - Content gap suggestions
5. Store generated content in `content` table

### 3. Analytics Calculation
Visibility scores are composite metrics calculated from:
- **Mention Rate**: Percentage of queries where brand is mentioned
- **Prominence Score**: Average position/prominence in responses (0-1)
- **Citation Count**: Number of times brand URLs are cited
- **Primary Results**: Count of times brand is the main/first result
- **Sentiment Score**: Average sentiment (-1 to 1)
- **Share of Voice**: Brand mentions vs competitor mentions

## Important Implementation Notes

### CRITICAL: NO FAKE DATA POLICY
**NEVER use fake, mock, simulated, or placeholder data in this application.**

This is a fundamental rule that must be followed at all times:
- ❌ NO hardcoded sample data in API responses
- ❌ NO simulated metrics or calculated fake values
- ❌ NO placeholder data for demonstrations
- ❌ NO mock timestamps or fabricated numbers
- ✅ ONLY use real data from actual monitoring runs, database queries, or API integrations
- ✅ If no real data exists, display empty states with helpful messaging
- ✅ When building new features, connect to real data sources immediately

**Why this matters:**
- This platform provides business intelligence for brand visibility
- Users make strategic decisions based on our analytics
- Fake data destroys trust and credibility
- Mock data can accidentally ship to production

**Examples of violations:**
- Showing "2m 34s" average time on page for all platforms (web analytics concepts don't apply to AI mentions)
- Hardcoded bounce rates like "42.5%" across all entries
- Sample data arrays with fabricated values
- Simulated trend data that doesn't reflect actual database state

**If you're tempted to use fake data, STOP and instead:**
1. Connect to the real data source (monitoring runs, Firebase, Google Analytics)
2. Show an empty state if no data exists yet
3. Add helpful messaging explaining how to generate real data

### AI API Integration
- **Parallel Execution**: Query all AI platforms simultaneously to reduce latency
- **Rate Limiting**: Implement per-platform rate limits with exponential backoff
- **Cost Tracking**: Track tokens and costs per API call in `response_metadata` JSONB
- **Caching**: Use Redis with 24-hour TTL to avoid redundant queries
- **Error Handling**: Graceful degradation if one platform fails
- **Model Selection**: Use cheaper models (GPT-3.5, Claude Haiku) where possible

### Mention Parsing Strategy
- Use regex + NLP (basic keyword matching initially, can enhance with embeddings)
- Calculate prominence based on:
  - Position in response (earlier = higher score)
  - Sentence context (primary subject vs passing mention)
  - Citation presence (linked = higher score)
- Sentiment analysis using lightweight models or keyword-based initially

### Cost Optimization
Per QUICKSTART.md cost estimates, production costs can be high:
- Heavy usage: ~$5,148/month for AI APIs
- Optimizations:
  - Use GPT-3.5/Claude Haiku instead of premium models (70% cost reduction)
  - Implement aggressive caching (50% reduction)
  - Reduce monitoring frequency (2x/day vs 4x/day)
  - Start with 1-2 brands for testing (~$39-50/month)

### Subscription Tier Limits
Enforce limits in API routes:
- **Free**: 1 brand, 10 queries, daily monitoring
- **Pro**: 5 brands, 50 queries, 6-hour monitoring
- **Business**: 20 brands, unlimited queries, hourly monitoring
- **Enterprise**: Unlimited everything

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
GOOGLE_AI_API_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
REDIS_URL=
CRON_SECRET=
STRIPE_SECRET_KEY=
```

## Development Workflow

### Phase-by-Phase Implementation
Follow the 12-week plan in `IMPLEMENTATION_PLAN.md`:
1. **Week 1-2**: Project setup, database, authentication
2. **Week 3-4**: AI API integration and query engine
3. **Week 5-6**: Dashboard UI and analytics
4. **Week 7**: Scheduled monitoring and alerts
5. **Week 8-9**: Content optimization features
6. **Week 10-11**: Advanced features (competitor tracking, reporting)
7. **Week 12**: Polish and launch

### Building AI Client Abstractions
Each AI client (`lib/ai-clients/*.ts`) should export:
```typescript
export interface AIResponse {
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'gemini'
  text: string
  citations?: string[]
  metadata: {
    model: string
    tokens: number
    cost: number
    responseTime: number
  }
}

export async function query(prompt: string): Promise<AIResponse>
```

### Scheduled Jobs with Vercel Cron
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/monitor",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Verify cron secret in API route to prevent unauthorized access.

## Testing Strategy

### Critical Test Areas
- AI API client reliability (rate limits, retries, error handling)
- Mention parsing accuracy (test with known responses)
- Analytics calculation correctness (visibility scores, trends)
- Scheduled job execution (use Vercel Cron logs)
- Cost tracking accuracy (monitor actual API usage vs estimates)

### Manual Testing Checklist
- Create brand → add queries → execute manually → verify responses stored
- Check mention detection accuracy across different response formats
- Verify competitor comparisons show correct relative rankings
- Test alert triggers for various conditions
- Validate analytics charts reflect actual data

## Security Considerations

- API keys stored in environment variables, never in code
- User-provided API keys encrypted in `api_keys` table
- Rate limiting on all public API endpoints
- Cron endpoints protected with secret token verification
- Subscription tier limits enforced server-side
- SQL injection protection via parameterized queries
- CORS configured for API routes

## Related Documentation

- `README.md`: Project overview and market context
- `IMPLEMENTATION_PLAN.md`: Detailed 12-week implementation roadmap
- `QUICKSTART.md`: Step-by-step setup guide with commands
- `DATABASE_SCHEMA.sql`: Complete PostgreSQL schema with indexes

## Key Design Decisions

### Why Multiple AI Platforms?
Users want comprehensive coverage - a brand might rank well in ChatGPT but poorly in Claude. Each platform has unique training data and behaviors.

### Why Serverless Architecture?
- Vercel/Supabase auto-scales with usage
- Pay-per-use pricing during development
- No server management overhead
- Built-in global CDN

### Why PostgreSQL over NoSQL?
- Complex relational queries for analytics (joins across brands/competitors/mentions)
- Strong consistency for billing/subscription data
- Full-text search capability with GIN indexes
- JSONB columns provide flexibility where needed (metadata, configurations)

### Why Aggressive Caching?
AI API costs are the primary expense. 24-hour cache TTL means repeated queries don't incur new costs while still providing daily freshness.
