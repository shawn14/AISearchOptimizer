"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, Sparkles, Loader2, ChevronDown, ChevronUp, TrendingUp, Activity } from "lucide-react"

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

interface PlatformResult {
  platform: string
  mentions: number
  avg_prominence: number
  avg_sentiment_score: number
}

interface MonitoringRun {
  id: string
  brand_id: string
  brand_name: string
  visibility_score: number
  total_mentions: number
  queries_tested: number
  platform_results?: PlatformResult[]
  individual_results?: BrandMentionResult[]
  timestamp: string
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [monitoringRuns, setMonitoringRuns] = useState<MonitoringRun[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
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

  // Get unique brands
  const uniqueBrands = Array.from(new Set(monitoringRuns.map(r => r.brand_id)))
    .map(brandId => {
      const run = monitoringRuns.find(r => r.brand_id === brandId)!
      return { id: brandId, name: run.brand_name }
    })

  // Filter runs by selected brand
  const filteredRuns = selectedBrand === "all"
    ? monitoringRuns
    : monitoringRuns.filter(r => r.brand_id === selectedBrand)

  // Prepare data for visibility trends chart (last 30 runs)
  const visibilityTrendData = filteredRuns
    .slice(0, 30)
    .reverse()
    .map((run, idx) => ({
      name: new Date(run.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visibility: run.visibility_score,
      mentions: run.total_mentions,
      timestamp: run.timestamp,
    }))

  // Calculate platform performance data
  const platformPerformance: Record<string, { mentions: number; queries: number; prominence: number; count: number }> = {}

  filteredRuns.forEach(run => {
    if (run.platform_results) {
      run.platform_results.forEach(platform => {
        if (!platformPerformance[platform.platform]) {
          platformPerformance[platform.platform] = { mentions: 0, queries: 0, prominence: 0, count: 0 }
        }
        platformPerformance[platform.platform].mentions += platform.mentions
        platformPerformance[platform.platform].prominence += platform.avg_prominence
        platformPerformance[platform.platform].count += 1
      })
    }
  })

  const platformChartData = Object.entries(platformPerformance).map(([platform, data]) => ({
    platform,
    mentions: data.mentions,
    avgProminence: Math.round(data.prominence / data.count),
    mentionRate: Math.round((data.mentions / (data.count * 5)) * 100), // Assuming 5 queries per run
  }))

  // Calculate stats
  const latestRuns = filteredRuns.slice(0, 5)
  const currentScore = latestRuns.length > 0
    ? Math.round(latestRuns.reduce((sum, run) => sum + run.visibility_score, 0) / latestRuns.length)
    : 0

  const totalMentions = latestRuns.reduce((sum, run) => sum + run.total_mentions, 0)
  const totalQueries = latestRuns.reduce((sum, run) => sum + run.queries_tested, 0)
  const mentionRate = totalQueries > 0 ? Math.round((totalMentions / totalQueries) * 100) : 0

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

        {/* Brand Filter */}
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {uniqueBrands.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Visibility Score</CardTitle>
            <CardDescription>Average (last 5 runs)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{currentScore}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {filteredRuns.length} total {filteredRuns.length === 1 ? 'run' : 'runs'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
            <CardDescription>Recent monitoring runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalMentions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              From {totalQueries} queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mention Rate</CardTitle>
            <CardDescription>Percentage mentioned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{mentionRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalMentions}/{totalQueries} queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <CardDescription>AI engines monitored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{Object.keys(platformPerformance).length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active platforms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Visibility Trends Over Time */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <CardTitle>Visibility Trends Over Time</CardTitle>
            </div>
            <CardDescription>Historical visibility score and mentions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visibilityTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="visibility"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Visibility Score (%)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="mentions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Mentions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Comparison */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <CardTitle>Platform Performance</CardTitle>
            </div>
            <CardDescription>Mentions by AI platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mentions" fill="#3b82f6" name="Total Mentions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mention Rate by Platform */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <CardTitle>Mention Rate by Platform</CardTitle>
            </div>
            <CardDescription>Percentage of queries with mentions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mentionRate" fill="#10b981" name="Mention Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Query Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Query Performance</CardTitle>
          <CardDescription>Performance metrics for each search query</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              // Aggregate query performance across all filtered runs
              const queryStats: Record<string, {
                query: string
                totalTests: number
                mentions: number
                avgProminence: number
                platforms: Set<string>
              }> = {}

              filteredRuns.forEach(run => {
                if (run.individual_results) {
                  run.individual_results.forEach(result => {
                    if (!queryStats[result.query]) {
                      queryStats[result.query] = {
                        query: result.query,
                        totalTests: 0,
                        mentions: 0,
                        avgProminence: 0,
                        platforms: new Set()
                      }
                    }
                    queryStats[result.query].totalTests++
                    queryStats[result.query].platforms.add(result.platform)
                    if (result.mentioned) {
                      queryStats[result.query].mentions++
                      queryStats[result.query].avgProminence += result.prominence_score
                    }
                  })
                }
              })

              // Calculate averages and sort by mention rate
              const queryList = Object.values(queryStats)
                .map(q => ({
                  ...q,
                  mentionRate: Math.round((q.mentions / q.totalTests) * 100),
                  avgProminence: q.mentions > 0 ? Math.round(q.avgProminence / q.mentions) : 0,
                  platformCount: q.platforms.size
                }))
                .sort((a, b) => b.mentionRate - a.mentionRate)

              return queryList.length > 0 ? queryList.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{q.query}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {q.platformCount} {q.platformCount === 1 ? 'platform' : 'platforms'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {q.totalTests} {q.totalTests === 1 ? 'test' : 'tests'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold">{q.mentionRate}%</div>
                    <div className="text-xs text-muted-foreground">mention rate</div>
                  </div>
                  {q.mentions > 0 && (
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold">{q.avgProminence}%</div>
                      <div className="text-xs text-muted-foreground">avg prominence</div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  No query data available
                </div>
              )
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Monitoring Activity</CardTitle>
          <CardDescription>Latest monitoring runs and detailed results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRuns.slice(0, 10).map((run) => {
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
                        {run.platform_results && (
                          <div className="flex gap-1">
                            {run.platform_results.slice(0, 3).map((p, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {p.platform}
                              </Badge>
                            ))}
                            {run.platform_results.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{run.platform_results.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
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
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {result.platform}
                                </Badge>
                                <p className="text-sm font-medium">{result.query}</p>
                              </div>
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

            {filteredRuns.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No monitoring activity for selected brand
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
