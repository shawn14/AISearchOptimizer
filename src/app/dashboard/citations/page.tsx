"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Quote,
  TrendingUp,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  Download,
  Lightbulb
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface Citation {
  id: string
  query: string
  platform: 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini'
  citationText: string
  context: string
  sourceUrl?: string
  timestamp: Date
  sentiment: 'positive' | 'neutral' | 'negative'
}

export default function CitationsPage() {
  const [citations, setCitations] = useState<Citation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all')

  useEffect(() => {
    fetchCitations()
  }, [])

  async function fetchCitations() {
    try {
      // For now, we'll generate mock data from real monitoring runs
      const response = await fetch('/api/monitoring?limit=50')
      const data = await response.json()

      // Extract citations from monitoring results
      const extractedCitations: Citation[] = []

      data.runs?.forEach((run: any) => {
        run.individual_results?.forEach((result: any) => {
          if (result.mentioned) {
            // Extract citation from the response
            const response = result.response || ''
            const sentences = response.split(/[.!?]+/)

            sentences.forEach((sentence: string) => {
              if (sentence.toLowerCase().includes(run.brand_name.toLowerCase())) {
                extractedCitations.push({
                  id: `${run.id}-${result.query}-${Math.random()}`,
                  query: result.query,
                  platform: result.platform,
                  citationText: sentence.trim(),
                  context: response.substring(0, 200) + '...',
                  sourceUrl: result.source_url,
                  timestamp: new Date(run.timestamp),
                  sentiment: result.sentiment || 'neutral'
                })
              }
            })
          }
        })
      })

      setCitations(extractedCitations)
    } catch (error) {
      console.error('Failed to fetch citations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter citations
  const filteredCitations = citations.filter(c => {
    if (selectedPlatform !== 'all' && c.platform !== selectedPlatform) return false
    if (selectedSentiment !== 'all' && c.sentiment !== selectedSentiment) return false
    return true
  })

  // Calculate stats
  const totalCitations = filteredCitations.length
  const citationsThisWeek = filteredCitations.filter(c => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return c.timestamp >= weekAgo
  }).length

  const platformBreakdown = {
    ChatGPT: filteredCitations.filter(c => c.platform === 'ChatGPT').length,
    Claude: filteredCitations.filter(c => c.platform === 'Claude').length,
    Perplexity: filteredCitations.filter(c => c.platform === 'Perplexity').length,
    Gemini: filteredCitations.filter(c => c.platform === 'Gemini').length,
  }

  const sentimentBreakdown = {
    positive: filteredCitations.filter(c => c.sentiment === 'positive').length,
    neutral: filteredCitations.filter(c => c.sentiment === 'neutral').length,
    negative: filteredCitations.filter(c => c.sentiment === 'negative').length,
  }

  // Citation trend data (last 30 days)
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const count = filteredCitations.filter(c => {
      const cDate = new Date(c.timestamp)
      return cDate.toDateString() === date.toDateString()
    }).length

    return { date: dateStr, citations: count }
  })

  const platformChartData = Object.entries(platformBreakdown).map(([platform, count]) => ({
    platform,
    citations: count
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Citation Management</h1>
          <p className="text-muted-foreground">
            Track and analyze how AI platforms cite your brand
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Citations</CardTitle>
              <Quote className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCitations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citationsThisWeek}</div>
            <p className="text-xs text-green-600 mt-1">
              +{Math.round((citationsThisWeek / Math.max(totalCitations, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Positive Sentiment</CardTitle>
              <Quote className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentBreakdown.positive}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((sentimentBreakdown.positive / Math.max(totalCitations, 1)) * 100)}% of citations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Platform</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(platformBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.entries(platformBreakdown).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} citations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Citation Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="citations" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Citations by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="platform" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="citations" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-1.5 bg-muted/30 rounded-lg text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="ChatGPT">ChatGPT</option>
              <option value="Claude">Claude</option>
              <option value="Perplexity">Perplexity</option>
              <option value="Gemini">Gemini</option>
            </select>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="px-3 py-1.5 bg-muted/30 rounded-lg text-sm"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {totalCitations < 10 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Improve Your Citation Rate</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Add FAQ schema to your key pages to appear in more AI responses</li>
                  <li>• Create content that directly answers common questions in your industry</li>
                  <li>• Include authoritative sources and citations in your content</li>
                  <li>• Use semantic HTML and structured data for better AI understanding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Citations List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Citations ({filteredCitations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading citations...</div>
            ) : filteredCitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No citations found. Run monitoring to collect citation data.
              </div>
            ) : (
              filteredCitations.slice(0, 20).map((citation) => (
                <div key={citation.id} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{citation.platform}</Badge>
                      <Badge
                        variant={
                          citation.sentiment === 'positive' ? 'default' :
                          citation.sentiment === 'negative' ? 'destructive' :
                          'outline'
                        }
                      >
                        {citation.sentiment}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {citation.timestamp.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-start gap-2 mb-2">
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium">{citation.query}</p>
                    </div>
                  </div>

                  <div className="bg-background/50 rounded-lg p-3 mb-2">
                    <div className="flex items-start gap-2">
                      <Quote className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm italic">"{citation.citationText}"</p>
                    </div>
                  </div>

                  {citation.sourceUrl && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <a href={citation.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        View source
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
