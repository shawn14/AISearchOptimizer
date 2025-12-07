"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  TrendingUp,
  BarChart3,
  Award,
  AlertCircle,
  Eye,
  MessageSquare,
  Sparkles,
  Star
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface CompetitorMention {
  brand: string
  mentions: number
  queries: string[]
  platforms: string[]
}

interface Brand {
  id: string
  name: string
  website_url?: string
  is_primary?: boolean
}

export default function CompetitorsPage() {
  const [loading, setLoading] = useState(true)
  const [competitorMentions, setCompetitorMentions] = useState<CompetitorMention[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [myBrand, setMyBrand] = useState<string | null>(null)
  const [totalQueries, setTotalQueries] = useState(0)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (selectedBrandId) {
      fetchCompetitorData(selectedBrandId)
    }
  }, [selectedBrandId])

  async function fetchBrands() {
    try {
      const brandsResponse = await fetch('/api/brands')
      const brandsData = await brandsResponse.json()
      const allBrands = brandsData.brands || []

      setBrands(allBrands)

      // Auto-select primary brand or first brand
      const primaryBrand = allBrands.find((b: Brand) => b.is_primary)
      const brandToSelect = primaryBrand || allBrands[0]

      if (brandToSelect) {
        setSelectedBrandId(brandToSelect.id)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      setLoading(false)
    }
  }

  async function fetchCompetitorData(brandId: string) {
    setLoading(true)
    try {
      // Get the selected brand
      const brand = brands.find(b => b.id === brandId)

      if (!brand) {
        setLoading(false)
        return
      }

      setMyBrand(brand.name)

      // Get monitoring data
      const monitoringResponse = await fetch('/api/monitoring')
      const monitoringData = await monitoringResponse.json()
      const latestRun = monitoringData.runs?.[0]

      if (!latestRun?.individual_results) {
        setLoading(false)
        return
      }

      setTotalQueries(latestRun.queries_tested)

      // Extract all brand mentions from responses
      const brandMentions = new Map<string, CompetitorMention>()

      latestRun.individual_results.forEach((result: any) => {
        const text = result.response_text?.toLowerCase() || ''

        // Common competitor/brand patterns
        const brandPatterns = [
          /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g // Brand names (capitalized words)
        ]

        // Extract potential brand names (excluding common words)
        const commonWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'have', 'can', 'will', 'some', 'other', 'their', 'what', 'here'])

        const words = result.response_text?.split(/\s+/) || []
        words.forEach((word: string) => {
          const cleaned = word.replace(/[^a-zA-Z]/g, '')
          if (cleaned.length > 2 && /^[A-Z]/.test(cleaned) && !commonWords.has(cleaned.toLowerCase())) {
            const key = cleaned.toLowerCase()

            if (!brandMentions.has(key)) {
              brandMentions.set(key, {
                brand: cleaned,
                mentions: 0,
                queries: [],
                platforms: []
              })
            }

            const mention = brandMentions.get(key)!
            mention.mentions++

            if (!mention.queries.includes(result.query)) {
              mention.queries.push(result.query)
            }
            if (!mention.platforms.includes(result.platform)) {
              mention.platforms.push(result.platform)
            }
          }
        })
      })

      // Filter out your brand and sort by mentions
      const competitors = Array.from(brandMentions.values())
        .filter(m => m.brand.toLowerCase() !== brand.name.toLowerCase())
        .filter(m => m.mentions >= 2) // Only brands mentioned at least twice
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 15) // Top 15

      setCompetitorMentions(competitors)
    } catch (error) {
      console.error('Failed to fetch competitor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = competitorMentions.slice(0, 10).map(comp => ({
    name: comp.brand,
    mentions: comp.mentions,
    queries: comp.queries.length
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading industry landscape...</p>
        </div>
      </div>
    )
  }

  const selectedBrand = brands.find(b => b.id === selectedBrandId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Industry Landscape</h1>
          {brands.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Viewing landscape for:</span>
              <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {selectedBrand?.is_primary && (
                        <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                      )}
                      <span>{selectedBrand?.name || 'Select a brand'}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      <div className="flex items-center gap-2">
                        {brand.is_primary && (
                          <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
                        )}
                        <span>{brand.name}</span>
                        {brand.is_primary && (
                          <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          See which other brands appear alongside {myBrand || 'your brand'} in AI responses
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Brand</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myBrand || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Being tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Brands Detected</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitorMentions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In AI responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Queries Analyzed</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total queries tested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {competitorMentions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Mentioned Brands</CardTitle>
            <CardDescription>Brands that appear most frequently alongside yours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mentions" fill="#6366f1" name="Total Mentions" />
                <Bar dataKey="queries" fill="#f59e0b" name="Unique Queries" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed List */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Mention Details</CardTitle>
          <CardDescription>All brands mentioned in AI responses</CardDescription>
        </CardHeader>
        <CardContent>
          {competitorMentions.length > 0 ? (
            <div className="space-y-3">
              {competitorMentions.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium">{comp.brand}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Mentioned in {comp.queries.length} {comp.queries.length === 1 ? 'query' : 'queries'} across {comp.platforms.length} {comp.platforms.length === 1 ? 'platform' : 'platforms'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{comp.mentions} mentions</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Competitor Data Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Run monitoring to see which brands appear alongside yours
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      {competitorMentions.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Key Insights</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <span className="font-medium">{competitorMentions[0]?.brand}</span> appears most frequently ({competitorMentions[0]?.mentions} mentions)</li>
                  <li>• Total of {competitorMentions.length} different brands mentioned across {totalQueries} queries</li>
                  <li>• AI models are considering an average of {Math.round(competitorMentions.reduce((sum, c) => sum + c.mentions, 0) / totalQueries)} brands per query</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
