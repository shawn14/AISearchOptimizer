import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Integrations - RevIntel",
  description: "Connect RevIntel with your favorite tools and platforms",
}

const integrations = [
  {
    name: "ChatGPT",
    description: "Monitor your brand visibility in ChatGPT responses",
    status: "Active",
    category: "AI Platforms",
  },
  {
    name: "Claude",
    description: "Track mentions in Anthropic's Claude AI assistant",
    status: "Active",
    category: "AI Platforms",
  },
  {
    name: "Perplexity",
    description: "Analyze your presence in Perplexity search results",
    status: "Active",
    category: "AI Platforms",
  },
  {
    name: "Google Gemini",
    description: "Monitor Google's Gemini AI platform",
    status: "Active",
    category: "AI Platforms",
  },
  {
    name: "Grok",
    description: "Track visibility in X's Grok AI assistant",
    status: "Active",
    category: "AI Platforms",
  },
  {
    name: "Google Analytics",
    description: "Connect your analytics data for deeper insights",
    status: "Coming Soon",
    category: "Analytics",
  },
  {
    name: "Slack",
    description: "Get instant notifications in your Slack workspace",
    status: "Coming Soon",
    category: "Communication",
  },
  {
    name: "Zapier",
    description: "Connect to 5,000+ apps with Zapier integration",
    status: "Coming Soon",
    category: "Automation",
  },
]

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Integrations</h1>
            <p className="text-xl text-muted-foreground">
              Connect RevIntel with your favorite tools and platforms
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">AI Platforms</h2>
            <p className="text-muted-foreground">Monitor your brand across all major AI search engines</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {integrations
              .filter(i => i.category === "AI Platforms")
              .map((integration, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle>{integration.name}</CardTitle>
                      <Badge variant={integration.status === "Active" ? "default" : "secondary"}>
                        {integration.status}
                      </Badge>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">More integrations are on the way</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations
              .filter(i => i.status === "Coming Soon")
              .map((integration, index) => (
                <Card key={index} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle>{integration.name}</CardTitle>
                      <Badge variant="secondary">{integration.status}</Badge>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a custom integration?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Contact us to discuss custom integrations for your enterprise needs
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
