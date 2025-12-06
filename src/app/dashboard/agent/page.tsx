"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Paperclip, Wand2, TrendingDown, BarChart3, FileText, AlertTriangle, Loader2, Bot, Target } from "lucide-react"

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  analysis?: {
    steps?: string[]
    data?: any
  }
}

interface MonitoringRun {
  id: string
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

export default function AgentPage() {
  const [activeTab, setActiveTab] = useState("agent")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Real data
  const [monitoringRuns, setMonitoringRuns] = useState<MonitoringRun[]>([])
  const [audits, setAudits] = useState<PageAudit[]>([])

  // Content generation
  const [contentType, setContentType] = useState("article")
  const [contentTopic, setContentTopic] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Google Analytics
  const [gaConnected, setGaConnected] = useState(false)
  const [gaPropertyId, setGaPropertyId] = useState("")
  const [gaData, setGaData] = useState<any>(null)
  const [showGaDialog, setShowGaDialog] = useState(false)
  const [gaCredentialsFile, setGaCredentialsFile] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
    checkGAConnection()
  }, [])

  async function checkGAConnection() {
    try {
      const response = await fetch('/api/analytics/connect')
      const data = await response.json()

      if (data.connected) {
        setGaConnected(true)
        setGaPropertyId(data.propertyId)
        await fetchGoogleAnalyticsData()
      }
    } catch (error) {
      console.error('Failed to check GA connection:', error)
    }
  }

  async function fetchData() {
    try {
      const [monitoringRes, auditsRes] = await Promise.all([
        fetch('/api/monitoring?limit=10'),
        fetch('/api/audits')
      ])

      const monitoringData = await monitoringRes.json()
      const auditsData = await auditsRes.json()

      setMonitoringRuns(monitoringData.runs || [])
      setAudits(auditsData.audits || [])

      // Generate initial AI message based on real data
      const runs = monitoringData.runs || []
      const pages = auditsData.audits || []

      let initialMessage = 'Hello! I can help analyze your website data, create content, or perform audits.'

      if (runs.length > 0 || pages.length > 0) {
        const avgVisibility = runs.length > 0
          ? Math.round(runs.reduce((sum: number, r: MonitoringRun) => sum + r.visibility_score, 0) / runs.length)
          : 0
        const totalMentions = runs.reduce((sum: number, r: MonitoringRun) => sum + r.total_mentions, 0)
        const totalQueries = runs.reduce((sum: number, r: MonitoringRun) => sum + r.queries_tested, 0)
        const avgAEO = pages.length > 0
          ? Math.round(pages.reduce((sum: number, p: PageAudit) => sum + (p.aeo_score || 0), 0) / pages.length)
          : 0

        initialMessage = `I've analyzed your data:

📊 **Brand Monitoring**: ${runs.length} monitoring runs completed
   • Average visibility: ${avgVisibility}%
   • Brand mentions: ${totalMentions}/${totalQueries} queries
   • Latest brand: ${runs[0]?.brand_name || 'N/A'}

📄 **Page Audits**: ${pages.length} pages analyzed
   • Average AEO score: ${avgAEO}/100
   • Top performing page: ${pages[0]?.page_title || pages[0]?.page_url || 'N/A'}

What would you like to explore? I can help you improve your visibility, optimize content, or run deeper analysis.`
      }

      setMessages([{
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date(),
        analysis: {
          steps: runs.length > 0 ? ['Fetched monitoring data', 'Analyzed brand visibility'] : []
        }
      }])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setMessages([{
        role: 'assistant',
        content: 'Hello! I can help analyze your website data, create content, or perform audits. What would you like to work on today?',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsAnalyzing(true)

    // Simulate AI analysis based on real data
    setTimeout(() => {
      let responseContent = "I'm analyzing your data..."
      const query = input.toLowerCase()

      if (query.includes('visibility') || query.includes('mention')) {
        const avgVis = monitoringRuns.length > 0
          ? Math.round(monitoringRuns.reduce((sum, r) => sum + r.visibility_score, 0) / monitoringRuns.length)
          : 0
        responseContent = `Based on ${monitoringRuns.length} monitoring runs, your average visibility score is ${avgVis}%. ${
          avgVis < 50
            ? 'I recommend focusing on improving your content to increase brand mentions in AI responses.'
            : 'Your visibility is performing well! Consider expanding to more queries to increase reach.'
        }`
      } else if (query.includes('content') || query.includes('page') || query.includes('aeo')) {
        const avgAEO = audits.length > 0
          ? Math.round(audits.reduce((sum, p) => sum + (p.aeo_score || 0), 0) / audits.length)
          : 0
        const avgTech = audits.length > 0
          ? Math.round(audits.reduce((sum, p) => sum + (p.technical_score || 0), 0) / audits.length)
          : 0
        responseContent = `I've analyzed ${audits.length} pages:

**Technical SEO**: ${avgTech}/100
**AEO Score**: ${avgAEO}/100

${avgAEO < 80 ? 'To improve AEO, I recommend:\n1. Add FAQ schema to key pages\n2. Include more structured Q&A content\n3. Add citations and references\n4. Use semantic HTML5 elements' : 'Your AEO is strong! Focus on creating more optimized content to expand coverage.'}`
      } else if (query.includes('improve') || query.includes('optimize')) {
        responseContent = `Here are my top recommendations:

1. **Improve AEO scores** on pages scoring below 80
2. **Increase brand mentions** by targeting more industry-specific queries
3. **Add structured data** (FAQ, HowTo, Article schemas)
4. **Create content clusters** around your top-performing pages

Would you like me to help with any of these specifically?`
      } else {
        responseContent = "I can help you with:\n- Analyzing your brand visibility across AI platforms\n- Auditing pages for AEO optimization\n- Generating content optimized for AI search\n- Tracking your performance over time\n\nWhat would you like to focus on?"
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        analysis: {
          steps: ['Processed request', 'Analyzed data patterns', 'Generated insights'],
          data: {}
        }
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsAnalyzing(false)
    }, 1500)
  }

  // Google Analytics functions
  async function connectGoogleAnalytics() {
    if (!gaPropertyId.trim()) {
      alert('Please enter a Google Analytics Property ID')
      return
    }

    if (!gaCredentialsFile) {
      alert('Please upload your service account credentials JSON file')
      return
    }

    try {
      // First upload the credentials file
      const formData = new FormData()
      formData.append('credentials', gaCredentialsFile)

      const uploadResponse = await fetch('/api/analytics/upload-credentials', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        alert(`Failed to upload credentials: ${uploadData.error}`)
        return
      }

      // Then connect the property
      const response = await fetch('/api/analytics/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: gaPropertyId }),
      })

      const data = await response.json()

      if (response.ok) {
        setGaConnected(true)
        setShowGaDialog(false)
        await fetchGoogleAnalyticsData()
        alert('Google Analytics connected successfully!')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to connect GA:', error)
      alert('Failed to connect. Please try again.')
    }
  }

  async function fetchGoogleAnalyticsData() {
    try {
      const response = await fetch('/api/analytics/data?startDate=7daysAgo&endDate=today')

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

  // Content generation function
  async function generateContent() {
    if (!contentTopic.trim()) {
      alert('Please enter a topic')
      return
    }

    setIsGenerating(true)
    setGeneratedContent("")

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: contentTopic,
          contentType: contentType
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedContent(data.content)
        console.log(`Generated ${data.wordCount} words, cost: $${data.cost.toFixed(4)}`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate metrics from real data
  const topAudits = audits.slice(0, 5)
  const recentRuns = monitoringRuns.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-14 bg-transparent p-0">
          <TabsTrigger
            value="agent"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 h-full"
          >
            Agent
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 h-full"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 h-full"
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 h-full"
          >
            Audit
          </TabsTrigger>
        </TabsList>

        {/* Agent Tab */}
        <TabsContent value="agent" className="flex-1 flex flex-col p-6 space-y-4 mt-0">
          <div className="flex-1 grid grid-cols-[1fr_400px] gap-6 overflow-hidden">
            {/* Chat Area */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, i) => (
                    <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-4`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.analysis && message.analysis.steps && message.analysis.steps.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/40 space-y-1">
                            {message.analysis.steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-1 h-1 rounded-full bg-green-500" />
                                {step}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          <span className="text-sm text-muted-foreground">Analyzing your data...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Input Area */}
              <div className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        placeholder="Ask me anything about your analytics, content, or website..."
                        className="min-h-[60px] resize-none"
                      />
                      <div className="flex flex-col gap-2">
                        <Button size="icon" variant="ghost">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button size="icon" onClick={handleSend} disabled={!input.trim() || isAnalyzing}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Analysis Panel - Real Data */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Monitoring ({monitoringRuns.length})
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      Audits ({audits.length})
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Real Monitoring Data */}
              {monitoringRuns.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Brand Monitoring</h3>
                      <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(monitoringRuns[0].timestamp).toLocaleTimeString()} • {monitoringRuns.length} runs
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Visibility Trend */}
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Visibility Trend</span>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 bg-muted rounded flex items-end justify-between px-2 pb-2 gap-1">
                          {recentRuns.slice(0, 7).reverse().map((run, i) => (
                            <div
                              key={i}
                              className="w-full bg-blue-500 rounded-t"
                              style={{height: `${run.visibility_score}%`}}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          Avg: {Math.round(recentRuns.reduce((sum, r) => sum + r.visibility_score, 0) / recentRuns.length)}%
                        </div>
                      </div>
                    </div>

                    {/* Recent Monitoring Runs */}
                    <div className="border rounded-lg p-3">
                      <div className="text-sm font-medium mb-2">Recent Runs</div>
                      <div className="space-y-2">
                        {recentRuns.slice(0, 3).map((run) => (
                          <div key={run.id} className="text-xs py-1 flex items-center justify-between">
                            <div>
                              <div className="font-medium">{run.brand_name}</div>
                              <div className="text-muted-foreground">
                                {run.total_mentions}/{run.queries_tested} mentions
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{run.visibility_score}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Real Page Audit Data */}
              {audits.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="text-sm font-medium">Audited Pages</div>
                    <p className="text-xs text-muted-foreground">
                      {audits.length} pages analyzed
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-3">
                      <div className="space-y-2">
                        <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 text-xs">
                          <div className="font-medium text-muted-foreground">PAGE</div>
                          <div className="font-medium text-muted-foreground text-right">TECH</div>
                          <div className="font-medium text-muted-foreground text-right">CONT</div>
                          <div className="font-medium text-muted-foreground text-right">AEO</div>
                        </div>
                        {topAudits.map((audit) => (
                          <div key={audit.id} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 text-xs py-1">
                            <div className="truncate">{audit.page_title || new URL(audit.page_url).hostname}</div>
                            <div className={`text-right font-medium ${(audit.technical_score || 0) >= 80 ? 'text-green-600' : (audit.technical_score || 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {audit.technical_score || '-'}
                            </div>
                            <div className={`text-right font-medium ${(audit.content_score || 0) >= 80 ? 'text-green-600' : (audit.content_score || 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {audit.content_score || '-'}
                            </div>
                            <div className={`text-right font-medium ${(audit.aeo_score || 0) >= 80 ? 'text-green-600' : (audit.aeo_score || 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {audit.aeo_score || '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty state */}
              {monitoringRuns.length === 0 && audits.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <p className="text-sm">No data yet. Start by adding a brand or auditing a page.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="flex-1 p-6 mt-0 overflow-y-auto">
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Google Analytics & Search Console</h2>
                <p className="text-muted-foreground">Connect your data sources to unlock AI-powered insights</p>
              </div>
              {!gaConnected && (
                <Button onClick={() => setShowGaDialog(true)}>
                  Connect Google Analytics
                </Button>
              )}
            </div>

            {/* Connection Dialog */}
            {showGaDialog && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Connect Google Analytics</CardTitle>
                  <CardDescription>
                    Upload your service account credentials and enter your GA4 Property ID
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Service Account Credentials</label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => setGaCredentialsFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload the JSON key file from Google Cloud Console
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">GA4 Property ID</label>
                    <input
                      type="text"
                      value={gaPropertyId}
                      onChange={(e) => setGaPropertyId(e.target.value)}
                      placeholder="e.g., 123456789"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Find this in Google Analytics → Admin → Property Settings
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                    <p className="font-semibold">Quick Setup:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to Google Cloud Console</li>
                      <li>Create a Service Account and download JSON key</li>
                      <li>Add service account email to GA property with Viewer role</li>
                      <li>Upload JSON file and enter Property ID above</li>
                    </ol>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={connectGoogleAnalytics}>
                      Connect
                    </Button>
                    <Button variant="outline" onClick={() => setShowGaDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show data if connected, otherwise show empty state */}
            {gaConnected && gaData ? (
              <>
                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{gaData.metrics.totalUsers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Last 7 days
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-sm font-medium text-muted-foreground">Sessions</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{gaData.metrics.totalSessions.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Total sessions
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-sm font-medium text-muted-foreground">Page Views</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{gaData.metrics.totalPageViews.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Total page views
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Pages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages</CardTitle>
                    <CardDescription>Pages with the most page views</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-sm text-muted-foreground">
                          <th className="text-left p-2">PAGE</th>
                          <th className="text-right p-2">PAGE VIEWS</th>
                          <th className="text-right p-2">USERS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gaData.topPages.map((page: any, i: number) => (
                          <tr key={i} className="border-b">
                            <td className="p-2">
                              <div className="font-medium">{page.page}</div>
                              <div className="text-xs text-muted-foreground">{page.url}</div>
                            </td>
                            <td className="text-right p-2">{page.pageViews.toLocaleString()}</td>
                            <td className="text-right p-2">{page.users.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </>
            ) : !gaConnected ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Connect Your Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect Google Analytics and Search Console to see traffic insights, top queries, and performance metrics
                  </p>
                  <Button onClick={() => setShowGaDialog(true)}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="flex-1 p-6 mt-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">I want to make an</span>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="text-lg font-semibold text-orange-600 bg-transparent border-b-2 border-orange-600 pb-1 cursor-pointer"
                >
                  <option value="article">article</option>
                  <option value="blog post">blog post</option>
                  <option value="guide">guide</option>
                  <option value="landing page">landing page</option>
                </select>
                <span className="text-lg">about</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <Textarea
                  value={contentTopic}
                  onChange={(e) => setContentTopic(e.target.value)}
                  placeholder="how to improve website conversion rates with better content strategy"
                  className="min-h-[120px] text-base border-0 focus-visible:ring-0 resize-none"
                  disabled={isGenerating}
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" disabled={isGenerating}>
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach
                    </Button>
                    <Button variant="ghost" size="sm" disabled={isGenerating}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI Enhance
                    </Button>
                  </div>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={generateContent}
                    disabled={isGenerating || !contentTopic.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Article'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Content Display */}
            {generatedContent && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Content</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedContent)
                          alert('Copied to clipboard!')
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedContent("")}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none bg-muted p-6 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm">{generatedContent}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!generatedContent && !isGenerating && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No content generated yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a topic above and click "Generate Article" to create AI-optimized content
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="flex-1 p-0 mt-0">
          <div className="h-full flex">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r bg-card p-4 overflow-y-auto">
              <div className="space-y-1">
                {/* Brand Selector */}
                <div className="mb-4">
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Lottie</option>
                    <option>StockAlarm</option>
                  </select>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  <div className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span className="text-sm">Agent</span>
                  </div>
                  <div className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Knowledge Base</span>
                  </div>

                  {/* Analytics Section */}
                  <div className="pt-2">
                    <div className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm font-medium">Analytics</span>
                    </div>
                    <div className="ml-4 space-y-1 mt-1">
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border-2 border-current" />
                        <span className="text-sm">Visibility</span>
                      </div>
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        <span className="text-sm">Mentions</span>
                      </div>
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                        <TrendingDown className="h-3 w-3" />
                        <span className="text-sm">Traffic</span>
                      </div>
                    </div>
                  </div>

                  {/* Prompts Section */}
                  <div className="pt-2">
                    <div className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Prompts</span>
                    </div>
                    <div className="ml-4 space-y-1 mt-1">
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer text-sm">Your Prompts</div>
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer text-sm">Prompt Research</div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="pt-2">
                    <div className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Content</span>
                    </div>
                    <div className="ml-4 space-y-1 mt-1">
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer text-sm">Articles</div>
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer text-sm">Schedule</div>
                    </div>
                  </div>

                  {/* On-Page Section */}
                  <div className="pt-2">
                    <div className="px-3 py-2 hover:bg-muted rounded-lg cursor-pointer flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">On-Page</span>
                    </div>
                    <div className="ml-4 space-y-1 mt-1">
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer text-sm">Site Health</div>
                      <div className="px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer text-sm">Issues</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 max-w-6xl">
                {/* Header with Search */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search from 24 URLs or titles..."
                      className="w-full px-4 py-2 border rounded-lg pl-10"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</div>
                  </div>
                  <Button variant="outline" size="sm">+ Add Page</Button>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">17/25</div>
                    <Button variant="outline" size="sm">Track 3 pages</Button>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Start Campaign
                    </Button>
                  </div>
                </div>

                {/* Score Gauges */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <h3 className="text-sm font-medium mb-4">Technical</h3>
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeDasharray={`${(audits.length > 0 ? Math.round(audits.reduce((sum, a) => sum + (a.technical_score || 0), 0) / audits.length) : 78) * 100 / 100}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">
                              {audits.length > 0
                                ? Math.round(audits.reduce((sum, a) => sum + (a.technical_score || 0), 0) / audits.length)
                                : 78}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">Technical SEO health and optimization</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <h3 className="text-sm font-medium mb-4">Content Quality</h3>
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeDasharray={`${(audits.length > 0 ? Math.round(audits.reduce((sum, a) => sum + (a.content_score || 0), 0) / audits.length) : 85) * 100 / 100}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">
                              {audits.length > 0
                                ? Math.round(audits.reduce((sum, a) => sum + (a.content_score || 0), 0) / audits.length)
                                : 85}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">Content depth, relevance, and readability</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <h3 className="text-sm font-medium mb-4">AEO</h3>
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="3"
                              strokeDasharray={`${(audits.length > 0 ? Math.round(audits.reduce((sum, a) => sum + (a.aeo_score || 0), 0) / audits.length) : 82) * 100 / 100}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">
                              {audits.length > 0
                                ? Math.round(audits.reduce((sum, a) => sum + (a.aeo_score || 0), 0) / audits.length)
                                : 82}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">AI Engine Optimization</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Page List Table */}
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground">Page URL ({audits.length || 24})</th>
                          <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">Issues</th>
                          <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">Technical</th>
                          <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">Content</th>
                          <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">AEO</th>
                          <th className="text-right p-4 text-sm font-medium text-muted-foreground w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {audits.length > 0 ? (
                          audits.map((audit) => {
                            const issues = [
                              (audit.technical_score || 0) < 80 ? 1 : 0,
                              (audit.content_score || 0) < 80 ? 1 : 0,
                              (audit.aeo_score || 0) < 80 ? 1 : 0
                            ].reduce((a, b) => a + b, 0)

                            return (
                              <tr key={audit.id} className="border-b hover:bg-muted/30">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <div className="font-medium">{audit.page_title || 'Untitled'}</div>
                                    <div className="text-sm text-muted-foreground font-mono">{audit.page_url}</div>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <Badge variant={issues > 0 ? "destructive" : "secondary"}>{issues}</Badge>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-4" style={{
                                    borderColor: (audit.technical_score || 0) >= 80 ? '#10b981' : (audit.technical_score || 0) >= 60 ? '#f59e0b' : '#ef4444'
                                  }}>
                                    <span className="text-sm font-semibold">{audit.technical_score || 0}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-4" style={{
                                    borderColor: (audit.content_score || 0) >= 80 ? '#10b981' : (audit.content_score || 0) >= 60 ? '#f59e0b' : '#ef4444'
                                  }}>
                                    <span className="text-sm font-semibold">{audit.content_score || 0}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-4" style={{
                                    borderColor: (audit.aeo_score || 0) >= 80 ? '#10b981' : (audit.aeo_score || 0) >= 60 ? '#f59e0b' : '#ef4444'
                                  }}>
                                    <span className="text-sm font-semibold">{audit.aeo_score || 0}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <Button variant="ghost" size="sm" className="text-orange-600">
                                    Run
                                  </Button>
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              No pages audited yet. Add a page to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
