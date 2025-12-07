"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Loader2, TrendingUp, Users, MousePointerClick, Globe } from "lucide-react"

export default function TrafficPage() {
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<string>("7d")

  // Mock data - in production, this would come from analytics tracking
  const trafficByPlatform = [
    { platform: 'ChatGPT', visits: 1240, clicks: 340, ctr: 27.4 },
    { platform: 'Claude', visits: 980, clicks: 285, ctr: 29.1 },
    { platform: 'Perplexity', visits: 756, clicks: 198, ctr: 26.2 },
    { platform: 'Grok', visits: 420, clicks: 98, ctr: 23.3 },
  ]

  const trafficTrend = [
    { date: 'Jan 1', chatgpt: 45, claude: 32, perplexity: 28, grok: 15 },
    { date: 'Jan 2', chatgpt: 52, claude: 38, perplexity: 31, grok: 18 },
    { date: 'Jan 3', chatgpt: 48, claude: 41, perplexity: 29, grok: 16 },
    { date: 'Jan 4', chatgpt: 61, claude: 45, perplexity: 35, grok: 21 },
    { date: 'Jan 5', chatgpt: 55, claude: 48, perplexity: 32, grok: 19 },
    { date: 'Jan 6', chatgpt: 67, claude: 51, perplexity: 38, grok: 24 },
    { date: 'Jan 7', chatgpt: 71, claude: 54, perplexity: 41, grok: 26 },
  ]

  const referralSources = [
    { name: 'Direct AI Search', value: 65, color: '#6366f1' },
    { name: 'Follow-up Questions', value: 25, color: '#8b5cf6' },
    { name: 'Cited Sources', value: 10, color: '#a78bfa' },
  ]

  const totalVisits = trafficByPlatform.reduce((sum, p) => sum + p.visits, 0)
  const totalClicks = trafficByPlatform.reduce((sum, p) => sum + p.clicks, 0)
  const avgCTR = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traffic Analytics</h1>
          <p className="text-muted-foreground">
            Track traffic coming from AI search platforms
          </p>
        </div>

        {/* Time Range Filter */}
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalVisits.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-2">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-primary" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-2">
              +8.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Avg Click-Through Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{avgCTR}%</div>
            <p className="text-xs text-green-600 mt-2">
              +2.1% from last period
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
            <div className="text-4xl font-bold">{trafficByPlatform.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              AI search engines
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Trends</CardTitle>
          <CardDescription>Daily visits from AI platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trafficTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="chatgpt" stroke="#10b981" strokeWidth={2} name="ChatGPT" />
              <Line type="monotone" dataKey="claude" stroke="#6366f1" strokeWidth={2} name="Claude" />
              <Line type="monotone" dataKey="perplexity" stroke="#f59e0b" strokeWidth={2} name="Perplexity" />
              <Line type="monotone" dataKey="grok" stroke="#8b5cf6" strokeWidth={2} name="Grok" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic by Platform</CardTitle>
            <CardDescription>Visits and clicks from each AI platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficByPlatform.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{platform.platform}</Badge>
                      <span className="text-sm text-muted-foreground">CTR: {platform.ctr}%</span>
                    </div>
                    <span className="text-sm font-medium">{platform.visits} visits</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(platform.visits / totalVisits) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Sources</CardTitle>
            <CardDescription>How users find your content through AI</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={referralSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {referralSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
                  <th className="text-right py-3 px-4 font-medium">Visits</th>
                  <th className="text-right py-3 px-4 font-medium">Clicks</th>
                  <th className="text-right py-3 px-4 font-medium">CTR</th>
                  <th className="text-right py-3 px-4 font-medium">Avg. Time on Page</th>
                  <th className="text-right py-3 px-4 font-medium">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {trafficByPlatform.map((platform) => (
                  <tr key={platform.platform} className="border-b">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{platform.platform}</Badge>
                    </td>
                    <td className="text-right py-3 px-4">{platform.visits.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{platform.clicks.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{platform.ctr}%</td>
                    <td className="text-right py-3 px-4">2m 34s</td>
                    <td className="text-right py-3 px-4">42.5%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Setup Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">📊 Setup Tracking</CardTitle>
          <CardDescription>
            To track real traffic from AI platforms, add the tracking script to your website:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <code>
              {`<script src="https://cdn.aisearchoptimizer.com/track.js"
        data-api-key="your-api-key"></script>`}
            </code>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            This will automatically detect and track visitors coming from AI search platforms.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
