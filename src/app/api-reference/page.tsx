import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "API Reference - RevIntel",
  description: "Complete API documentation for developers",
}

const endpoints = [
  {
    method: "GET",
    path: "/api/brands",
    description: "List all brands for the authenticated user",
  },
  {
    method: "POST",
    path: "/api/brands",
    description: "Create a new brand to monitor",
  },
  {
    method: "GET",
    path: "/api/monitoring",
    description: "Get monitoring run history and results",
  },
  {
    method: "POST",
    path: "/api/monitor",
    description: "Start a new monitoring run",
  },
  {
    method: "GET",
    path: "/api/competitors",
    description: "Get competitor analysis data",
  },
  {
    method: "GET",
    path: "/api/knowledge",
    description: "List knowledge base articles",
  },
  {
    method: "POST",
    path: "/api/knowledge/scrape",
    description: "Scrape a URL and add to knowledge base",
  },
]

export default function APIReferencePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">API Reference</h1>
            <p className="text-xl text-muted-foreground">
              Complete REST API documentation for developers
            </p>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Authentication</h2>
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  All API requests require authentication using your API key
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.revintel.io/api/brands`}</code>
                </pre>
                <p className="mt-4 text-sm text-muted-foreground">
                  You can generate API keys in your{" "}
                  <Link href="/dashboard/settings" className="text-primary hover:underline">
                    dashboard settings
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>

            <h2 className="text-3xl font-bold mb-6">Endpoints</h2>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant={endpoint.method === "GET" ? "default" : "secondary"}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="mt-12">
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Free: 100 requests/day</li>
                  <li>• Professional: 1,000 requests/day</li>
                  <li>• Enterprise: Custom limits</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
