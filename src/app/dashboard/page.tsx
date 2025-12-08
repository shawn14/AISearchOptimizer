"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Activity, Target, Loader2, Sparkles, Users, MousePointer, BarChart3, Eye, Play, Star, Brain, MessageSquare, Search, Zap, RefreshCw, Lightbulb, AlertTriangle, CheckCircle, Settings } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Area, AreaChart } from 'recharts'

interface MonitoringRun {
  id: string
  brand_id: string
  brand_name: string
  visibility_score: number
  total_mentions: number
  queries_tested: number
  individual_results?: any[]
  timestamp: string
}

interface PageAudit {
  id: string
  page_url: string
  page_title: string | null
  technical_score: number | null
  content_score: number | null
  aeo_score: number | null
  last_audited_at: string | null
}

interface Brand {
  id: string
  name: string
  is_primary?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [monitoringRuns, setMonitoringRuns] = useState<MonitoringRun[]>([])
  const [audits, setAudits] = useState<PageAudit[]>([])
  const [gaData, setGaData] = useState<any>(null)
  const [gaConnected, setGaConnected] = useState(false)
  const [monitoring, setMonitoring] = useState(false)
  const [monitoringStatus, setMonitoringStatus] = useState<string | null>(null)
  const [primaryBrand, setPrimaryBrand] = useState<Brand | null>(null)
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  const [generatingInsights, setGeneratingInsights] = useState(false)

  useEffect(() => {
    fetchData()
    checkGAConnection()
    fetchPrimaryBrand()
    loadCachedInsights()
  }, [])

  // Load cached insights from Firestore on mount
  async function loadCachedInsights() {
    try {
      const response = await fetch('/api/insights')
      if (response.ok) {
        const data = await response.json()
        if (data.insights) {
          setInsights(data.insights)
        }
      }
    } catch (error) {
      console.error('Failed to load cached insights:', error)
    }
  }

  async function checkGAConnection() {
    try {
      // Check if user has connected their GA account
      const response = await fetch('/api/analytics/connection')

      if (response.ok) {
        const data = await response.json()
        if (data.connected) {
          setGaConnected(true)
          await fetchGoogleAnalyticsData()
        } else {
          setGaConnected(false)
          setGaData(null)
        }
      } else {
        setGaConnected(false)
        setGaData(null)
      }
    } catch (error) {
      console.error('Failed to check GA connection:', error)
      setGaConnected(false)
      setGaData(null)
    }
  }

