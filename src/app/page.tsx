import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Target, Sparkles, TrendingUp, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-lg text-gray-900">RevIntel</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/signin" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/signup">Start for free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary">
              <Zap className="h-4 w-4" />
              <span>AI Search Intelligence Platform</span>
            </div>
            <h1 className="text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Dominate AI search.<br />
              Track every mention.
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              RevIntel monitors your brand's visibility across ChatGPT, Claude, Perplexity, and Gemini.
              Track mentions, analyze sentiment, and optimize your content for AI search engines.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base" asChild>
                <Link href="/signup">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-12 text-base" asChild>
                <Link href="#demo">Watch demo</Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500">No credit card required • 7-day free trial</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">5+</div>
              <div className="text-sm text-gray-600">AI Platforms</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">65%</div>
              <div className="text-sm text-gray-600">Zero-click searches</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">3x</div>
              <div className="text-sm text-gray-600">AI search growth</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-sm text-gray-600">Real-time tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to win in AI search</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track visibility, optimize content, and outrank competitors across all major AI platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Brand Monitoring</h3>
              <p className="text-gray-600 mb-4">
                Track your brand mentions across ChatGPT, Claude, Perplexity, and Gemini in real-time
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Real-time visibility scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Sentiment analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Historical trend tracking</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics & Insights</h3>
              <p className="text-gray-600 mb-4">
                Deep analytics on your AI search performance with actionable recommendations
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Share of voice metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Competitor benchmarking</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Performance reports</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Optimization</h3>
              <p className="text-gray-600 mb-4">
                AI-powered content analysis and optimization for maximum AI search visibility
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>AEO scoring & recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Content generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>Technical SEO audits</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to dominate AI search?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join leading brands who are already winning in the AI search era
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white hover:bg-gray-100 text-gray-900 px-8 h-12 text-base" asChild>
              <Link href="/signup">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 h-12 text-base" asChild>
              <Link href="#demo">Schedule demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-bold text-xs">R</span>
                </div>
                <span className="font-bold text-gray-900">RevIntel</span>
              </div>
              <p className="text-sm text-gray-600">
                AI Search Intelligence Platform for modern brands
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-gray-900">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-gray-900">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">About</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Blog</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">Documentation</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Support</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-600">
            <p>© 2025 RevIntel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
