"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Activity, Target, Loader2, Sparkles, Users, MousePointer, BarChart3, Eye, Play, Star } from "lucide-react"
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

  useEffect(() => {
    fetchData()
    checkGAConnection()
    fetchPrimaryBrand()
  }, [])

  async function checkGAConnection() {
    try {
      const response = await fetch('/api/analytics/connect')
      const data = await response.json()

      if (data.connected) {
        setGaConnected(true)
        await fetchGoogleAnalyticsData()
      }
    } catch (error) {
      console.error('Failed to check GA connection:', error)
    }
  }

  async function fetchGoogleAnalyticsData() {
    try {
      const response = await fetch('/api/analytics/data?startDate=30daysAgo&endDate=today')

      if (!response.ok) {
        console.error('GA API returned error status:', response.status)
        return
      }

      const text = await response.text()
      if (!text) {
        console.error('GA API returned empty response')
        return
      }

      const result = JSON.parse(text)
      setGaData(result.data)
    } catch (error) {
      console.error('Failed to fetch GA data:', error)
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
          brand: run.brand_name
        }))
    )

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
            <CardTitle>Get started with AISearchOptimizer</CardTitle>
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
            Overview of your AI search visibility
          </p>
        </div>
        <Button onClick={runMonitoring} disabled={monitoring} size="lg" className="gap-2">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visibility Score
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgVisibilityScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {latestRuns.length} recent monitoring {latestRuns.length === 1 ? 'run' : 'runs'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Brand Mentions
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMentions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {totalQueriesTested} queries tested
            </p>
          </CardContent>
        </Card>

        {gaConnected && gaData ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gaData.metrics?.totalUsers?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gaData.metrics?.totalSessions?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  User sessions
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pages Audited
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
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
          </>
        )}
      </div>

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

      {/* Google Analytics Traffic Charts */}
      {gaConnected && gaData && gaData.trafficTrend && gaData.trafficTrend.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Users & Sessions Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Users and sessions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={gaData.trafficTrend}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8))
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8))
                      return date.toLocaleDateString()
                    }}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    strokeWidth={2}
                    name="Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    strokeWidth={2}
                    name="Sessions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Page Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Page Views Trend</CardTitle>
              <CardDescription>Daily page views over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gaData.trafficTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8))
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8))
                      return date.toLocaleDateString()
                    }}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Page Views"
                    dot={{ fill: '#f59e0b', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Pages Chart */}
      {gaConnected && gaData && gaData.topPages && gaData.topPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Pages by Traffic</CardTitle>
            <CardDescription>Most visited pages in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={gaData.topPages.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="page"
                  fontSize={11}
                  width={90}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip
                  formatter={(value: number) => value.toLocaleString()}
                  labelFormatter={(value) => value}
                />
                <Legend />
                <Bar
                  dataKey="pageViews"
                  fill="#6366f1"
                  name="Page Views"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="users"
                  fill="#10b981"
                  name="Users"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
                <CardTitle>Recent Brand Mentions</CardTitle>
                <CardDescription>Latest mentions across AI platforms</CardDescription>
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
              {recentMentions.map((mention, i) => (
                <div key={i} className="flex gap-4 border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {mention.platform}
                      </Badge>
                      <span className="text-sm font-medium">{mention.brand}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(mention.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-1">{mention.query}</p>
                    <p className="text-sm text-muted-foreground">...{mention.context}...</p>
                  </div>
                </div>
              ))}
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
