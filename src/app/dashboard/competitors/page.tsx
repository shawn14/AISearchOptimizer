"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  BarChart3,
  Award,
  AlertCircle
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface Competitor {
  id: string
  name: string
  visibility_score: number
  total_mentions: number
  queries_tested: number
  avg_sentiment: number
  trend: 'up' | 'down' | 'stable'
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [newCompetitorName, setNewCompetitorName] = useState("")
  const [loading, setLoading] = useState(false)
  const [myBrand, setMyBrand] = useState<Competitor | null>(null)

  useEffect(() => {
    fetchCompetitors()
  }, [])

  async function fetchCompetitors() {
    try {
      // Fetch monitoring runs
      const response = await fetch('/api/monitoring')
      const data = await response.json()

      // Get latest run for "my brand"
      const latestRun = data.runs?.[0]
      if (latestRun) {
        setMyBrand({
          id: 'my-brand',
          name: latestRun.brand_name,
          visibility_score: latestRun.visibility_score,
          total_mentions: latestRun.total_mentions,
          queries_tested: latestRun.queries_tested,
          avg_sentiment: 0.7,
          trend: 'up'
        })
      }

      // Mock competitor data for now
      const mockCompetitors: Competitor[] = [
        {
          id: '1',
          name: 'Competitor A',
          visibility_score: 65,
          total_mentions: 45,
          queries_tested: 100,
          avg_sentiment: 0.6,
          trend: 'stable'
        },
        {
          id: '2',
          name: 'Competitor B',
          visibility_score: 72,
          total_mentions: 58,
          queries_tested: 100,
          avg_sentiment: 0.65,
          trend: 'up'
        }
      ]

      setCompetitors(mockCompetitors)
    } catch (error) {
      console.error('Failed to fetch competitors:', error)
    }
  }

  async function addCompetitor() {
    if (!newCompetitorName.trim()) return

    setLoading(true)
    try {
      // In a real implementation, this would trigger monitoring for the competitor
      const newCompetitor: Competitor = {
        id: Date.now().toString(),
        name: newCompetitorName,
        visibility_score: Math.floor(Math.random() * 40) + 40,
        total_mentions: Math.floor(Math.random() * 50) + 20,
        queries_tested: 100,
        avg_sentiment: 0.5 + Math.random() * 0.3,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
      }

      setCompetitors([...competitors, newCompetitor])
      setNewCompetitorName("")
    } catch (error) {
      console.error('Failed to add competitor:', error)
    } finally {
      setLoading(false)
    }
  }

  function removeCompetitor(id: string) {
    setCompetitors(competitors.filter(c => c.id !== id))
  }

  // Prepare comparison data
  const allBrands = myBrand ? [myBrand, ...competitors] : competitors

  const comparisonData = [
    {
      metric: 'Visibility',
      [myBrand?.name || 'You']: myBrand?.visibility_score || 0,
      ...Object.fromEntries(competitors.map(c => [c.name, c.visibility_score]))
    },
    {
      metric: 'Mentions',
      [myBrand?.name || 'You']: myBrand ? (myBrand.total_mentions / myBrand.queries_tested * 100) : 0,
      ...Object.fromEntries(competitors.map(c => [c.name, (c.total_mentions / c.queries_tested * 100)]))
    },
    {
      metric: 'Sentiment',
      [myBrand?.name || 'You']: myBrand ? (myBrand.avg_sentiment * 100) : 0,
      ...Object.fromEntries(competitors.map(c => [c.name, c.avg_sentiment * 100]))
    }
  ]

  // Radar chart data
  const radarData = [
    {
      subject: 'Visibility',
      You: myBrand?.visibility_score || 0,
      ...Object.fromEntries(competitors.slice(0, 2).map(c => [c.name, c.visibility_score]))
    },
    {
      subject: 'Mentions',
      You: myBrand ? (myBrand.total_mentions / myBrand.queries_tested * 100) : 0,
      ...Object.fromEntries(competitors.slice(0, 2).map(c => [c.name, (c.total_mentions / c.queries_tested * 100)]))
    },
    {
      subject: 'Sentiment',
      You: myBrand ? (myBrand.avg_sentiment * 100) : 0,
      ...Object.fromEntries(competitors.slice(0, 2).map(c => [c.name, c.avg_sentiment * 100]))
    },
    {
      subject: 'Coverage',
      You: myBrand ? 75 : 0,
      ...Object.fromEntries(competitors.slice(0, 2).map(c => [c.name, Math.random() * 30 + 50]))
    }
  ]

  // Calculate rankings
  const rankings = allBrands
    .sort((a, b) => b.visibility_score - a.visibility_score)
    .map((brand, index) => ({ ...brand, rank: index + 1 }))

  const myRank = rankings.find(r => r.id === 'my-brand')?.rank || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Competitor Analysis</h1>
          <p className="text-muted-foreground">
            Track and compare your performance against competitors
          </p>
        </div>
      </div>

      {/* Add Competitor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Competitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter competitor brand name..."
              value={newCompetitorName}
              onChange={(e) => setNewCompetitorName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
              className="flex-1"
            />
            <Button onClick={addCompetitor} disabled={loading || !newCompetitorName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            We'll start monitoring this competitor across all AI platforms
          </p>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Rank</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{myRank}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {allBrands.length} brands
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Visibility Gap</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myBrand && competitors.length > 0
                ? `${Math.abs(myBrand.visibility_score - Math.max(...competitors.map(c => c.visibility_score)))}%`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              To #1 competitor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tracking</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Competitors monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Share of Voice</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myBrand ? Math.round((myBrand.total_mentions / allBrands.reduce((sum, b) => sum + b.total_mentions, 0)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Of total mentions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Radar Comparison */}
      {myBrand && competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competitive Positioning</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="You" dataKey="You" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                {competitors.slice(0, 2).map((comp, i) => (
                  <Radar
                    key={comp.id}
                    name={comp.name}
                    dataKey={comp.name}
                    stroke={i === 0 ? '#f59e0b' : '#10b981'}
                    fill={i === 0 ? '#f59e0b' : '#10b981'}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Competitor Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Your Brand */}
        {myBrand && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>{myBrand.name}</CardTitle>
                  <Badge>You</Badge>
                </div>
                <Badge variant={myBrand.trend === 'up' ? 'default' : myBrand.trend === 'down' ? 'destructive' : 'secondary'}>
                  {myBrand.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> :
                   myBrand.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                  {myBrand.trend}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Visibility Score</div>
                  <div className="text-2xl font-bold">{myBrand.visibility_score}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Mentions</div>
                  <div className="text-2xl font-bold">{myBrand.total_mentions}/{myBrand.queries_tested}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Sentiment</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${myBrand.avg_sentiment * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(myBrand.avg_sentiment * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competitors */}
        {competitors.map((competitor) => (
          <Card key={competitor.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>{competitor.name}</CardTitle>
                  <Badge variant={competitor.trend === 'up' ? 'default' : competitor.trend === 'down' ? 'destructive' : 'secondary'}>
                    {competitor.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> :
                     competitor.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                    {competitor.trend}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCompetitor(competitor.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Visibility Score</div>
                  <div className="text-2xl font-bold">{competitor.visibility_score}%</div>
                  {myBrand && (
                    <div className={`text-xs mt-1 ${competitor.visibility_score > myBrand.visibility_score ? 'text-red-600' : 'text-green-600'}`}>
                      {competitor.visibility_score > myBrand.visibility_score ? '+' : ''}{competitor.visibility_score - myBrand.visibility_score} vs you
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Mentions</div>
                  <div className="text-2xl font-bold">{competitor.total_mentions}/{competitor.queries_tested}</div>
                  {myBrand && (
                    <div className={`text-xs mt-1 ${competitor.total_mentions > myBrand.total_mentions ? 'text-red-600' : 'text-green-600'}`}>
                      {competitor.total_mentions > myBrand.total_mentions ? '+' : ''}{competitor.total_mentions - myBrand.total_mentions} vs you
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Sentiment</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${competitor.avg_sentiment * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(competitor.avg_sentiment * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights */}
      {myBrand && competitors.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Competitive Insights</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {myBrand.visibility_score < Math.max(...competitors.map(c => c.visibility_score)) && (
                    <li>• Focus on improving visibility - you're behind the leader by {Math.max(...competitors.map(c => c.visibility_score)) - myBrand.visibility_score} points</li>
                  )}
                  {myBrand.total_mentions < Math.max(...competitors.map(c => c.total_mentions)) && (
                    <li>• Increase content coverage - competitors are getting more mentions per query</li>
                  )}
                  {myBrand.avg_sentiment < Math.max(...competitors.map(c => c.avg_sentiment)) && (
                    <li>• Improve brand perception - sentiment scores lag behind top performers</li>
                  )}
                  <li>• Your rank: #{myRank} - {myRank === 1 ? "You're leading!" : `${myRank - 1} brands to overtake`}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {competitors.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Competitors Added</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add competitors to track their AI search performance and compare against your brand
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
