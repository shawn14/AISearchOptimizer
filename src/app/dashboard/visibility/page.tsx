"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Cell } from 'recharts'
import { Loader2, Eye, TrendingUp, Award, Target } from "lucide-react"

interface MonitoringRun {
  id: string
  brand_id: string
  brand_name: string
  visibility_score: number
  total_mentions: number
  queries_tested: number
  timestamp: string
}

export default function VisibilityPage() {
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

  // Calculate current visibility score (average of last 5 runs)
  const latestRuns = filteredRuns.slice(0, 5)
  const currentScore = latestRuns.length > 0
    ? Math.round(latestRuns.reduce((sum, run) => sum + run.visibility_score, 0) / latestRuns.length)
    : 0

  // Calculate trend (compare last 5 vs previous 5)
  const previousRuns = filteredRuns.slice(5, 10)
  const previousScore = previousRuns.length > 0
    ? Math.round(previousRuns.reduce((sum, run) => sum + run.visibility_score, 0) / previousRuns.length)
    : 0
  const trend = previousScore > 0 ? ((currentScore - previousScore) / previousScore * 100).toFixed(1) : "0"

  // Prepare visibility trend data (last 30 runs)
  const visibilityTrendData = filteredRuns
    .slice(0, 30)
    .reverse()
    .map((run, idx) => ({
      date: new Date(run.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: run.visibility_score,
      mentions: run.total_mentions,
      timestamp: run.timestamp,
    }))

  // Calculate visibility distribution
  const scoreRanges = {
    excellent: filteredRuns.filter(r => r.visibility_score >= 80).length,
    good: filteredRuns.filter(r => r.visibility_score >= 60 && r.visibility_score < 80).length,
    fair: filteredRuns.filter(r => r.visibility_score >= 40 && r.visibility_score < 60).length,
    poor: filteredRuns.filter(r => r.visibility_score < 40).length,
  }

  const distributionData = [
    { range: '80-100%', count: scoreRanges.excellent, color: '#10b981' },
    { range: '60-79%', count: scoreRanges.good, color: '#3b82f6' },
    { range: '40-59%', count: scoreRanges.fair, color: '#f59e0b' },
    { range: '0-39%', count: scoreRanges.poor, color: '#ef4444' },
  ]

  // Get visibility ranking
  const getVisibilityRank = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-100 text-green-700", icon: "🏆" }
    if (score >= 60) return { label: "Good", color: "bg-blue-100 text-blue-700", icon: "⭐" }
    if (score >= 40) return { label: "Fair", color: "bg-yellow-100 text-yellow-700", icon: "📊" }
    return { label: "Needs Work", color: "bg-red-100 text-red-700", icon: "⚠️" }
  }

  const rank = getVisibilityRank(currentScore)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visibility Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your brand's visibility across AI search platforms
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Visibility Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="text-6xl font-bold">{currentScore}%</div>
              <div className="flex-1 mb-2">
                <Badge className={rank.color}>
                  {rank.icon} {rank.label}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Average of last 5 monitoring runs
                </p>
              </div>
            </div>
            {previousScore > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <TrendingUp className={`h-4 w-4 ${parseFloat(trend) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${parseFloat(trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(trend) >= 0 ? '+' : ''}{trend}% vs previous period
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {filteredRuns.length > 0 ? Math.max(...filteredRuns.map(r => r.visibility_score)) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Peak visibility achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{filteredRuns.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Monitoring runs performed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visibility Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility Trends Over Time</CardTitle>
          <CardDescription>Track how your visibility score changes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={visibilityTrendData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorScore)"
                strokeWidth={2}
                name="Visibility Score (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Breakdown of visibility scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Occurrences">
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Overall visibility performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    {scoreRanges.excellent}
                  </div>
                  <div>
                    <p className="font-medium">Excellent (80-100%)</p>
                    <p className="text-sm text-muted-foreground">Top visibility</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  {filteredRuns.length > 0 ? Math.round((scoreRanges.excellent / filteredRuns.length) * 100) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {scoreRanges.good}
                  </div>
                  <div>
                    <p className="font-medium">Good (60-79%)</p>
                    <p className="text-sm text-muted-foreground">Strong presence</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {filteredRuns.length > 0 ? Math.round((scoreRanges.good / filteredRuns.length) * 100) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {scoreRanges.fair}
                  </div>
                  <div>
                    <p className="font-medium">Fair (40-59%)</p>
                    <p className="text-sm text-muted-foreground">Room to improve</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">
                  {filteredRuns.length > 0 ? Math.round((scoreRanges.fair / filteredRuns.length) * 100) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {scoreRanges.poor}
                  </div>
                  <div>
                    <p className="font-medium">Needs Work (0-39%)</p>
                    <p className="text-sm text-muted-foreground">Low visibility</p>
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-700">
                  {filteredRuns.length > 0 ? Math.round((scoreRanges.poor / filteredRuns.length) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">💡 Visibility Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Track progress:</strong> Monitor how your visibility changes over time as you optimize</p>
          <p>• <strong>Identify patterns:</strong> See which content updates lead to visibility improvements</p>
          <p>• <strong>Benchmark performance:</strong> Compare your scores across different time periods</p>
          <p>• <strong>Set goals:</strong> Work toward achieving and maintaining excellent (80%+) visibility</p>
        </CardContent>
      </Card>
    </div>
  )
}
