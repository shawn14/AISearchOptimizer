"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Lightbulb,
  TrendingUp,
  CheckCircle,
  Circle,
  AlertTriangle,
  Target,
  FileText,
  Zap,
  Award,
  ArrowRight
} from "lucide-react"

interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  category: 'content' | 'technical' | 'visibility' | 'citations'
  status: 'pending' | 'in-progress' | 'completed'
  estimatedImpact: number // percentage improvement
  actions: string[]
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateRecommendations()
  }, [])

  async function generateRecommendations() {
    try {
      // Fetch monitoring and audit data
      const [monitoringRes, auditsRes] = await Promise.all([
        fetch('/api/monitoring'),
        fetch('/api/audits')
      ])

      const monitoringData = await monitoringRes.json()
      const auditsData = await auditsRes.json()

      const recs: Recommendation[] = []

      // Analyze monitoring data
      const latestRun = monitoringData.runs?.[0]
      if (latestRun) {
        if (latestRun.visibility_score < 70) {
          recs.push({
            id: '1',
            title: 'Improve Overall Visibility Score',
            description: `Your current visibility score is ${latestRun.visibility_score}%. Implementing structured data and FAQ schema can significantly boost this.`,
            impact: 'high',
            effort: 'medium',
            category: 'visibility',
            status: 'pending',
            estimatedImpact: 15,
            actions: [
              'Add FAQ schema to your main pages',
              'Implement Article schema for blog posts',
              'Create Q&A content matching common queries',
              'Optimize meta descriptions for AI understanding'
            ]
          })
        }

        const mentionRate = latestRun.total_mentions / latestRun.queries_tested
        if (mentionRate < 0.5) {
          recs.push({
            id: '2',
            title: 'Increase Brand Mention Rate',
            description: `You're mentioned in ${Math.round(mentionRate * 100)}% of queries. Target 60%+ with better content coverage.`,
            impact: 'high',
            effort: 'high',
            category: 'visibility',
            status: 'pending',
            estimatedImpact: 20,
            actions: [
              'Create content for unmissed query categories',
              'Add more authoritative backlinks',
              'Publish case studies and success stories',
              'Engage with industry publications for citations'
            ]
          })
        }
      }

      // Analyze audit data
      const audits = auditsData.audits || []
      const avgAEO = audits.length > 0
        ? audits.reduce((sum: number, a: any) => sum + (a.aeo_score || 0), 0) / audits.length
        : 0

      if (avgAEO < 80 && audits.length > 0) {
        recs.push({
          id: '3',
          title: 'Optimize Pages for AEO',
          description: `Your average AEO score is ${Math.round(avgAEO)}/100. Improving this will dramatically increase AI citations.`,
          impact: 'high',
          effort: 'low',
          category: 'technical',
          status: 'pending',
          estimatedImpact: 12,
          actions: [
            'Add HowTo schema to tutorial pages',
            'Include question-answer pairs in content',
            'Add citations to authoritative sources',
            'Use semantic HTML5 elements (article, section, main)'
          ]
        })
      }

      const pagesWithLowContent = audits.filter((a: any) => (a.content_score || 0) < 70)
      if (pagesWithLowContent.length > 0) {
        recs.push({
          id: '4',
          title: 'Expand Thin Content Pages',
          description: `${pagesWithLowContent.length} pages have low content quality scores. Add depth to these pages.`,
          impact: 'medium',
          effort: 'medium',
          category: 'content',
          status: 'pending',
          estimatedImpact: 8,
          actions: [
            'Increase word count to 1000+ words per page',
            'Add more H2 and H3 headings for structure',
            'Include bulleted lists for scannability',
            'Improve readability (target 60+ Flesch score)'
          ]
        })
      }

      // Citation opportunities
      recs.push({
        id: '5',
        title: 'Create Citation-Worthy Content',
        description: 'AI models prefer citing authoritative, well-researched content with data and sources.',
        impact: 'high',
        effort: 'high',
        category: 'citations',
        status: 'pending',
        estimatedImpact: 18,
        actions: [
          'Publish original research or data studies',
          'Create comprehensive industry guides',
          'Add data visualizations and infographics',
          'Link to .edu and .gov authoritative sources'
        ]
      })

      // Low effort quick wins
      recs.push({
        id: '6',
        title: 'Quick Technical SEO Wins',
        description: 'Fix common technical issues that prevent AI from understanding your content.',
        impact: 'medium',
        effort: 'low',
        category: 'technical',
        status: 'pending',
        estimatedImpact: 5,
        actions: [
          'Add missing canonical tags',
          'Fix images without alt text',
          'Add Open Graph tags for social sharing',
          'Ensure all pages have meta descriptions'
        ]
      })

      // Content freshness
      recs.push({
        id: '7',
        title: 'Update Stale Content',
        description: 'AI models favor recent, up-to-date information. Refresh old content regularly.',
        impact: 'medium',
        effort: 'medium',
        category: 'content',
        status: 'pending',
        estimatedImpact: 10,
        actions: [
          'Review content older than 12 months',
          'Update statistics and data points',
          'Add current year examples',
          'Republish with new publication dates'
        ]
      })

      setRecommendations(recs)
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  function toggleStatus(id: string) {
    setRecommendations(recs =>
      recs.map(rec =>
        rec.id === id
          ? {
              ...rec,
              status: rec.status === 'completed' ? 'pending' : 'completed'
            }
          : rec
      )
    )
  }

  const filteredRecs = recommendations.filter(rec => {
    if (filter === 'all') return true
    return rec.impact === filter
  })

  const completedCount = recommendations.filter(r => r.status === 'completed').length
  const totalImpact = recommendations
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.estimatedImpact, 0)

  const impactColors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    low: 'text-green-600 bg-green-50 border-green-200'
  }

  const effortBadges = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700'
  }

  const categoryIcons = {
    content: FileText,
    technical: Zap,
    visibility: TrendingUp,
    citations: Target
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Smart Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered suggestions to improve your visibility
          </p>
        </div>
        <Button onClick={generateRecommendations} disabled={loading}>
          <Lightbulb className="h-4 w-4 mr-2" />
          Refresh Recommendations
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Recommendations</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actionable improvements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((completedCount / Math.max(recommendations.length, 1)) * 100)}% progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Impact</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalImpact}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Visibility improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by impact:</span>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('high')}
              >
                High Impact
              </Button>
              <Button
                variant={filter === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('medium')}
              >
                Medium Impact
              </Button>
              <Button
                variant={filter === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('low')}
              >
                Low Impact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Analyzing your data and generating recommendations...
            </CardContent>
          </Card>
        ) : filteredRecs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No recommendations found for this filter.
            </CardContent>
          </Card>
        ) : (
          filteredRecs.map((rec) => {
            const CategoryIcon = categoryIcons[rec.category]
            return (
              <Card
                key={rec.id}
                className={rec.status === 'completed' ? 'opacity-60' : ''}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="cursor-pointer flex-shrink-0 mt-1"
                      onClick={() => toggleStatus(rec.id)}
                    >
                      {rec.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{rec.title}</h3>
                            <Badge className={impactColors[rec.impact]}>
                              {rec.impact} impact
                            </Badge>
                            <Badge variant="outline" className={effortBadges[rec.effort]}>
                              {rec.effort} effort
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {rec.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              +{rec.estimatedImpact}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              estimated
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="font-medium text-sm mb-2">Action Steps:</div>
                        <ul className="space-y-1.5">
                          {rec.actions.map((action, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Priority Banner */}
      {recommendations.filter(r => r.impact === 'high' && r.status === 'pending').length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Priority Actions</h3>
                <p className="text-sm text-muted-foreground">
                  You have {recommendations.filter(r => r.impact === 'high' && r.status === 'pending').length} high-impact recommendations pending.
                  Completing these could improve your visibility by up to{' '}
                  <span className="font-semibold text-primary">
                    +{recommendations.filter(r => r.impact === 'high' && r.status === 'pending').reduce((sum, r) => sum + r.estimatedImpact, 0)}%
                  </span>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
