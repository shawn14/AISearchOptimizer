"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, FileText, Link as LinkIcon, Calendar, Search } from "lucide-react"

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock knowledge base articles
  const articles = [
    {
      id: "1",
      title: "Company Overview and Mission",
      type: "About",
      content: "Our company was founded in 2020 with a mission to revolutionize...",
      url: "https://example.com/about",
      lastUpdated: "2024-01-15",
      category: "Company Info"
    },
    {
      id: "2",
      title: "Product Features and Benefits",
      type: "Product",
      content: "Our flagship product offers AI-powered search optimization...",
      url: "https://example.com/features",
      lastUpdated: "2024-01-10",
      category: "Products"
    },
    {
      id: "3",
      title: "Pricing Plans",
      type: "Pricing",
      content: "We offer flexible pricing plans to suit businesses of all sizes...",
      url: "https://example.com/pricing",
      lastUpdated: "2024-01-08",
      category: "Sales"
    },
    {
      id: "4",
      title: "Customer Success Stories",
      type: "Case Study",
      content: "See how our customers have achieved 300% increase in AI visibility...",
      url: "https://example.com/case-studies",
      lastUpdated: "2024-01-05",
      category: "Marketing"
    },
  ]

  const categories = ["All", "Company Info", "Products", "Sales", "Marketing", "Support"]

  const filteredArticles = searchQuery
    ? articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Centralize information about your brand for AI to reference
          </p>
        </div>

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{articles.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              In knowledge base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Organized topics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">127</div>
            <p className="text-xs text-green-600 mt-2">
              +23 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 days ago</div>
            <p className="text-xs text-muted-foreground mt-2">
              Company Overview
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
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {article.content}
                  </CardDescription>
                </div>
                <Badge variant="outline">{article.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LinkIcon className="h-3 w-3" />
                  <a href={article.url} className="hover:text-primary truncate" target="_blank" rel="noopener noreferrer">
                    {article.url}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Updated {new Date(article.lastUpdated).toLocaleDateString()}
                  </div>
                  <Badge variant="secondary">{article.category}</Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Stats
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? "Try a different search query" : "Get started by adding your first article"}
            </p>
            {!searchQuery && (
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Article
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">💡 How Knowledge Base Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Add your content:</strong> Import articles, blog posts, product pages, and key information about your brand</p>
          <p>• <strong>Organize by category:</strong> Structure your content so AI can easily find relevant information</p>
          <p>• <strong>AI references it:</strong> When AI platforms search for information about your industry, they can cite your knowledge base</p>
          <p>• <strong>Track citations:</strong> See when and how AI platforms reference your content in their responses</p>
        </CardContent>
      </Card>
    </div>
  )
}
