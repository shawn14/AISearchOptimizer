"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Lightbulb, Target, Zap, BookmarkPlus } from "lucide-react"

export default function PromptResearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Mock trending prompts data
  const trendingPrompts = [
    {
      id: "1",
      prompt: "What are the best AI search optimization tools?",
      volume: 1240,
      difficulty: "Medium",
      category: "Tools",
      trend: "+45%",
      competitors: 12
    },
    {
      id: "2",
      prompt: "How to optimize website for AI search engines",
      volume: 980,
      difficulty: "High",
      category: "SEO",
      trend: "+32%",
      competitors: 18
    },
    {
      id: "3",
      prompt: "Best practices for ChatGPT visibility",
      volume: 756,
      difficulty: "Medium",
      category: "Best Practices",
      trend: "+28%",
      competitors: 8
    },
    {
      id: "4",
      prompt: "AI search vs traditional SEO differences",
      volume: 620,
      difficulty: "Low",
      category: "Education",
      trend: "+67%",
      competitors: 5
    },
    {
      id: "5",
      prompt: "Perplexity AI citation strategies",
      volume: 420,
      difficulty: "Medium",
      category: "Strategy",
      trend: "+91%",
      competitors: 6
    },
  ]

  // Opportunity prompts (low competition, high volume)
  const opportunityPrompts = trendingPrompts.filter(p => p.competitors < 10 && p.volume > 500)

  // Categories
  const categories = ["all", "Tools", "SEO", "Best Practices", "Education", "Strategy"]

  const filteredPrompts = selectedCategory === "all"
    ? trendingPrompts
    : trendingPrompts.filter(p => p.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Low": return "text-green-600 bg-green-50"
      case "Medium": return "text-yellow-600 bg-yellow-50"
      case "High": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prompt Research</h1>
        <p className="text-muted-foreground">
          Discover what people are asking AI about your industry
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trending Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{trendingPrompts.length}</div>
            <p className="text-xs text-green-600 mt-2">
              +12 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{opportunityPrompts.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Low competition, high volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Avg. Competition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">9.8</div>
            <p className="text-xs text-muted-foreground mt-2">
              Brands competing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-600" />
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">4.0K</div>
            <p className="text-xs text-green-600 mt-2">
              +34% vs last month
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

      {/* Opportunity Highlights */}
      {opportunityPrompts.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              High-Opportunity Prompts
            </CardTitle>
            <CardDescription>
              These prompts have high volume but low competition - great opportunities to rank!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunityPrompts.map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{prompt.prompt}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {prompt.volume} searches
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {prompt.competitors} competitors
                      </Badge>
                      <Badge className="text-xs bg-green-100 text-green-700">
                        {prompt.trend} trending
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

      {/* All Trending Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Prompts</CardTitle>
          <CardDescription>Most searched queries in your industry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-base mb-2">{prompt.prompt}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          📊 {prompt.volume.toLocaleString()} searches/mo
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(prompt.difficulty)}`}>
                          {prompt.difficulty} difficulty
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {prompt.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          👥 {prompt.competitors} competitors
                        </Badge>
                        <Badge className="text-xs bg-green-100 text-green-700">
                          📈 {prompt.trend}
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
                    Create Content
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
          <CardTitle className="text-base">🔍 How Prompt Research Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Discover queries:</strong> See what people are actually asking AI about your industry</p>
          <p>• <strong>Analyze competition:</strong> Find out how many brands are already ranking for each query</p>
          <p>• <strong>Identify opportunities:</strong> Spot high-volume, low-competition queries to target</p>
          <p>• <strong>Create targeted content:</strong> Build content that answers these specific questions</p>
          <p>• <strong>Track performance:</strong> Monitor how your content ranks for these queries over time</p>
        </CardContent>
      </Card>
    </div>
  )
}
