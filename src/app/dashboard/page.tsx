"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Activity, Target, Loader2, Sparkles } from "lucide-react"

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

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [monitoringRuns, setMonitoringRuns] = useState<MonitoringRun[]>([])
  const [audits, setAudits] = useState<PageAudit[]>([])

  useEffect(() => {
    fetchData()
  }, [])

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
  const recentMentions = monitoringRuns
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
    .slice(0, 5)

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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your AI search visibility
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/brands')}>Run Monitoring Now</Button>
      </div>

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
      </div>

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
      {recentMentions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Brand Mentions</CardTitle>
            <CardDescription>Latest mentions across AI platforms</CardDescription>
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
