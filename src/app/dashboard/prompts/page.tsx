"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Lightbulb, Target, Zap, BookmarkPlus, Loader2 } from "lucide-react"

interface TrendingPrompt {
  id: string
  prompt: string
  category: string
  intent: string
  reasoning: string
}

interface TrendingPromptsData {
  prompts: TrendingPrompt[]
  hasData: boolean
  brandName?: string
  industry?: string
}

export default function PromptResearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [data, setData] = useState<TrendingPromptsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTrendingPrompts() {
      try {
        const response = await fetch("/api/trending-prompts")
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch trending prompts:", error)
        setData({ prompts: [], hasData: false })
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrendingPrompts()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || !data.hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompt Research</h1>
          <p className="text-muted-foreground">
            Discover what people are asking AI about your industry
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Brand Data Found</h3>
              <p className="text-muted-foreground mb-6">
                Add a brand to see trending prompts relevant to your industry
              </p>
              <Button asChild>
                <a href="/dashboard/brands">Add Your Brand</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const trendingPrompts = data.prompts

  // High-value queries (research and decision intent)
  const highValuePrompts = trendingPrompts.filter(p =>
    p.intent === 'decision' || p.intent === 'comparison'
  )

  // Categories
  const categories = ["all", ...Array.from(new Set(trendingPrompts.map(p => p.category)))]

  const filteredPrompts = selectedCategory === "all"
    ? trendingPrompts
    : trendingPrompts.filter(p => p.category === selectedCategory)

  const getIntentColor = (intent: string) => {
    switch(intent) {
      case "decision": return "text-green-600 bg-green-50"
      case "comparison": return "text-blue-600 bg-blue-50"
      case "research": return "text-purple-600 bg-purple-50"
      case "learning": return "text-orange-600 bg-orange-50"
      case "evaluation": return "text-yellow-600 bg-yellow-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prompt Research</h1>
        <p className="text-muted-foreground">
          {data.brandName && data.industry
            ? `Discover what people are asking AI about ${data.brandName} and the ${data.industry} industry`
            : "Discover what people are asking AI about your industry"
          }
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Total Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{trendingPrompts.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              AI-generated for {data.brandName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              High-Value Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{highValuePrompts.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Decision & comparison intent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Query types covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts or enter a topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>Research Topic</Button>
          </div>
          <div className="flex gap-2 mt-4">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Categories" : category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High-Value Highlights */}
      {highValuePrompts.length > 0 && (
        <Card className="border-green-500/50 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              High-Value Queries
            </CardTitle>
            <CardDescription>
              Decision and comparison intent queries - users actively choosing solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highValuePrompts.slice(0, 5).map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{prompt.prompt}</p>
                    <p className="text-sm text-muted-foreground mt-1">{prompt.reasoning}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className={`text-xs ${getIntentColor(prompt.intent)}`}>
                        {prompt.intent}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {prompt.category}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All AI-Generated Queries */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Monitoring Queries</CardTitle>
          <CardDescription>Queries where {data.brandName} should be mentioned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-base mb-1">{prompt.prompt}</p>
                      <p className="text-sm text-muted-foreground mb-2">{prompt.reasoning}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs ${getIntentColor(prompt.intent)}`}>
                          {prompt.intent}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {prompt.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    Monitor
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">🤖 How AI Query Generation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>AI Analysis:</strong> Claude analyzes your brand, industry, and website to understand your positioning</p>
          <p>• <strong>Smart Generation:</strong> Generates queries across different buyer journey stages (research, comparison, decision)</p>
          <p>• <strong>Intent Categorization:</strong> Each query is classified by user intent and category for strategic monitoring</p>
          <p>• <strong>Reasoning Provided:</strong> Every query includes why it matters for your brand visibility</p>
          <p>• <strong>Monitor & Track:</strong> Use these queries to track your LLM visibility across ChatGPT, Claude, Gemini, Perplexity & Grok</p>
        </CardContent>
      </Card>
    </div>
  )
}
