import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            AISearchOptimizer
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your brand's visibility across AI-powered search engines like ChatGPT, Claude, Perplexity, and Gemini
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>AI Visibility Monitoring</CardTitle>
              <CardDescription>
                Track brand mentions across ChatGPT, Claude, Perplexity, Google AI, and Gemini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Monitor competitor visibility</li>
                <li>Track citation prominence</li>
                <li>Historical trend analysis</li>
                <li>Sentiment analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Optimization</CardTitle>
              <CardDescription>
                AI-powered content generation with brand voice consistency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Answer Engine Optimization (AEO) scoring</li>
                <li>Schema.org structured data generation</li>
                <li>Content gap analysis</li>
                <li>Automated recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competitive Intelligence</CardTitle>
              <CardDescription>
                Benchmark against competitors and track market share
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Share of voice analysis</li>
                <li>Competitor visibility tracking</li>
                <li>Strategy insights</li>
                <li>Automated benchmarking reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Supported Platforms</CardDescription>
              <CardTitle className="text-4xl">5</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Searches Without Clicks</CardDescription>
              <CardTitle className="text-4xl">65%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>AI Search Growth</CardDescription>
              <CardTitle className="text-4xl">3x</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Conversion Rate Increase</CardDescription>
              <CardTitle className="text-4xl">9x</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to optimize your AI search presence?</CardTitle>
              <CardDescription>
                Start tracking your brand visibility across AI platforms today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full" asChild>
                <Link href="/dashboard">Start Free Trial</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 AISearchOptimizer. Built by Shawn Carpenter.</p>
        </div>
      </footer>
    </div>
  );
}
