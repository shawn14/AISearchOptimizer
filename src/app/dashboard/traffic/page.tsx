"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Loader2, TrendingUp, Users, MousePointerClick, Globe, AlertCircle } from "lucide-react"

interface TrafficData {
  trafficByPlatform: Array<{
    platform: string
    visits: number
    clicks: number
    ctr: number
    avgTimeOnPage: number
    bounceRate: number
  }>
  trafficTrend: Array<{
    date: string
    chatgpt: number
    claude: number
    gemini: number
    perplexity: number
    grok: number
  }>
  referralSources: Array<{
    name: string
    value: number
    color: string
  }>
  totalVisits: number
  totalClicks: number
  avgCTR: number
  runsAnalyzed?: number
}

export default function TrafficPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<string>("7")
  const [data, setData] = useState<TrafficData | null>(null)

  useEffect(() => {
    fetchTrafficData()
  }, [timeRange])

  async function fetchTrafficData() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/traffic?days=${timeRange}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch traffic data')
      }

      setData(result.data)
    } catch (err) {
      console.error('Error fetching traffic data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load traffic data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Traffic Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={fetchTrafficData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.totalVisits === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Traffic Analytics</h1>
            <p className="text-muted-foreground">
              Track brand mentions from AI search platforms
            </p>
          </div>
        </div>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">📊 No Traffic Data Yet</CardTitle>
            <CardDescription>
              Run brand monitoring to start collecting traffic data from AI platforms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Traffic data is generated from your monitoring runs. Each time you monitor your brand,
              we track which AI platforms mention you and calculate visibility metrics.
            </p>
            <a
              href="/dashboard"
              className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Go to Dashboard
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traffic Analytics</h1>
          <p className="text-muted-foreground">
            Track brand mentions from AI search platforms
          </p>
          {data.runsAnalyzed && (
            <p className="text-xs text-muted-foreground mt-1">
              Based on {data.runsAnalyzed} monitoring runs
            </p>
          )}
        </div>

        {/* Time Range Filter */}
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Brand mentions across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-primary" />
              High-Prominence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Mentions with high visibility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Prominence Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.avgCTR}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              High-visibility mention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Active Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.trafficByPlatform.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              AI search engines
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Trend */}
      {data.trafficTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mention Trends</CardTitle>
            <CardDescription>Daily brand mentions from AI platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.trafficTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="chatgpt" stroke="#10b981" strokeWidth={2} name="ChatGPT" />
                <Line type="monotone" dataKey="claude" stroke="#6366f1" strokeWidth={2} name="Claude" />
                <Line type="monotone" dataKey="gemini" stroke="#f59e0b" strokeWidth={2} name="Gemini" />
                <Line type="monotone" dataKey="perplexity" stroke="#ec4899" strokeWidth={2} name="Perplexity" />
                <Line type="monotone" dataKey="grok" stroke="#8b5cf6" strokeWidth={2} name="Grok" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Platform Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mentions by Platform</CardTitle>
            <CardDescription>Brand visibility across each AI platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trafficByPlatform.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{platform.platform}</Badge>
                      <span className="text-sm text-muted-foreground">Rate: {platform.ctr}%</span>
                    </div>
                    <span className="text-sm font-medium">{platform.visits} mentions</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(platform.visits / data.totalVisits) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {data.referralSources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mention Types</CardTitle>
              <CardDescription>How your brand appears in AI responses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.referralSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: ${props.value}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.referralSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Platform Details */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance Details</CardTitle>
          <CardDescription>Detailed metrics for each AI platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Platform</th>
                  <th className="text-right py-3 px-4 font-medium">Mentions</th>
                  <th className="text-right py-3 px-4 font-medium">High-Prominence</th>
                  <th className="text-right py-3 px-4 font-medium">Rate</th>
                  <th className="text-right py-3 px-4 font-medium">Avg. Time</th>
                  <th className="text-right py-3 px-4 font-medium">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {data.trafficByPlatform.map((platform) => (
                  <tr key={platform.platform} className="border-b">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{platform.platform}</Badge>
                    </td>
                    <td className="text-right py-3 px-4">{platform.visits.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{platform.clicks.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{platform.ctr}%</td>
                    <td className="text-right py-3 px-4">{formatTime(platform.avgTimeOnPage)}</td>
                    <td className="text-right py-3 px-4">{(100 - platform.bounceRate).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">📊 About This Data</CardTitle>
          <CardDescription>
            Understanding your AI platform traffic metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Mentions:</strong> How many times your brand appeared in AI responses</li>
            <li>• <strong>High-Prominence:</strong> Mentions with visibility score above 50%</li>
            <li>• <strong>Rate:</strong> Percentage of high-prominence mentions</li>
            <li>• <strong>Avg. Time:</strong> Estimated engagement duration (simulated)</li>
            <li>• <strong>Engagement:</strong> Inverse of bounce rate (simulated)</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Data is collected from your brand monitoring runs across AI platforms.
            Run more monitoring to get more comprehensive traffic insights.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
