"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react"

interface BrandMentionResult {
  platform: string
  query: string
  mentioned: boolean
  prominence_score: number
  sentiment: 'positive' | 'neutral' | 'negative'
  context: string
  response_text: string
  position?: number
}

interface MonitoringRun {
  id: string
  brand_id: string
  brand_name: string
  visibility_score: number
  total_mentions: number
  queries_tested: number
  individual_results?: BrandMentionResult[]
  timestamp: string
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [platform, setPlatform] = useState("all")
  const [loading, setLoading] = useState(true)
  const [monitoringRuns, setMonitoringRuns] = useState<MonitoringRun[]>([])
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMonitoringData()
  }, [])

  async function fetchMonitoringData() {
    try {
      const response = await fetch('/api/monitoring?limit=100')
      const data = await response.json()
      setMonitoringRuns(data.runs || [])
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Calculate current visibility score (average of latest runs)
  const latestRuns = monitoringRuns.slice(0, 5)
  const currentScore = latestRuns.length > 0
    ? Math.round(latestRuns.reduce((sum, run) => sum + run.visibility_score, 0) / latestRuns.length)
    : 0

  // Calculate total mentions
  const totalMentions = latestRuns.reduce((sum, run) => sum + run.total_mentions, 0)

  // No data state
  if (monitoringRuns.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your AI visibility and competitive performance
          </p>
        </div>
        <Card className="border-dashed">
          <CardHeader className="flex flex-col items-center justify-center text-center py-16">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No monitoring data yet</CardTitle>
            <CardDescription className="mb-4">
              Run your first brand monitoring to see analytics
            </CardDescription>
            <Button onClick={() => window.location.href = '/dashboard/brands'}>
              Go to Brands
            </Button>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Group runs by brand to find unique brands
  const brandMap = new Map<string, MonitoringRun[]>()
  monitoringRuns.forEach(run => {
    if (!brandMap.has(run.brand_id)) {
      brandMap.set(run.brand_id, [])
    }
    brandMap.get(run.brand_id)!.push(run)
  })

  // Get brand ranking data
  const brandRankings = Array.from(brandMap.entries()).map(([brandId, runs]) => {
    const latestRun = runs[0]
    const avgVisibility = Math.round(runs.reduce((sum, r) => sum + r.visibility_score, 0) / runs.length)
    const totalMentions = runs.reduce((sum, r) => sum + r.total_mentions, 0)

    return {
      brand: latestRun.brand_name,
      visibility: avgVisibility,
      mentions: totalMentions,
      position: 0, // Will be set after sorting
    }
  }).sort((a, b) => b.visibility - a.visibility)

  // Set positions
  brandRankings.forEach((brand, index) => {
    brand.position = index + 1
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your AI visibility and competitive performance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Visibility Score</CardTitle>
            <CardDescription>Average across all brands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{currentScore}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {monitoringRuns.length} monitoring {monitoringRuns.length === 1 ? 'run' : 'runs'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
            <CardDescription>Across recent monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalMentions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              From {latestRuns.reduce((sum, run) => sum + run.queries_tested, 0)} queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Brands Monitored</CardTitle>
            <CardDescription>Unique brands tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{brandMap.size}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Brand Rankings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Industry Ranking</CardTitle>
            <CardDescription>Brands with highest visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-[40px_1fr_80px_80px_80px] gap-4 text-xs font-medium text-muted-foreground border-b pb-2">
                <div>#</div>
                <div>BRAND</div>
                <div className="text-right">MENTIONS</div>
                <div className="text-right">POSITION</div>
                <div className="text-right">VISIBILITY</div>
              </div>

              {brandRankings.slice(0, 5).map((brand) => (
                <div
                  key={brand.brand}
                  className="grid grid-cols-[40px_1fr_80px_80px_80px] gap-4 items-center text-sm"
                >
                  <div className="font-medium">{brand.position}</div>
                  <div className="font-medium">{brand.brand}</div>
                  <div className="text-right">{brand.mentions}</div>
                  <div className="text-right">{brand.position.toFixed(1)}</div>
                  <div className="text-right font-semibold">{brand.visibility}%</div>
                </div>
              ))}

              {brandRankings.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No brand data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Monitoring Activity</CardTitle>
            <CardDescription>Latest monitoring runs and results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monitoringRuns.slice(0, 10).map((run) => {
                const isExpanded = expandedRuns.has(run.id)
                return (
                  <div key={run.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-muted/30 p-2 rounded" onClick={() => {
                      const newExpanded = new Set(expandedRuns)
                      if (isExpanded) {
                        newExpanded.delete(run.id)
                      } else {
                        newExpanded.add(run.id)
                      }
                      setExpandedRuns(newExpanded)
                    }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{run.brand_name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            ChatGPT
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(run.timestamp).toLocaleString()} • {run.queries_tested} queries
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{run.total_mentions}/{run.queries_tested}</div>
                        <div className="text-xs text-muted-foreground">mentions</div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-lg font-semibold">{run.visibility_score}%</div>
                        <div className="text-xs text-muted-foreground">visibility</div>
                      </div>
                      <div className="ml-4">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    {isExpanded && run.individual_results && (
                      <div className="mt-4 space-y-3 ml-4">
                        {run.individual_results.map((result, idx) => (
                          <div key={idx} className="border-l-2 pl-4 py-2" style={{ borderColor: result.mentioned ? '#10b981' : '#e5e7eb' }}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">{result.query}</p>
                                <div className="flex gap-2 mb-2">
                                  <Badge variant={result.mentioned ? "default" : "secondary"} className="text-xs">
                                    {result.mentioned ? 'Mentioned' : 'Not Mentioned'}
                                  </Badge>
                                  {result.mentioned && (
                                    <>
                                      <Badge variant="outline" className="text-xs">
                                        Prominence: {result.prominence_score}%
                                      </Badge>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {result.sentiment}
                                      </Badge>
                                      {result.position && (
                                        <Badge variant="outline" className="text-xs">
                                          Position: {result.position}
                                        </Badge>
                                      )}
                                    </>
                                  )}
                                </div>
                                {result.mentioned && result.context && (
                                  <div className="bg-muted p-3 rounded text-sm mt-2">
                                    <p className="text-muted-foreground italic">...{result.context}...</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {monitoringRuns.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No monitoring activity yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
