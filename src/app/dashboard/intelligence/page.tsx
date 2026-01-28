"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import {
  Loader2,
  Brain,
  MessageSquare,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  Star,
  Eye,
  Activity,
} from "lucide-react"

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

interface Brand {
  id: string
  name: string
  is_primary?: boolean
}

interface PlatformStats {
  platform: string
  mentions: number
  total: number
  visibility: number
  avgPosition: number
  sentiment: { positive: number; neutral: number; negative: number }
}

interface CompetitorStats {
  name: string
  mentions: number
  visibility: number
  wins: number
  losses: number
  ties: number
}

interface QueryCategory {
  category: string
  queries: number
  mentions: number
  visibility: number
  topCompetitor?: string
}

const PLATFORM_CONFIGS: Record<string, { icon: any; name: string; color: string; bgColor: string }> = {
  chatgpt: { icon: MessageSquare, name: 'ChatGPT', color: '#10b981', bgColor: 'bg-emerald-50' },
  claude: { icon: Brain, name: 'Claude', color: '#f59e0b', bgColor: 'bg-amber-50' },
  perplexity: { icon: Search, name: 'Perplexity', color: '#3b82f6', bgColor: 'bg-blue-50' },
  gemini: { icon: Sparkles, name: 'Gemini', color: '#8b5cf6', bgColor: 'bg-purple-50' },
  grok: { icon: Zap, name: 'Grok', color: '#ec4899', bgColor: 'bg-pink-50' },
  'google ai overview': { icon: Eye, name: 'Google AI', color: '#ef4444', bgColor: 'bg-red-50' },
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444',
}

const QUERY_CATEGORIES = ['Product', 'Pricing', 'Comparison', 'How-to', 'Reviews', 'General']

