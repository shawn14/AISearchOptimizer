import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Target, Sparkles, TrendingUp, Users, Zap, FileText, Search } from "lucide-react";
import type { Metadata } from "next";
import { DashboardTabs } from "@/components/home/dashboard-tabs";
import { InteractiveDemo } from "@/components/home/interactive-demo";
import { HeroSection } from "@/components/home/hero-section";

export const metadata: Metadata = {
  title: "RevIntel - AI Search Intelligence & Answer Engine Optimization Platform",
  description: "Monitor and optimize your brand's visibility across ChatGPT, Claude, Perplexity, and Gemini. Track mentions, analyze citations, monitor competitors, and improve your Answer Engine Optimization (AEO) with AI-powered insights.",
  keywords: [
    "AI search optimization",
    "Answer Engine Optimization",
    "AEO platform",
    "ChatGPT visibility tracking",
    "Claude AI monitoring",
    "Perplexity optimization",
    "Gemini AI search",
    "brand mention tracking",
    "AI citation analysis",
    "competitor intelligence",
    "generative engine optimization",
    "GEO",
    "LLM optimization"
  ],
  openGraph: {
    title: "RevIntel - AI Search Intelligence Platform",
    description: "Monitor your brand's visibility across ChatGPT, Claude, Perplexity, and Gemini. Get AI-powered recommendations to improve your Answer Engine Optimization.",
    type: "website",
    url: "https://revintel.ai",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RevIntel Dashboard - AI Search Intelligence Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "RevIntel - AI Search Intelligence Platform",
    description: "Monitor your brand's visibility across ChatGPT, Claude, Perplexity, and Gemini.",
    images: ["/twitter-image.png"]
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-900 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-lg text-gray-900">RevIntel</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Features</Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Pricing</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Resources</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/signin" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition">Login</Link>
              <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 h-10">
                <Link href="/signup">Start for free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Dashboard Preview - Tabs Section */}
      <DashboardTabs />

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Own the top spot in every AI answer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Monitor your rankings, optimize for AI engines, and beat competitors in ChatGPT, Google AI Overview, and Perplexity results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Your AI Rankings</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                See exactly where you rank when AI engines answer questions about your industry. Know when you're #1, #3, or not mentioned at all
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full" />
                  <span>Ranking position tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full" />
                  <span>Google AI Overview monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-orange-500 rounded-full" />
                  <span>ChatGPT & Perplexity tracking</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Beat Your Competitors</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                See who ranks above you, analyze their content strategy, and discover exactly what it takes to outrank them in AI results
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Competitor ranking comparison</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Share of AI recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Gap analysis & opportunities</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Optimize to Rank #1</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get AI-powered recommendations on exactly what to change in your content to climb the rankings and become the recommended answer
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Content optimization playbooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Schema markup suggestions</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>AI-friendly formatting tips</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-500 mb-8">THE AI SEARCH RACE IS ON</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">8 billion</div>
                <div className="text-sm text-gray-600">ChatGPT queries per month</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">60%</div>
                <div className="text-sm text-gray-600">of searches use Google AI Overview</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">500M</div>
                <div className="text-sm text-gray-600">Perplexity searches per year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your competitors are already ranking. Are you?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Every day you're not #1 in AI search results, you're losing customers to brands that are
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white hover:bg-gray-100 text-gray-900 rounded-full px-8 h-12 text-base font-medium shadow-lg" asChild>
              <Link href="/signup">
                Check your AI rankings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full px-8 h-12 text-base font-medium" asChild>
              <Link href="#demo">See a Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-6">Free trial • No credit card • See results in 5 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-gray-900 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="font-semibold text-gray-900">RevIntel</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                The AI Search Intelligence Platform for modern brands
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="/features" className="hover:text-gray-900 transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-gray-900 transition">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-gray-900 transition">Dashboard</Link></li>
                <li><Link href="/integrations" className="hover:text-gray-900 transition">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-gray-900 transition">About</Link></li>
                <li><Link href="/blog" className="hover:text-gray-900 transition">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-gray-900 transition">Careers</Link></li>
                <li><Link href="/press" className="hover:text-gray-900 transition">Press Kit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="/documentation" className="hover:text-gray-900 transition">Documentation</Link></li>
                <li><Link href="/help" className="hover:text-gray-900 transition">Help Center</Link></li>
                <li><Link href="/api-reference" className="hover:text-gray-900 transition">API Reference</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2025 RevIntel. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900 transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-900 transition">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* FAQ Schema for LLMs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Answer Engine Optimization (AEO)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Answer Engine Optimization (AEO) is the practice of optimizing your content to be easily discovered, understood, and cited by AI-powered search engines like ChatGPT, Claude, Perplexity, and Gemini. Unlike traditional SEO which focuses on ranking in search results, AEO focuses on being mentioned and cited in AI-generated responses."
                }
              },
              {
                "@type": "Question",
                "name": "Which AI search engines does RevIntel monitor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "RevIntel monitors your brand's visibility across the four major AI-powered search engines: ChatGPT by OpenAI, Claude by Anthropic, Perplexity AI, and Google Gemini. We track mentions, citations, and sentiment across all these platforms."
                }
              },
              {
                "@type": "Question",
                "name": "How does RevIntel track brand mentions in AI responses?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "RevIntel continuously queries AI search engines with relevant search terms related to your industry and brand. We analyze the responses to identify brand mentions, track citation frequency, analyze sentiment (positive, neutral, negative), and monitor your visibility score over time. Our AI agent provides detailed analytics and actionable recommendations."
                }
              },
              {
                "@type": "Question",
                "name": "What is a visibility score in RevIntel?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The visibility score is a metric from 0-100 that measures how frequently your brand is mentioned in AI-generated responses across different queries. A higher score indicates better visibility. The score factors in mention frequency, citation quality, position in responses, and sentiment analysis."
                }
              },
              {
                "@type": "Question",
                "name": "How can I improve my AEO score?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To improve your AEO score: 1) Add structured data (FAQ schema, Article schema) to your pages, 2) Create comprehensive, authoritative content with citations, 3) Use semantic HTML5 elements, 4) Add Q&A format content matching common queries, 5) Increase content depth (1000+ words), 6) Include data visualizations and original research, and 7) Build authoritative backlinks from .edu and .gov domains. RevIntel provides personalized recommendations based on your audit results."
                }
              },
              {
                "@type": "Question",
                "name": "Does RevIntel integrate with Google Analytics?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, RevIntel integrates with Google Analytics to show you how your AI search visibility correlates with actual website traffic. You can see traffic trends, top pages by visitors, and understand the real-world impact of your AEO efforts."
                }
              },
              {
                "@type": "Question",
                "name": "What is competitor tracking in RevIntel?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "RevIntel's competitor tracking feature allows you to monitor how your competitors are performing in AI search results. You can see side-by-side comparisons of visibility scores, share of voice, mention frequency, and positioning across different AI platforms. This helps you identify gaps and opportunities in your AEO strategy."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I monitor my AI search visibility?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We recommend running monitoring checks at least weekly to track trends and identify changes quickly. RevIntel makes it easy to schedule regular monitoring runs and provides alerts when significant changes occur in your visibility scores or brand mentions."
                }
              }
            ]
          })
        }}
      />

      {/* Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "RevIntel",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web-based",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "priceValidUntil": "2025-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127"
            },
            "description": "RevIntel is an AI Search Intelligence Platform that helps businesses monitor and optimize their visibility across AI-powered search engines including ChatGPT, Claude, Perplexity, and Gemini.",
            "featureList": [
              "AI Search Monitoring",
              "Brand Mention Tracking",
              "Citation Analysis",
              "Competitor Intelligence",
              "AEO Score Analysis",
              "AI-Powered Recommendations",
              "Real-time Visibility Metrics",
              "Google Analytics Integration"
            ]
          })
        }}
      />
    </div>
  );
}
