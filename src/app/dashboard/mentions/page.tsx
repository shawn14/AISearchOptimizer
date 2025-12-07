"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Loader2, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown, Minus } from "lucide-react"

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

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444',
}

export default function MentionsPage() {
  const [loading, setLoading] = useState(true)
  const [monitoringRuns, setMonitoringRuns] = useState<MonitoringRun[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("all")

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

  // Aggregate all mentions
  const allMentions: BrandMentionResult[] = []
  filteredRuns.forEach(run => {
    if (run.individual_results) {
      run.individual_results.forEach(result => {
        if (result.mentioned) {
          allMentions.push(result)
        }
      })
    }
  })

  // Calculate sentiment distribution
  const sentimentCounts = {
    positive: allMentions.filter(m => m.sentiment === 'positive').length,
    neutral: allMentions.filter(m => m.sentiment === 'neutral').length,
    negative: allMentions.filter(m => m.sentiment === 'negative').length,
  }

  const sentimentData = [
    { name: 'Positive', value: sentimentCounts.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: sentimentCounts.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: sentimentCounts.negative, color: SENTIMENT_COLORS.negative },
  ].filter(item => item.value > 0)

  // Calculate platform distribution
  const platformMentions: Record<string, { positive: number; neutral: number; negative: number }> = {}
  allMentions.forEach(mention => {
    if (!platformMentions[mention.platform]) {
      platformMentions[mention.platform] = { positive: 0, neutral: 0, negative: 0 }
    }
    platformMentions[mention.platform][mention.sentiment]++
  })

  const platformData = Object.entries(platformMentions).map(([platform, counts]) => ({
    platform,
    positive: counts.positive,
    neutral: counts.neutral,
    negative: counts.negative,
  }))

  // Calculate average prominence by sentiment
  const avgProminenceBySentiment = {
    positive: sentimentCounts.positive > 0
      ? Math.round(allMentions.filter(m => m.sentiment === 'positive').reduce((sum, m) => sum + m.prominence_score, 0) / sentimentCounts.positive)
      : 0,
    neutral: sentimentCounts.neutral > 0
      ? Math.round(allMentions.filter(m => m.sentiment === 'neutral').reduce((sum, m) => sum + m.prominence_score, 0) / sentimentCounts.neutral)
      : 0,
    negative: sentimentCounts.negative > 0
      ? Math.round(allMentions.filter(m => m.sentiment === 'negative').reduce((sum, m) => sum + m.prominence_score, 0) / sentimentCounts.negative)
      : 0,
  }

  // Get recent mentions
  const recentMentions = allMentions.slice(0, 20)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentions Analysis</h1>
          <p className="text-muted-foreground">
            Deep dive into how your brand is mentioned across AI platforms
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
            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{allMentions.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {filteredRuns.length} monitoring {filteredRuns.length === 1 ? 'run' : 'runs'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              Positive Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{sentimentCounts.positive}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {allMentions.length > 0 ? Math.round((sentimentCounts.positive / allMentions.length) * 100) : 0}% of all mentions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Minus className="h-4 w-4 text-gray-600" />
              Neutral Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{sentimentCounts.neutral}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {allMentions.length > 0 ? Math.round((sentimentCounts.neutral / allMentions.length) * 100) : 0}% of all mentions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-600" />
              Negative Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{sentimentCounts.negative}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {allMentions.length > 0 ? Math.round((sentimentCounts.negative / allMentions.length) * 100) : 0}% of all mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Overall sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Sentiment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment by Platform</CardTitle>
            <CardDescription>How each platform mentions your brand</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} name="Positive" />
                <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} name="Neutral" />
                <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} name="Negative" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Prominence by Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle>Average Prominence by Sentiment</CardTitle>
          <CardDescription>How prominently your brand is featured based on sentiment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positive Mentions</p>
                <p className="text-2xl font-bold mt-1">{avgProminenceBySentiment.positive}%</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Neutral Mentions</p>
                <p className="text-2xl font-bold mt-1">{avgProminenceBySentiment.neutral}%</p>
              </div>
              <Minus className="h-8 w-8 text-gray-600" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Negative Mentions</p>
                <p className="text-2xl font-bold mt-1">{avgProminenceBySentiment.negative}%</p>
              </div>
              <ThumbsDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Mentions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Mentions</CardTitle>
          <CardDescription>Latest brand mentions with context</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMentions.length > 0 ? recentMentions.map((mention, idx) => (
              <div key={idx} className="border-l-4 pl-4 py-3" style={{ borderColor: SENTIMENT_COLORS[mention.sentiment] }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{mention.platform}</Badge>
                    <Badge variant={mention.sentiment === 'positive' ? 'default' : mention.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                      {mention.sentiment}
                    </Badge>
                    <Badge variant="outline">Prominence: {mention.prominence_score}%</Badge>
                    {mention.position && (
                      <Badge variant="outline">Position: {mention.position}</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium mb-2">{mention.query}</p>
                {mention.context && (
                  <div className="bg-muted p-3 rounded text-sm">
                    <p className="text-muted-foreground italic">...{mention.context}...</p>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center text-muted-foreground py-8">
                No mentions data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
