"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function DemoPage() {
  const [query, setQuery] = useState("What are the best AI search optimization tools?")
  const [brandName, setbrandName] = useState("AISearchOptimizer")
  const [brandDomain, setBrandDomain] = useState("aisearchoptimizer.com")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/monitoring/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          brandName,
          brandDomain: brandDomain || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run test')
      }

      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Live Demo</h1>
          <p className="text-muted-foreground">
            Test the AI monitoring functionality in real-time
          </p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Configure your test query and brand details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Query / Prompt</Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are the best..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setbrandName(e.target.value)}
                  placeholder="Your Brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandDomain">Brand Domain (Optional)</Label>
                <Input
                  id="brandDomain"
                  value={brandDomain}
                  onChange={(e) => setBrandDomain(e.target.value)}
                  placeholder="yourbrand.com"
                />
              </div>
            </div>

            <Button onClick={runTest} disabled={loading || !query || !brandName}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Running Test...' : 'Run Test'}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {results && (
          <>
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-2xl font-bold">{results.summary.totalPlatforms}</div>
                    <div className="text-xs text-muted-foreground">Platforms Tested</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{results.summary.totalMentions}</div>
                    <div className="text-xs text-muted-foreground">Brand Mentions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {results.summary.mentionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Mention Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      ${results.summary.totalCost.toFixed(4)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Cost</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Results */}
            {results.results.map((result: any, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize">{result.platform}</CardTitle>
                      <CardDescription>{result.model}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {result.brandMention.mentioned ? (
                        <Badge>Mentioned</Badge>
                      ) : (
                        <Badge variant="secondary">Not Mentioned</Badge>
                      )}
                      {result.brandMention.sentiment && (
                        <Badge
                          variant={
                            result.brandMention.sentiment === 'positive'
                              ? 'default'
                              : result.brandMention.sentiment === 'negative'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {result.brandMention.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.brandMention.mentioned && (
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prominence Score:</span>
                        <span className="font-medium">
                          {(result.brandMention.prominence_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      {result.brandMention.citation_url && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Citation:</span>
                          <span className="font-medium text-blue-600">Yes</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Response:</p>
                    <div className="bg-white p-4 rounded-lg text-sm text-gray-900 border border-gray-300 shadow-sm">
                      {result.responseText}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="ml-2 font-medium">${result.cost.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tokens:</span>
                      <span className="ml-2 font-medium">{result.tokens}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <span className="ml-2 font-medium">{result.responseTime}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
