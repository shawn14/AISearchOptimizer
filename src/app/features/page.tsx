import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Brain,
  Target,
  MessageSquare,
  BookOpen
} from "lucide-react"

export const metadata: Metadata = {
  title: "Features - RevIntel",
  description: "Comprehensive AI search intelligence features to boost your brand visibility across AI platforms",
}

const features = [
  {
    icon: Search,
    title: "AI Search Monitoring",
    description: "Track how your brand appears in ChatGPT, Claude, Perplexity, and other AI search engines in real-time.",
  },
  {
    icon: TrendingUp,
    title: "Visibility Analytics",
    description: "Get detailed insights into your brand's visibility across different AI platforms and queries.",
  },
  {
    icon: Users,
    title: "Competitor Analysis",
    description: "See which competitors appear alongside your brand and identify opportunities to stand out.",
  },
  {
    icon: FileText,
    title: "Knowledge Base Management",
    description: "Centralize your brand information with URL scraping and auto-categorization for AI training.",
  },
  {
    icon: BarChart3,
    title: "Citation Tracking",
    description: "Monitor when and where your brand is cited in AI responses across platforms.",
  },
  {
    icon: Zap,
    title: "Automated Monitoring",
    description: "Set up automated monitoring runs to track your visibility over time without manual work.",
  },
  {
    icon: Shield,
    title: "Brand Protection",
    description: "Get alerts when your brand is mentioned incorrectly or in negative contexts.",
  },
  {
    icon: Globe,
    title: "Multi-Platform Support",
    description: "Monitor ChatGPT, Claude, Perplexity, Gemini, and Grok all from one dashboard.",
  },
  {
    icon: Brain,
    title: "Smart Recommendations",
    description: "Get AI-powered suggestions to improve your brand's visibility in AI search results.",
  },
  {
    icon: Target,
    title: "Query Optimization",
    description: "Identify high-value queries where your brand should appear but doesn't.",
  },
  {
    icon: MessageSquare,
    title: "Content Generation",
    description: "Generate AI-optimized content that increases your chances of being cited.",
  },
  {
    icon: BookOpen,
    title: "Detailed Reports",
    description: "Export comprehensive reports for stakeholders with all your visibility metrics.",
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Everything you need to dominate AI search
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Monitor, optimize, and grow your brand's visibility across all major AI platforms
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demo">Watch Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start monitoring your brand's AI visibility today
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
