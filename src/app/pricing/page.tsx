import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-gray-900" />
              <span className="font-semibold text-lg text-gray-900">AISearchOptimizer</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-sm text-gray-900 font-medium">Pricing</Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
              <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
                <Link href="/dashboard">Start for free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your business. All plans include a 7-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="border border-gray-200 rounded-2xl p-8 bg-white hover:shadow-xl transition-shadow">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Starter</h3>
                <p className="text-sm text-gray-600 mb-6">Perfect for individuals and small teams</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <Button className="w-full mb-8 bg-gray-900 hover:bg-gray-800" asChild>
                <Link href="/dashboard">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Up to 5 brands</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">100 queries per month</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">3 AI platforms</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Basic analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Email support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Weekly reports</span>
                </div>
              </div>
            </div>

            {/* Professional Plan - Featured */}
            <div className="border-2 border-gray-900 rounded-2xl p-8 bg-white shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most popular
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional</h3>
                <p className="text-sm text-gray-600 mb-6">Best for growing businesses</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$149</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <Button className="w-full mb-8 bg-gray-900 hover:bg-gray-800" asChild>
                <Link href="/dashboard">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Up to 20 brands</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">500 queries per month</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">5 AI platforms</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Priority support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Daily reports</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Competitor tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Custom reports</span>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-gray-200 rounded-2xl p-8 bg-white hover:shadow-xl transition-shadow">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-sm text-gray-600 mb-6">For large organizations</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">Custom</span>
                </div>
              </div>

              <Button className="w-full mb-8" variant="outline" asChild>
                <Link href="#contact">Contact sales</Link>
              </Button>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Unlimited brands</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Unlimited queries</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">All AI platforms</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Enterprise analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Dedicated support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Real-time reports</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">API access</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">Custom integrations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">SLA guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently asked questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What platforms do you track?</h3>
              <p className="text-gray-600">
                We track your brand visibility across ChatGPT, Claude, Perplexity, Google AI, and Gemini.
                Enterprise plans include access to additional emerging AI platforms.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in the free trial?</h3>
              <p className="text-gray-600">
                All plans include a 7-day free trial with full access to all features. No credit card required to start.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How does billing work?</h3>
              <p className="text-gray-600">
                We bill monthly or annually (save 20% with annual billing). All plans are billed in advance and you can cancel anytime.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Start optimizing your AI search presence today
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join hundreds of brands already winning in AI search
          </p>
          <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 h-12 text-base" asChild>
            <Link href="/dashboard">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-gray-900" />
                <span className="font-semibold text-gray-900">AISearchOptimizer</span>
              </div>
              <p className="text-sm text-gray-600">
                The AI search visibility platform for modern brands
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/#features" className="hover:text-gray-900">Features</Link></li>
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
            <p>© 2025 AISearchOptimizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
