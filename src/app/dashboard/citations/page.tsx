"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Quote,
  TrendingUp,
  ExternalLink,
  Search,
  Filter,
  Download,
  Lightbulb,
  Globe,
  BarChart3
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface Citation {
  url: string
  platform: string
  query: string
  sentiment: 'positive' | 'neutral' | 'negative'
  mentioned: boolean
  timestamp: string
  context: string
  citationText: string
}

interface URLStat {
  url: string
  domain: string
  mentions: number
  platforms: string[]
  queries: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  first_seen: string
  last_seen: string
}

export default function CitationsPage() {
  const [citations, setCitations] = useState<Citation[]>([])
  const [urlStats, setUrlStats] = useState<URLStat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all')
  const [monitoring, setMonitoring] = useState(false)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [monitoringStatus, setMonitoringStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchCitations()
  }, [])

  async function fetchCitations() {
    try {
      // Fetch brands to get the brand ID
      const brandsResponse = await fetch('/api/brands')
      const brandsData = await brandsResponse.json()
      const brand = brandsData.brands?.[0]

      if (!brand) {
        setLoading(false)
        return
      }

      setBrandId(brand.id)

      // Fetch citations data
      const response = await fetch(`/api/citations?brandId=${brand.id}`)
      const data = await response.json()

      setCitations(data.citations || [])
      setUrlStats(data.url_stats || [])
    } catch (error) {
      console.error('Failed to fetch citations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function runMonitoring() {
    if (!brandId) {
      setMonitoringStatus('No brand found. Please create a brand first.')
      setTimeout(() => setMonitoringStatus(null), 5000)
      return
    }

    setMonitoring(true)
    setMonitoringStatus('Running monitoring across AI platforms...')

    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Monitoring failed')
      }

      // Refresh citations after monitoring completes
      setMonitoringStatus('Refreshing citation data...')
      await fetchCitations()

      // Re-fetch to get updated count
      const citationsResponse = await fetch(`/api/citations?brandId=${brandId}`)
      const citationsData = await citationsResponse.json()
      const citationCount = citationsData.total_citations || 0

      setMonitoringStatus(`✓ Monitoring complete! Found ${data.result?.total_mentions || 0} brand mentions and ${citationCount} source citations.`)
      setTimeout(() => setMonitoringStatus(null), 10000)
    } catch (error: any) {
      console.error('Failed to run monitoring:', error)
      setMonitoringStatus(`✗ Failed to run monitoring: ${error.message}`)
      setTimeout(() => setMonitoringStatus(null), 10000)
    } finally {
      setMonitoring(false)
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
  const uniqueUrls = new Set(filteredCitations.map(c => c.url)).size

  const platformBreakdown = {
    ChatGPT: filteredCitations.filter(c => c.platform === 'Chatgpt').length,
    Claude: filteredCitations.filter(c => c.platform === 'Claude').length,
    Perplexity: filteredCitations.filter(c => c.platform === 'Perplexity').length,
    Grok: filteredCitations.filter(c => c.platform === 'Grok').length,
  }

  const sentimentBreakdown = {
    positive: filteredCitations.filter(c => c.sentiment === 'positive').length,
    neutral: filteredCitations.filter(c => c.sentiment === 'neutral').length,
    negative: filteredCitations.filter(c => c.sentiment === 'negative').length,
  }

  // Top domains
  const domainCounts = new Map<string, number>()
  urlStats.forEach(stat => {
    domainCounts.set(stat.domain, (domainCounts.get(stat.domain) || 0) + stat.mentions)
  })

  const topDomains = Array.from(domainCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, citations: count }))

  const platformChartData = Object.entries(platformBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([platform, count]) => ({
      platform,
      citations: count
    }))

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b']

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Source Citations</h1>
          <p className="text-muted-foreground">
            Track which URLs and domains AI platforms cite when mentioning your brand
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runMonitoring}
            disabled={monitoring || !brandId}
            className="bg-primary hover:bg-primary/90"
          >
            {monitoring ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Running...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Run Monitoring
              </>
            )}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
              Across all monitoring runs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique URLs</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUrls}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Distinct source URLs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Domain</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {topDomains[0]?.domain || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {topDomains[0]?.citations || 0} citations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg per URL</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uniqueUrls > 0 ? (totalCitations / uniqueUrls).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Citations per URL
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Cited Domains</CardTitle>
          </CardHeader>
          <CardContent>
            {topDomains.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topDomains}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="domain" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="citations" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No citation data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Citations by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            {platformChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={platformChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.platform} ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="citations"
                    nameKey="platform"
                  >
                    {platformChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No citation data available
              </div>
            )}
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
              <option value="Chatgpt">ChatGPT</option>
              <option value="Claude">Claude</option>
              <option value="Perplexity">Perplexity</option>
              <option value="Grok">Grok</option>
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
      {totalCitations === 0 && !loading && (
        <Card className="bg-blue-50 border-blue-200 border-2">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2 text-blue-900">Why No Citations?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Citations depend on which AI platforms you're monitoring and whether they include source URLs in responses:
                </p>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">✓ Perplexity:</span>
                    <span>Always cites sources with URLs - best for citation tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">✗ ChatGPT:</span>
                    <span>Doesn't cite sources in standard responses (no URLs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">~ Claude:</span>
                    <span>Occasionally includes URLs when relevant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">~ Grok:</span>
                    <span>Sometimes cites sources depending on the query</span>
                  </li>
                </ul>
                <p className="text-sm text-blue-800 mt-3 font-medium">
                  💡 To see citation data, ensure Perplexity monitoring is enabled and working (requires Perplexity API key).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {totalCitations > 0 && totalCitations < 5 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Improve Your Citation Rate</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Create high-quality, authoritative content that AI platforms can reference</li>
                  <li>• Include data, statistics, and original research in your content</li>
                  <li>• Build backlinks from .edu, .gov, and trusted domains</li>
                  <li>• Add structured data (Schema.org) to help AI understand your content</li>
                  <li>• Publish content on platforms that AI engines frequently cite</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* URL Citation Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Most Cited URLs ({urlStats.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading citation data...</div>
            ) : urlStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No citation data found. Run monitoring to collect citations.
              </div>
            ) : (
              urlStats.slice(0, 20).map((stat, index) => (
                <div key={stat.url} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={stat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline text-primary flex items-center gap-1 break-all"
                        >
                          {stat.domain}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {stat.url}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-xl font-bold">{stat.mentions}</div>
                      <p className="text-xs text-muted-foreground">citations</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Platforms</p>
                      <div className="flex flex-wrap gap-1">
                        {stat.platforms.map(platform => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Sentiment</p>
                      <div className="flex gap-2">
                        {stat.sentiment.positive > 0 && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            +{stat.sentiment.positive}
                          </Badge>
                        )}
                        {stat.sentiment.neutral > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ~{stat.sentiment.neutral}
                          </Badge>
                        )}
                        {stat.sentiment.negative > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{stat.sentiment.negative}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-muted">
                    <p className="text-xs text-muted-foreground">
                      Cited in {stat.queries.length} {stat.queries.length === 1 ? 'query' : 'queries'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Citations */}
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
              filteredCitations.slice(0, 20).map((citation, index) => (
                <div key={`${citation.url}-${index}`} className="bg-muted/30 rounded-lg p-4">
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
                      {new Date(citation.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-start gap-2 mb-2">
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium">{citation.query}</p>
                    </div>
                  </div>

                  {citation.citationText && (
                    <div className="bg-background/50 rounded-lg p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <Quote className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm italic">"{citation.citationText}"</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-primary truncate"
                    >
                      {citation.url}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
