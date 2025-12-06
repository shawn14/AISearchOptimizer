# QuickStart Guide - AISearchOptimizer

This guide will get you from zero to a working prototype in the shortest time possible.

## Day 1: Project Setup (2-3 hours)

### Step 1: Initialize Next.js Project

```bash
cd ~/Desktop/AISearchOptimizer
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Answer the prompts:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: Yes (@/*)

### Step 2: Install Core Dependencies

```bash
npm install @supabase/supabase-js
npm install openai anthropic @perplexity-ai/sdk @google/generative-ai
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
npm install lucide-react recharts
npm install date-fns zod
npm install swr
npm install next-auth
```

### Step 3: Install Dev Dependencies

```bash
npm install -D @types/node
npm install -D prettier eslint-config-prettier
npm install -D prisma
```

### Step 4: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Name it "aisearchoptimizer"
3. Wait for it to provision (~2 minutes)
4. Go to Project Settings > API
5. Copy your project URL and anon key
6. Go to SQL Editor and paste the contents of `DATABASE_SCHEMA.sql`
7. Run the SQL to create all tables

### Step 5: Create Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI APIs (get these from respective platforms)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
GOOGLE_AI_API_KEY=...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-here

# Redis (optional for now)
REDIS_URL=...
```

### Step 6: Project Structure

Create this folder structure:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── brands/
│   │   ├── analytics/
│   │   ├── content/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── brands/
│   │   ├── queries/
│   │   └── monitoring/
│   └── layout.tsx
├── components/
│   ├── ui/          # shadcn components
│   ├── dashboard/   # dashboard-specific
│   └── shared/      # shared components
├── lib/
│   ├── supabase.ts
│   ├── ai-clients/
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── perplexity.ts
│   │   └── gemini.ts
│   ├── db/          # database helpers
│   └── utils.ts
└── types/
    └── index.ts
```

Create these manually:
```bash
mkdir -p src/components/ui src/components/dashboard src/components/shared
mkdir -p src/lib/ai-clients src/lib/db
mkdir -p src/types
mkdir -p src/app/\(auth\)/login src/app/\(auth\)/signup
mkdir -p src/app/\(dashboard\)/brands src/app/\(dashboard\)/analytics
mkdir -p src/app/api/auth src/app/api/brands src/app/api/queries src/app/api/monitoring
```

### Step 7: Install shadcn/ui

```bash
npx shadcn-ui@latest init
```

Install essential components:
```bash
npx shadcn-ui@latest add button card input label select table badge avatar dropdown-menu
```

---

## Day 2: Core Setup (3-4 hours)

### Step 1: Set Up Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Step 2: Create Type Definitions

Create `src/types/index.ts` with database types.

### Step 3: Set Up Authentication

Use NextAuth.js or Supabase Auth for authentication.

### Step 4: Create Dashboard Layout

Build the basic dashboard shell with navigation.

---

## Day 3-5: AI Integration (6-8 hours)

### Create AI Client Abstractions

1. **OpenAI Client** (`src/lib/ai-clients/openai.ts`)
2. **Anthropic Client** (`src/lib/ai-clients/anthropic.ts`)
3. **Perplexity Client** (`src/lib/ai-clients/perplexity.ts`)
4. **Gemini Client** (`src/lib/ai-clients/gemini.ts`)

Each should have:
- `query(prompt: string): Promise<Response>`
- Error handling
- Rate limiting
- Cost tracking

### Create Unified Interface

Create `src/lib/ai-clients/index.ts`:

```typescript
export type AIResponse = {
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

export async function queryAllPlatforms(
  prompt: string
): Promise<AIResponse[]> {
  // Execute queries in parallel
}
```

### Build API Routes

Create `/api/monitoring/execute` that:
1. Takes a brand ID
2. Fetches all queries for that brand
3. Executes across all platforms
4. Stores responses
5. Parses mentions
6. Returns results

---

## Week 2: Dashboard & Monitoring (10-15 hours)

### Build Core Pages

1. **Brand Management** (`/brands`)
   - List brands
   - Add/edit brand
   - Configure queries

2. **Analytics Dashboard** (`/analytics`)
   - Visibility score cards
   - Platform comparison charts
   - Mention timeline
   - Competitor comparison

3. **Query Management** (`/brands/[id]/queries`)
   - List queries
   - Add/edit queries
   - Test query (run on-demand)

### Set Up Scheduled Jobs

Use Vercel Cron:

Create `src/app/api/cron/monitor/route.ts`:

```typescript
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Fetch all active brands
  // Execute monitoring for each
  // Store results
  // Generate analytics

  return Response.json({ success: true })
}
```

Add to `vercel.json`:

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

---

## Week 3: Content Features (8-10 hours)

### Content Analysis

Build content analyzer that scores:
- Question-based structure
- Answer conciseness
- Schema.org markup
- E-E-A-T signals
- Freshness

### AI Content Generator

Use Claude's structured outputs to generate:
- Articles
- FAQs
- Product descriptions
- Schema.org JSON-LD

---

## Week 4: Polish & Launch (10-12 hours)

### Testing
- Manual testing of all flows
- Test scheduled jobs
- Test API integrations
- Security review

### Documentation
- User guide
- API documentation
- Setup instructions

### Deploy to Production
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create aisearchoptimizer --private
git push -u origin main

# Deploy to Vercel
vercel --prod
```