  async function fetchGoogleAnalyticsData() {
    try {
      // Fetch real GA data from user's connected account
      const response = await fetch('/api/analytics/data?startDate=30daysAgo&endDate=today')

      if (!response.ok) {
        console.error('GA API returned error status:', response.status)
        setGaConnected(false)
        setGaData(null)
        return
      }

      const result = await response.json()
      if (result.data) {
        setGaData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch GA data:', error)
      setGaConnected(false)
      setGaData(null)
    }
  }

  async function fetchPrimaryBrand() {
    try {
      const brandsResponse = await fetch('/api/brands')
      const brandsData = await brandsResponse.json()
      const brands = brandsData.brands || []

      // Find primary brand or use first brand
      const primary = brands.find((b: Brand) => b.is_primary) || brands[0]
      setPrimaryBrand(primary || null)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  async function fetchData() {
    try {
      const [monitoringRes, auditsRes] = await Promise.all([
        fetch('/api/monitoring?limit=100'),
        fetch('/api/audits')
      ])

      const monitoringData = await monitoringRes.json()
      const auditsData = await auditsRes.json()

      setMonitoringRuns(monitoringData.runs || [])
      setAudits(auditsData.audits || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function runMonitoring() {
    try {
      const brandsResponse = await fetch('/api/brands')
      const brandsData = await brandsResponse.json()
      const brand = brandsData.brands?.[0]

      if (!brand) {
        setMonitoringStatus('✗ No brand found. Please add a brand first.')
        setTimeout(() => setMonitoringStatus(null), 5000)
        return
      }

      setMonitoring(true)
      setMonitoringStatus('⏳ Running monitoring across all platforms...')

      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id }),
      })

      if (!response.ok) {
        throw new Error('Monitoring failed')
      }

      const data = await response.json()
      setMonitoringStatus(`✓ Monitoring complete! Found ${data.result.total_mentions} mentions with ${data.result.visibility_score}% visibility`)

      // Refresh data
      await fetchData()

      setTimeout(() => setMonitoringStatus(null), 10000)
    } catch (error) {
      console.error('Monitoring error:', error)
      setMonitoringStatus('✗ Monitoring failed. Please try again.')
      setTimeout(() => setMonitoringStatus(null), 5000)
    } finally {
      setMonitoring(false)
    }
  }

  async function generateInsights() {
    try {
      setGeneratingInsights(true)

      // Calculate sentiment breakdown
      const sentimentBreakdown = allMentions.reduce((acc, mention) => {
        acc[mention.sentiment] = (acc[mention.sentiment] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Build metrics object
      const metrics = {
        brandName: primaryBrand?.name || 'Your Brand',
        industry: null, // Could get from brand data if available
        avgVisibilityScore,
        totalMentions,
        totalQueriesTested,
        platformStats,
        recentMentionsCount: allMentions.length,
        sentimentBreakdown: {
          positive: sentimentBreakdown['positive'] || 0,
          neutral: sentimentBreakdown['neutral'] || 0,
          negative: sentimentBreakdown['negative'] || 0
        },
        avgTechnicalScore: avgTechnical,
        avgContentScore: avgContent,
        avgAEOScore: avgAEO,
        auditsCount: audits.length,
        gaConnected,
        totalUsers: gaData?.metrics?.totalUsers,
        totalSessions: gaData?.metrics?.totalSessions,
        totalPageViews: gaData?.metrics?.totalPageViews
      }

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('Failed to generate insights:', error)
      setInsights({
        summary: 'Failed to generate insights. Please try again.',
        opportunities: [],
        concerns: [],
        recommendations: []
      })
    } finally {
      setGeneratingInsights(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Calculate metrics from real data
  const latestRuns = monitoringRuns.slice(0, 10)
  const avgVisibilityScore = latestRuns.length > 0
    ? Math.round(latestRuns.reduce((sum, run) => sum + run.visibility_score, 0) / latestRuns.length)
    : 0

  const totalMentions = latestRuns.reduce((sum, run) => sum + run.total_mentions, 0)
  const totalQueriesTested = latestRuns.reduce((sum, run) => sum + run.queries_tested, 0)

  // Calculate average audit scores
  const avgTechnical = audits.length > 0
    ? Math.round(audits.reduce((sum, a) => sum + (a.technical_score || 0), 0) / audits.length)
    : 0
  const avgContent = audits.length > 0
    ? Math.round(audits.reduce((sum, a) => sum + (a.content_score || 0), 0) / audits.length)
    : 0
  const avgAEO = audits.length > 0
    ? Math.round(audits.reduce((sum, a) => sum + (a.aeo_score || 0), 0) / audits.length)
    : 0

  // Get recent mentions from individual_results
  const allMentions = monitoringRuns
    .flatMap(run =>
      (run.individual_results || [])
        .filter((r: any) => r.mentioned)
        .map((r: any) => ({
          platform: r.platform,
          query: r.query,
          context: r.context,
          timestamp: run.timestamp,
          brand: run.brand_name,
          prominence_score: r.prominence_score || 0,
          sentiment: r.sentiment || 'neutral'
        }))
    )

  // Calculate platform-specific metrics
  const platformStats = latestRuns.reduce((acc, run) => {
    if (run.individual_results) {
      run.individual_results.forEach((result: any) => {
        const platform = result.platform
        if (!acc[platform]) {
          acc[platform] = { total: 0, mentions: 0, visibility: 0 }
        }
        acc[platform].total++
        if (result.mentioned) {
          acc[platform].mentions++
        }
      })
    }
    return acc
  }, {} as Record<string, { total: number; mentions: number; visibility: number }>)

  // Calculate visibility percentage for each platform
  Object.keys(platformStats).forEach(platform => {
    const stats = platformStats[platform]
    stats.visibility = stats.total > 0 ? Math.round((stats.mentions / stats.total) * 100) : 0
  })

  // Filter mentions based on showAllBrands toggle
  const recentMentions = (showAllBrands
    ? allMentions
    : allMentions.filter(m => m.brand === primaryBrand?.name)
  ).slice(0, 5)

  // No data state
  if (monitoringRuns.length === 0 && audits.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your AI search visibility
          </p>
        </div>
        <Card className="border-dashed">
          <CardHeader className="flex flex-col items-center justify-center text-center py-16">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>Get started with RevIntel</CardTitle>
            <CardDescription className="mb-6 max-w-md">
              Add your brand and start monitoring your visibility across AI platforms, or audit your pages to optimize for AI search engines.
            </CardDescription>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/dashboard/brands')}>
                Add Your Brand
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/content')}>
                Audit a Page
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {primaryBrand && (
              <Badge variant="outline" className="text-sm">
                {primaryBrand.is_primary && (
                  <Star className="h-3 w-3 fill-orange-500 text-orange-500 mr-1" />
                )}
                {primaryBrand.name}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Track your brand visibility across ChatGPT, Claude, Perplexity, Gemini & Grok
          </p>
        </div>
        <Button
          onClick={runMonitoring}
          disabled={monitoring}
          size="lg"
          className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
        >
          {monitoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Monitoring Now
            </>
          )}
        </Button>
      </div>

      {/* Status Banner */}
      {monitoringStatus && (
        <Card className={`border-2 ${
          monitoringStatus.startsWith('✓') ? 'border-green-500 bg-green-50' :
          monitoringStatus.startsWith('✗') ? 'border-red-500 bg-red-50' :
          'border-blue-500 bg-blue-50'
        }`}>
          <CardContent className="pt-4 pb-4">
            <p className={`text-sm font-medium ${
              monitoringStatus.startsWith('✓') ? 'text-green-900' :
              monitoringStatus.startsWith('✗') ? 'text-red-900' :
              'text-blue-900'
            }`}>
              {monitoringStatus}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              AI Visibility Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{avgVisibilityScore}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              Trend over the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Brand Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalMentions}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Out of {totalQueriesTested} queries
            </p>
          </CardContent>
        </Card>

        {gaConnected && gaData ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{gaData.metrics?.totalUsers?.toLocaleString() || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{gaData.metrics?.totalSessions?.toLocaleString() || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  User sessions
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Pages Audited
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{audits.length}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {audits.filter(a => a.last_audited_at).length} with scores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Avg AEO Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{avgAEO}/100</div>
                <p className="text-sm text-muted-foreground mt-1">
                  AI Engine Optimization
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Platform-Specific Visibility Breakdown */}
      {Object.keys(platformStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">LLM Visibility Breakdown</CardTitle>
            <CardDescription className="text-sm">Your brand performance across each AI platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {Object.entries(platformStats)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([platform, stats]) => {
                  const platformConfig = {
                    chatgpt: { icon: MessageSquare, name: 'ChatGPT', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                    claude: { icon: Brain, name: 'Claude', bg: 'bg-amber-50', border: 'border-amber-100' },
                    perplexity: { icon: Search, name: 'Perplexity', bg: 'bg-blue-50', border: 'border-blue-100' },
                    gemini: { icon: Sparkles, name: 'Gemini', bg: 'bg-purple-50', border: 'border-purple-100' },
                    grok: { icon: Zap, name: 'Grok', bg: 'bg-pink-50', border: 'border-pink-100' }
                  }[platform.toLowerCase()] || { icon: Activity, name: platform, bg: 'bg-gray-50', border: 'border-gray-100' }

                  const Icon = platformConfig.icon

                  return (
                    <div key={platform} className={`p-4 rounded-lg border ${platformConfig.border} ${platformConfig.bg}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{platformConfig.name}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-semibold">
                          {stats.visibility}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {stats.mentions} of {stats.total} queries
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Insights */}
      {monitoringRuns.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
                <CardDescription>Strategic analysis of your metrics</CardDescription>
              </div>
              <Button
                onClick={generateInsights}
                disabled={generatingInsights}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                {generatingInsights ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {insights ? 'Refresh' : 'Generate'}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!insights && !generatingInsights && (
              <div className="text-sm text-muted-foreground">
                Click "Generate" to analyze your dashboard metrics and get strategic recommendations
              </div>
            )}

            {generatingInsights && (
              <div className="flex items-center gap-3 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Analyzing metrics...</span>
              </div>
            )}

            {insights && (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
                </div>

                {/* Opportunities */}
                {insights.opportunities && insights.opportunities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Opportunities</h3>
                    <ul className="space-y-2">
                      {insights.opportunities.map((opp: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="text-muted-foreground/40">•</span>
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {insights.concerns && insights.concerns.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Areas of Concern</h3>
                    <ul className="space-y-2">
                      {insights.concerns.map((concern: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="text-muted-foreground/40">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {insights.recommendations && insights.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {insights.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="text-muted-foreground/60 font-medium">{idx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional GA Metrics Row */}
      {gaConnected && gaData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Page Views
              </CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gaData.metrics?.totalPageViews?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total page views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pages Audited
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{audits.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {audits.filter(a => a.last_audited_at).length} with scores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg AEO Score
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAEO}/100</div>
              <p className="text-xs text-muted-foreground mt-1">
                AI Engine Optimization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg/Session
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gaData.metrics?.totalSessions && gaData.metrics?.totalPageViews
                  ? (gaData.metrics.totalPageViews / gaData.metrics.totalSessions).toFixed(1)
                  : '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pages per session
              </p>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Google Analytics Section */}
      {!gaConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Google Analytics</CardTitle>
            <CardDescription>Connect your Google Analytics to track website traffic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Google Analytics is not connected. Connect your GA property to see traffic data and insights.
              </p>
              <Button
                onClick={() => router.push('/dashboard/settings')}
                variant="outline"
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : gaConnected && gaData && gaData.topPages && gaData.topPages.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Google Analytics - Top Pages</CardTitle>
              <CardDescription>Most visited pages in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Page</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gaData.topPages.slice(0, 7).map((page: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-3 px-4 text-sm">{page.page}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium">{page.pageViews?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Year-to-Date Traffic Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Google Analytics - Year to Date Traffic</CardTitle>
              <CardDescription>Monthly traffic trend for 2025</CardDescription>
            </CardHeader>
            <CardContent>
              {gaData.trafficTrend && gaData.trafficTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={gaData.trafficTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      fontSize={12}
                      tickFormatter={(value) => value}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#6366f1"
                      strokeWidth={2}
                      name="Users"
                      dot={{ fill: '#6366f1', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Sessions"
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pageViews"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Page Views"
                      dot={{ fill: '#f59e0b', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No traffic trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Page Audit Scores */}
      {audits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content Quality Overview</CardTitle>
            <CardDescription>
              Average scores across all audited pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32 font-medium">Technical SEO</div>
                <div className="flex-1">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${avgTechnical}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right font-semibold">
                  {avgTechnical}/100
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 font-medium">Content Quality</div>
                <div className="flex-1">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${avgContent}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right font-semibold">
                  {avgContent}/100
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 font-medium">AEO</div>
                <div className="flex-1">
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${avgAEO}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right font-semibold">
                  {avgAEO}/100
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {allMentions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Brand Mentions in LLMs</CardTitle>
                <CardDescription>How AI platforms are responding to queries about your brand</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={!showAllBrands ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAllBrands(false)}
                >
                  My Brand
                </Button>
                <Button
                  variant={showAllBrands ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAllBrands(true)}
                >
                  All Brands
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMentions.map((mention, i) => {
                const platformConfig = {
                  chatgpt: { icon: MessageSquare, name: 'ChatGPT' },
                  claude: { icon: Brain, name: 'Claude' },
                  perplexity: { icon: Search, name: 'Perplexity' },
                  gemini: { icon: Sparkles, name: 'Gemini' },
                  grok: { icon: Zap, name: 'Grok' }
                }[mention.platform.toLowerCase()] || { icon: Activity, name: mention.platform }

                const PlatformIcon = platformConfig.icon

                return (
                  <div key={i} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <PlatformIcon className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium">{platformConfig.name}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground capitalize">{mention.sentiment}</span>
                          {mention.prominence_score > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{mention.prominence_score}% prominence</span>
                            </>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(mention.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{mention.query}</p>
                        {mention.context && (
                          <p className="text-sm text-muted-foreground italic">"{mention.context}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audited Pages */}
      {audits.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recently Audited Pages</CardTitle>
              <CardDescription>Latest page audits and scores</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/content')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {audits.slice(0, 5).map((audit) => (
                <div key={audit.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{audit.page_title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground font-mono">{audit.page_url}</p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${(audit.technical_score || 0) >= 80 ? 'text-green-600' : (audit.technical_score || 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {audit.technical_score || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">Tech</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${(audit.content_score || 0) >= 80 ? 'text-green-600' : (audit.content_score || 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {audit.content_score || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">Content</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-semibold ${(audit.aeo_score || 0) >= 80 ? 'text-green-600' : (audit.aeo_score || 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {audit.aeo_score || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">AEO</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