export default function IntelligencePage() {
  const [loading, setLoading] = useState(true)
  const [monitoringRuns, setMonitoringRuns] = useState<MonitoringRun[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [timeRange, setTimeRange] = useState<'7' | '30'>('30')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [monitoringRes, brandsRes] = await Promise.all([
        fetch('/api/monitoring?limit=200'),
        fetch('/api/brands'),
      ])

      const monitoringData = await monitoringRes.json()
      const brandsData = await brandsRes.json()

      setMonitoringRuns(monitoringData.runs || [])
      setBrands(brandsData.brands || [])

      // Auto-select primary brand
      const primaryBrand = brandsData.brands?.find((b: Brand) => b.is_primary) || brandsData.brands?.[0]
      if (primaryBrand) {
        setSelectedBrandId(primaryBrand.id)
      }
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

  // Filter runs by selected brand and time range
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange))

  const filteredRuns = monitoringRuns.filter(run => {
    const matchesBrand = !selectedBrandId || run.brand_id === selectedBrandId
    const matchesTime = new Date(run.timestamp) >= cutoffDate
    return matchesBrand && matchesTime
  })

  const selectedBrand = brands.find(b => b.id === selectedBrandId)

  // Calculate Platform Stats with detailed metrics
  const platformStats = calculatePlatformStats(filteredRuns)

  // Calculate Competitor Battle Card data
  const competitorStats = calculateCompetitorStats(filteredRuns, selectedBrand?.name || '')

  // Calculate Query Category Analysis
  const categoryStats = calculateCategoryStats(filteredRuns)

  // Calculate Trend Data
  const trendData = calculateTrendData(filteredRuns, parseInt(timeRange))

  // Share of Voice data for pie chart
  const shareOfVoiceData = calculateShareOfVoice(filteredRuns, selectedBrand?.name || '')

  // Overall metrics
  const overallVisibility = filteredRuns.length > 0
    ? Math.round(filteredRuns.reduce((sum, r) => sum + r.visibility_score, 0) / filteredRuns.length)
    : 0

  const totalMentions = filteredRuns.reduce((sum, r) => sum + r.total_mentions, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Brand Intelligence</h1>
            {selectedBrand && (
              <Badge variant="outline" className="text-sm">
                {selectedBrand.is_primary && (
                  <Star className="h-3 w-3 fill-orange-500 text-orange-500 mr-1" />
                )}
                {selectedBrand.name}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Comprehensive analysis of your brand visibility across AI platforms
          </p>
        </div>

        <div className="flex gap-3">
          <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  <div className="flex items-center gap-2">
                    {brand.is_primary && <Star className="h-3 w-3 fill-orange-500 text-orange-500" />}
                    {brand.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as '7' | '30')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallVisibility}%</div>
            <TrendIndicator trend={trendData.overallTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMentions}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Platform</CardTitle>
          </CardHeader>
          <CardContent>
            {platformStats.length > 0 ? (
              <>
                <div className="text-2xl font-bold">{platformStats[0]?.platform}</div>
                <p className="text-xs text-muted-foreground">{platformStats[0]?.visibility}% visibility</p>
              </>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monitoring Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredRuns.length}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
      </div>

      {/* A. Multi-LLM Visibility Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Multi-LLM Visibility Matrix
          </CardTitle>
          <CardDescription>Brand visibility across ChatGPT, Claude, Perplexity, Gemini & Grok</CardDescription>
        </CardHeader>
        <CardContent>
          {platformStats.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {platformStats.map((stat) => {
                const config = PLATFORM_CONFIGS[stat.platform.toLowerCase()] || {
                  icon: Activity,
                  name: stat.platform,
                  color: '#6b7280',
                  bgColor: 'bg-gray-50',
                }
                const Icon = config.icon
                const visibilityLevel = getVisibilityLevel(stat.visibility)

                return (
                  <div
                    key={stat.platform}
                    className={`p-4 rounded-lg border-2 ${config.bgColor} ${visibilityLevel.borderColor}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5" style={{ color: config.color }} />
                      <span className="font-medium">{config.name}</span>
                    </div>

                    {/* Visibility Score */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{stat.visibility}%</span>
                        <Badge className={visibilityLevel.badgeColor}>{visibilityLevel.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.mentions} / {stat.total} queries
                      </p>
                    </div>

                    {/* Sentiment Breakdown */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Sentiment</p>
                      <div className="flex gap-1 h-2 rounded overflow-hidden">
                        <div
                          className="bg-green-500"
                          style={{ width: `${stat.sentiment.positive}%` }}
                          title={`Positive: ${stat.sentiment.positive}%`}
                        />
                        <div
                          className="bg-gray-400"
                          style={{ width: `${stat.sentiment.neutral}%` }}
                          title={`Neutral: ${stat.sentiment.neutral}%`}
                        />
                        <div
                          className="bg-red-500"
                          style={{ width: `${stat.sentiment.negative}%` }}
                          title={`Negative: ${stat.sentiment.negative}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{stat.sentiment.positive}% pos</span>
                        <span>{stat.sentiment.negative}% neg</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState message="Run monitoring to see visibility data across LLM platforms" />
          )}
        </CardContent>
      </Card>

      {/* B. Competitor Battle Card & C. Query Category Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Competitor Battle Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Competitor Battle Card
            </CardTitle>
            <CardDescription>Head-to-head comparison with competitors</CardDescription>
          </CardHeader>
          <CardContent>
            {competitorStats.length > 0 ? (
              <div className="space-y-4">
                {/* Share of Voice Pie Chart */}
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shareOfVoiceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {shareOfVoiceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isYourBrand ? '#10b981' : `hsl(${index * 45 + 200}, 70%, 50%)`}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Win/Loss Table */}
                <div className="space-y-2">
                  {competitorStats.slice(0, 5).map((comp, idx) => (
                    <div
                      key={comp.name}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{comp.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-green-600 font-bold">{comp.wins}</div>
                          <div className="text-[10px] text-muted-foreground">Wins</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 font-bold">{comp.losses}</div>
                          <div className="text-[10px] text-muted-foreground">Losses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 font-bold">{comp.ties}</div>
                          <div className="text-[10px] text-muted-foreground">Ties</div>
                        </div>
                        <Badge variant={comp.wins > comp.losses ? "default" : "destructive"}>
                          {comp.visibility}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="Competitor data will appear after monitoring runs" />
            )}
          </CardContent>
        </Card>

        {/* Query Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Query Category Analysis
            </CardTitle>
            <CardDescription>Performance by query intent type</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <div className="space-y-3">
                {categoryStats.map((cat) => {
                  const level = getVisibilityLevel(cat.visibility)
                  return (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{cat.category}</span>
                          <span className="text-xs text-muted-foreground">({cat.queries} queries)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{cat.visibility}%</span>
                          <Badge className={level.badgeColor}>{level.label}</Badge>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${level.barColor}`}
                          style={{ width: `${cat.visibility}%` }}
                        />
                      </div>
                      {cat.topCompetitor && cat.visibility < 50 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {cat.topCompetitor} dominates this category
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState message="Category analysis will appear after monitoring runs" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* D. Trend Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Visibility Trends
          </CardTitle>
          <CardDescription>Performance trends per LLM over the last {timeRange} days</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.platformTrends.length > 0 ? (
            <>
              {/* Trend Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {trendData.platformTrends.map((pt) => {
                  const config = PLATFORM_CONFIGS[pt.platform.toLowerCase()] || {
                    name: pt.platform,
                    color: '#6b7280',
                  }
                  return (
                    <div
                      key={pt.platform}
                      className="flex items-center gap-2 px-3 py-2 border rounded-lg"
                    >
                      <span className="font-medium">{config.name}</span>
                      <TrendBadge trend={pt.trend} change={pt.change} />
                    </div>
                  )
                })}
              </div>

              {/* Trend Chart */}
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    {Object.keys(PLATFORM_CONFIGS).map((platform) => {
                      const config = PLATFORM_CONFIGS[platform]
                      return (
                        <Area
                          key={platform}
                          type="monotone"
                          dataKey={config.name}
                          stroke={config.color}
                          fill={config.color}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      )
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState message="Trend data will appear after multiple monitoring runs" />
          )}
        </CardContent>
      </Card>

      {/* Alerts & Recommendations */}
      {(trendData.alerts.length > 0 || filteredRuns.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRuns.length === 0 ? (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">No monitoring data yet</p>
                    <p className="text-sm text-blue-700">Run monitoring from the dashboard to see brand intelligence insights.</p>
                  </div>
                </div>
              ) : (
                trendData.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                      alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        alert.type === 'warning' ? 'text-amber-900' : 'text-green-900'
                      }`}>{alert.title}</p>
                      <p className={`text-sm ${
                        alert.type === 'warning' ? 'text-amber-700' : 'text-green-700'
                      }`}>{alert.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper Components
function TrendIndicator({ trend }: { trend: 'rising' | 'falling' | 'stable' }) {
  if (trend === 'rising') {
    return (
      <div className="flex items-center gap-1 text-green-600 text-sm">
        <TrendingUp className="h-4 w-4" />
        <span>Rising</span>
      </div>
    )
  }
  if (trend === 'falling') {
    return (
      <div className="flex items-center gap-1 text-red-600 text-sm">
        <TrendingDown className="h-4 w-4" />
        <span>Falling</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 text-gray-600 text-sm">
      <Minus className="h-4 w-4" />
      <span>Stable</span>
    </div>
  )
}

function TrendBadge({ trend, change }: { trend: 'rising' | 'falling' | 'stable'; change: number }) {
  if (trend === 'rising') {
    return (
      <Badge className="bg-green-100 text-green-700">
        <TrendingUp className="h-3 w-3 mr-1" />
        +{change}%
      </Badge>
    )
  }
  if (trend === 'falling') {
    return (
      <Badge className="bg-red-100 text-red-700">
        <TrendingDown className="h-3 w-3 mr-1" />
        {change}%
      </Badge>
    )
  }
  return (
    <Badge className="bg-gray-100 text-gray-700">
      <Minus className="h-3 w-3 mr-1" />
      Stable
    </Badge>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Helper Functions
function getVisibilityLevel(visibility: number): {
  label: string
  badgeColor: string
  borderColor: string
  barColor: string
} {
  if (visibility >= 70) {
    return {
      label: 'Strong',
      badgeColor: 'bg-green-100 text-green-700',
      borderColor: 'border-green-300',
      barColor: 'bg-green-500',
    }
  }
  if (visibility >= 40) {
    return {
      label: 'Moderate',
      badgeColor: 'bg-yellow-100 text-yellow-700',
      borderColor: 'border-yellow-300',
      barColor: 'bg-yellow-500',
    }
  }
  return {
    label: 'Weak',
    badgeColor: 'bg-red-100 text-red-700',
    borderColor: 'border-red-300',
    barColor: 'bg-red-500',
  }
}

function calculatePlatformStats(runs: MonitoringRun[]): PlatformStats[] {
  const platformMap = new Map<string, {
    mentions: number
    total: number
    positions: number[]
    sentiments: string[]
  }>()

  runs.forEach(run => {
    run.individual_results?.forEach((result: any) => {
      const platform = result.platform?.toLowerCase() || 'unknown'
      if (!platformMap.has(platform)) {
        platformMap.set(platform, { mentions: 0, total: 0, positions: [], sentiments: [] })
      }
      const stats = platformMap.get(platform)!
      stats.total++
      if (result.mentioned) {
        stats.mentions++
        if (result.position) stats.positions.push(result.position)
        stats.sentiments.push(result.sentiment || 'neutral')
      }
    })
  })

  const results: PlatformStats[] = []
  platformMap.forEach((stats, platform) => {
    const sentimentCounts = {
      positive: stats.sentiments.filter(s => s === 'positive').length,
      neutral: stats.sentiments.filter(s => s === 'neutral').length,
      negative: stats.sentiments.filter(s => s === 'negative').length,
    }
    const totalSentiments = stats.sentiments.length || 1

    results.push({
      platform: PLATFORM_CONFIGS[platform]?.name || platform,
      mentions: stats.mentions,
      total: stats.total,
      visibility: stats.total > 0 ? Math.round((stats.mentions / stats.total) * 100) : 0,
      avgPosition: stats.positions.length > 0
        ? Math.round(stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length)
        : 0,
      sentiment: {
        positive: Math.round((sentimentCounts.positive / totalSentiments) * 100),
        neutral: Math.round((sentimentCounts.neutral / totalSentiments) * 100),
        negative: Math.round((sentimentCounts.negative / totalSentiments) * 100),
      },
    })
  })

  return results.sort((a, b) => b.visibility - a.visibility)
}

function calculateCompetitorStats(runs: MonitoringRun[], brandName: string): CompetitorStats[] {
  const competitorMap = new Map<string, { mentions: number; wins: number; losses: number; ties: number }>()

  runs.forEach(run => {
    run.individual_results?.forEach((result: any) => {
      const responseText = result.response_text || ''
      const myBrandMentioned = result.mentioned

      // Extract other brand mentions (simplified)
      const words = responseText.split(/\s+/)
      const brandMatches = words.filter((word: string) => {
        const cleaned = word.replace(/[^a-zA-Z]/g, '')
        return cleaned.length > 3 && /^[A-Z]/.test(cleaned) && cleaned.toLowerCase() !== brandName.toLowerCase()
      })

      const uniqueBrands: string[] = [...new Set(brandMatches.map((w: string) => w.replace(/[^a-zA-Z]/g, '')))]

      uniqueBrands.forEach((brand: string) => {
        if (!competitorMap.has(brand)) {
          competitorMap.set(brand, { mentions: 0, wins: 0, losses: 0, ties: 0 })
        }
        const stats = competitorMap.get(brand)!
        stats.mentions++

        // Determine win/loss/tie
        const competitorMentioned = true // They're in the response
        if (myBrandMentioned && competitorMentioned) {
          stats.ties++
        } else if (myBrandMentioned) {
          stats.wins++
        } else if (competitorMentioned) {
          stats.losses++
        }
      })
    })
  })

  const results: CompetitorStats[] = []
  competitorMap.forEach((stats, name) => {
    if (stats.mentions >= 3) { // Only include competitors mentioned at least 3 times
      const totalGames = stats.wins + stats.losses + stats.ties
      results.push({
        name,
        mentions: stats.mentions,
        visibility: totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0,
        wins: stats.wins,
        losses: stats.losses,
        ties: stats.ties,
      })
    }
  })

  return results.sort((a, b) => b.mentions - a.mentions).slice(0, 10)
}

function calculateCategoryStats(runs: MonitoringRun[]): QueryCategory[] {
  const categoryMap = new Map<string, { queries: number; mentions: number; competitors: string[] }>()

  // Initialize categories
  QUERY_CATEGORIES.forEach(cat => {
    categoryMap.set(cat, { queries: 0, mentions: 0, competitors: [] })
  })

  runs.forEach(run => {
    run.individual_results?.forEach((result: any) => {
      const query = (result.query || '').toLowerCase()
      let category = 'General'

      // Simple category detection
      if (query.includes('price') || query.includes('cost') || query.includes('cheap') || query.includes('expensive')) {
        category = 'Pricing'
      } else if (query.includes('vs') || query.includes('compare') || query.includes('alternative') || query.includes('better')) {
        category = 'Comparison'
      } else if (query.includes('how') || query.includes('guide') || query.includes('tutorial') || query.includes('setup')) {
        category = 'How-to'
      } else if (query.includes('review') || query.includes('opinion') || query.includes('rating') || query.includes('best')) {
        category = 'Reviews'
      } else if (query.includes('product') || query.includes('feature') || query.includes('service')) {
        category = 'Product'
      }

      const stats = categoryMap.get(category)!
      stats.queries++
      if (result.mentioned) {
        stats.mentions++
      }
    })
  })

  const results: QueryCategory[] = []
  categoryMap.forEach((stats, category) => {
    if (stats.queries > 0) {
      results.push({
        category,
        queries: stats.queries,
        mentions: stats.mentions,
        visibility: Math.round((stats.mentions / stats.queries) * 100),
      })
    }
  })

  return results.sort((a, b) => b.queries - a.queries)
}

function calculateTrendData(runs: MonitoringRun[], days: number): {
  platformTrends: Array<{ platform: string; trend: 'rising' | 'falling' | 'stable'; change: number }>
  chartData: Array<{ date: string; [key: string]: any }>
  overallTrend: 'rising' | 'falling' | 'stable'
  alerts: Array<{ type: 'warning' | 'success' | 'info'; title: string; message: string }>
} {
  const sortedRuns = [...runs].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Group runs by date
  const dailyData = new Map<string, Map<string, { mentions: number; total: number }>>()

  sortedRuns.forEach(run => {
    const date = new Date(run.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    if (!dailyData.has(date)) {
      dailyData.set(date, new Map())
    }

    run.individual_results?.forEach((result: any) => {
      const platform = result.platform?.toLowerCase() || 'unknown'
      const platformName = PLATFORM_CONFIGS[platform]?.name || platform

      if (!dailyData.get(date)!.has(platformName)) {
        dailyData.get(date)!.set(platformName, { mentions: 0, total: 0 })
      }

      const stats = dailyData.get(date)!.get(platformName)!
      stats.total++
      if (result.mentioned) stats.mentions++
    })
  })

  // Build chart data
  const chartData: Array<{ date: string; [key: string]: any }> = []
  dailyData.forEach((platforms, date) => {
    const entry: { date: string; [key: string]: any } = { date }
    platforms.forEach((stats, platform) => {
      entry[platform] = stats.total > 0 ? Math.round((stats.mentions / stats.total) * 100) : 0
    })
    chartData.push(entry)
  })

  // Calculate platform trends
  const platformTrends: Array<{ platform: string; trend: 'rising' | 'falling' | 'stable'; change: number }> = []
  const alerts: Array<{ type: 'warning' | 'success' | 'info'; title: string; message: string }> = []

  Object.values(PLATFORM_CONFIGS).forEach(config => {
    const recentDays = chartData.slice(-7)
    const olderDays = chartData.slice(-14, -7)

    const recentAvg = recentDays.length > 0
      ? recentDays.reduce((sum, d) => sum + (d[config.name] || 0), 0) / recentDays.length
      : 0
    const olderAvg = olderDays.length > 0
      ? olderDays.reduce((sum, d) => sum + (d[config.name] || 0), 0) / olderDays.length
      : recentAvg

    const change = Math.round(recentAvg - olderAvg)
    let trend: 'rising' | 'falling' | 'stable' = 'stable'

    if (change > 5) trend = 'rising'
    else if (change < -5) trend = 'falling'

    platformTrends.push({ platform: config.name, trend, change })

    // Generate alerts
    if (trend === 'falling' && Math.abs(change) > 10) {
      alerts.push({
        type: 'warning',
        title: `${config.name} visibility declining`,
        message: `Your visibility on ${config.name} has dropped ${Math.abs(change)}% in the last 7 days.`,
      })
    } else if (trend === 'rising' && change > 15) {
      alerts.push({
        type: 'success',
        title: `${config.name} visibility improving`,
        message: `Great news! Your visibility on ${config.name} increased ${change}% in the last 7 days.`,
      })
    }
  })

  // Calculate overall trend
  const recentOverall = runs.slice(0, Math.min(5, runs.length))
  const olderOverall = runs.slice(5, Math.min(10, runs.length))

  const recentAvgOverall = recentOverall.length > 0
    ? recentOverall.reduce((sum, r) => sum + r.visibility_score, 0) / recentOverall.length
    : 0
  const olderAvgOverall = olderOverall.length > 0
    ? olderOverall.reduce((sum, r) => sum + r.visibility_score, 0) / olderOverall.length
    : recentAvgOverall

  let overallTrend: 'rising' | 'falling' | 'stable' = 'stable'
  if (recentAvgOverall > olderAvgOverall + 5) overallTrend = 'rising'
  else if (recentAvgOverall < olderAvgOverall - 5) overallTrend = 'falling'

  return { platformTrends, chartData, overallTrend, alerts }
}

function calculateShareOfVoice(runs: MonitoringRun[], brandName: string): Array<{
  name: string
  value: number
  isYourBrand: boolean
}> {
  const brandMentions = new Map<string, number>()
  let totalMentions = 0

  runs.forEach(run => {
    run.individual_results?.forEach((result: any) => {
      if (result.mentioned) {
        const name = run.brand_name || brandName
        brandMentions.set(name, (brandMentions.get(name) || 0) + 1)
        totalMentions++
      }

      // Extract competitor mentions (simplified)
      const responseText = result.response_text || ''
      const words = responseText.split(/\s+/)
      words.forEach((word: string) => {
        const cleaned = word.replace(/[^a-zA-Z]/g, '')
        if (cleaned.length > 4 && /^[A-Z]/.test(cleaned)) {
          const lowerCleaned = cleaned.toLowerCase()
          if (lowerCleaned !== brandName.toLowerCase() && !['The', 'This', 'That', 'With', 'From'].includes(cleaned)) {
            brandMentions.set(cleaned, (brandMentions.get(cleaned) || 0) + 1)
            totalMentions++
          }
        }
      })
    })
  })

  if (totalMentions === 0) return []

  // Get top brands by mentions
  const sorted = [...brandMentions.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  return sorted.map(([name, count]) => ({
    name,
    value: Math.round((count / totalMentions) * 100),
    isYourBrand: name.toLowerCase() === brandName.toLowerCase(),
  }))
}