---

## Minimal Viable Product (MVP) Checklist

### Must Have
- [ ] User authentication
- [ ] Add/manage brands
- [ ] Add/manage queries
- [ ] Execute queries across 3 platforms (ChatGPT, Claude, Perplexity)
- [ ] Store and parse responses
- [ ] Basic analytics dashboard
- [ ] Scheduled monitoring (every 6 hours)
- [ ] Email alerts for major changes

### Nice to Have
- [ ] Competitor tracking
- [ ] Content generation
- [ ] Advanced analytics
- [ ] Export reports
- [ ] Webhook integrations

### Can Wait
- [ ] Gemini and Grok integration
- [ ] A/B testing
- [ ] White-label reports
- [ ] CMS integrations
- [ ] Public API

---

## Cost Estimate for MVP Testing

### API Costs (Monthly)
Assuming 10 brands, 20 queries each, 4 runs per day:
- Total queries per day: 10 brands × 20 queries × 3 platforms × 4 runs = 2,400 queries/day
- Monthly: ~72,000 queries

**OpenAI** (GPT-4):
- Input: ~500 tokens/query = 36M tokens/month = $360
- Output: ~1000 tokens/response = 72M tokens/month = $2,160
- **Total**: ~$2,520/month

**Anthropic** (Claude Sonnet):
- Input: ~500 tokens = 36M tokens = $108
- Output: ~1000 tokens = 72M tokens = $2,160
- **Total**: ~$2,268/month

**Perplexity**:
- $5 per 1,000 requests = $360/month

**Total AI Costs**: ~$5,148/month for heavy usage

### Optimization Strategies
1. Use cheaper models (GPT-3.5, Haiku): Reduce by 70% → ~$1,544/month
2. Reduce frequency to 2x/day: Cut in half → ~$772/month
3. Implement 24hr caching: Further 50% reduction → ~$386/month
4. Start with 1 brand for testing: → ~$39/month

### Recommended Testing Budget
- Start: $50-100/month (1-2 brands, limited queries, GPT-3.5/Haiku)
- Scale up: $200-500/month (5-10 brands, full monitoring)
- Production: $500-2000/month (usage-based, caching, optimization)

---

## Next Steps

1. Run through Day 1 setup
2. Get API keys from all providers
3. Set up Supabase project
4. Initialize Next.js project
5. Start with OpenAI integration first (most straightforward)
6. Build one feature at a time
7. Test thoroughly before moving to next feature

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [shadcn/ui Components](https://ui.shadcn.com)
