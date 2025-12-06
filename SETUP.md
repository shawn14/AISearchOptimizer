# Setup Guide - AISearchOptimizer

## What We've Built

A fully functional Next.js 14 application with:

- ✅ TypeScript configuration
- ✅ Tailwind CSS 4 styling
- ✅ shadcn/ui component library
- ✅ AI client integrations (OpenAI, Anthropic, Google Gemini)
- ✅ Supabase database client
- ✅ Complete dashboard UI with navigation
- ✅ Working monitoring API endpoint
- ✅ Live demo page for testing

## Quick Start

### 1. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your API keys:

```bash
# Required for AI monitoring
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Required for database (optional for demo)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### 4. Try the Live Demo

Navigate to [http://localhost:3000/demo](http://localhost:3000/demo) to test the AI monitoring functionality in real-time.

**Important:** You MUST have API keys configured in `.env.local` for the demo to work.

## Available Routes

- `/` - Landing page
- `/dashboard` - Main dashboard (with mock data)
- `/dashboard/brands` - Brand management
- `/dashboard/analytics` - Analytics (coming soon)
- `/dashboard/content` - Content optimization (coming soon)
- `/dashboard/settings` - Settings (coming soon)
- `/demo` - **Live demo page to test AI monitoring**
- `/api/monitoring/test` - API endpoint for testing monitoring

## Testing the AI Monitoring

The demo page (`/demo`) allows you to test the core functionality:

1. Enter a query (e.g., "What are the best AI search optimization tools?")
2. Enter your brand name (e.g., "AISearchOptimizer")
3. Optionally enter your domain
4. Click "Run Test"

The system will:
- Query OpenAI (ChatGPT), Anthropic (Claude), and Google (Gemini) in parallel
- Analyze responses for brand mentions
- Calculate prominence scores
- Detect sentiment
- Show cost and token usage

## Next Steps

### Option 1: Set Up Database (For Full Functionality)

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Run the `DATABASE_SCHEMA.sql` file in the SQL Editor
4. Copy your project URL and API keys to `.env.local`
5. Implement data persistence in the dashboard

### Option 2: Continue with Demo Mode

The app currently works with:
- ✅ Live AI monitoring (demo page)
- ✅ Mock dashboard data
- ⚠️ No data persistence

### Option 3: Build Out Features

Refer to `IMPLEMENTATION_PLAN.md` for the full roadmap:

- Phase 1: Foundation (✅ Complete)
- Phase 2: AI Integration (✅ Complete)
- Phase 3: Monitoring Dashboard (✅ UI Complete, needs data)
- Phase 4: Scheduled Monitoring (pending)
- Phase 5: Content Optimization (pending)
- Phase 6: Advanced Features (pending)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard pages
│   │   ├── brands/
│   │   ├── analytics/
│   │   ├── content/
│   │   └── settings/
│   ├── api/
│   │   └── monitoring/test/      # Test API endpoint
│   ├── demo/                     # Live demo page
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── dashboard/                # Dashboard components
├── lib/
│   ├── ai-clients/               # AI API integrations
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── gemini.ts
│   │   └── index.ts
│   ├── supabase.ts
│   └── utils.ts
└── types/
    └── index.ts                  # TypeScript definitions
```

## Cost Considerations

The demo page makes real API calls which cost money:

- **OpenAI GPT-3.5**: ~$0.0005-0.0015 per query
- **Anthropic Claude Haiku**: ~$0.00025-0.00125 per query
- **Google Gemini Flash**: ~$0.000075-0.0003 per query

**Total per test**: ~$0.001-0.003 (less than a penny)

Running 100 tests would cost approximately $0.10-0.30.

## Build for Production

```bash
npm run build
npm run start
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

Build the project and deploy the `.next` folder to any Node.js hosting provider.

## Troubleshooting

### "API key not configured" error

Make sure you've created `.env.local` and added your API keys.

### Build errors

Run `npm install` to ensure all dependencies are installed.

### Demo page shows errors

Check browser console for specific error messages. Most likely cause is missing API keys.

## Documentation

- `CLAUDE.md` - Claude Code guidance for development
- `README.md` - Project overview and market context
- `IMPLEMENTATION_PLAN.md` - Full 12-week implementation roadmap
- `QUICKSTART.md` - Original quick start guide
- `DATABASE_SCHEMA.sql` - Complete PostgreSQL schema

## Support

For issues or questions, review the documentation files or check the Next.js and AI SDK documentation:

- [Next.js Docs](https://nextjs.org/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com)
- [Google Gemini](https://ai.google.dev/docs)
