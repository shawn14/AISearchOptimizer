"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookOpen, Plus, Link as LinkIcon, Calendar, Search, Loader2, Trash2, Edit } from "lucide-react"

interface KnowledgeArticle {
  id: string
  brand_id?: string | null
  title: string
  type: string
  content: string
  url: string
  category: string
  citation_count?: number
  last_cited_at?: Date | null
  created_at: Date
  updated_at: Date
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)

  // Add article dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [urlToScrape, setUrlToScrape] = useState("")
  const [scraping, setScraping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "Article",
    category: "General",
    url: "",
  })

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [articleToEdit, setArticleToEdit] = useState<KnowledgeArticle | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<KnowledgeArticle | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categories = ["All", "Company Info", "Products", "Sales", "Marketing", "Support", "General"]
  const types = ["About", "Product", "Pricing", "Case Study", "Blog", "Article", "Support"]

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    try {
      setLoading(true)
      const response = await fetch('/api/knowledge')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleScrapeUrl() {
    if (!urlToScrape) return

    setScraping(true)
    try {
      const response = await fetch('/api/knowledge/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScrape }),
      })

      if (response.ok) {
        const result = await response.json()
        setFormData({
          ...formData,
          ...result.data,
        })
      } else {
        const error = await response.json()
        alert(`Failed to scrape URL: ${error.error}`)
      }
    } catch (error) {
      console.error('Error scraping URL:', error)
      alert('Failed to scrape URL')
    } finally {
      setScraping(false)
    }
  }

  async function handleSaveArticle() {
    if (!formData.title || !formData.content || !formData.url) {
      alert('Title, content, and URL are required')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchArticles()
        setAddDialogOpen(false)
        setFormData({
          title: "",
          content: "",
          type: "Article",
          category: "General",
          url: "",
        })
        setUrlToScrape("")
      } else {
        const error = await response.json()
        alert(`Failed to save article: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateArticle() {
    if (!articleToEdit) return

    setSaving(true)
    try {
      const response = await fetch(`/api/knowledge/${articleToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          category: formData.category,
        }),
      })

      if (response.ok) {
        await fetchArticles()
        setEditDialogOpen(false)
        setArticleToEdit(null)
        setFormData({
          title: "",
          content: "",
          type: "Article",
          category: "General",
          url: "",
        })
      } else {
        const error = await response.json()
        alert(`Failed to update article: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating article:', error)
      alert('Failed to update article')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteArticle() {
    if (!articleToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/knowledge/${articleToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok || response.status === 404) {
        await fetchArticles()
        setDeleteDialogOpen(false)
        setArticleToDelete(null)
      } else {
        const error = await response.json()
        alert(`Failed to delete article: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article')
    } finally {
      setDeleting(false)
    }
  }

  function openEditDialog(article: KnowledgeArticle) {
    setArticleToEdit(article)
    setFormData({
      title: article.title,
      content: article.content,
      type: article.type,
      category: article.category,
      url: article.url,
    })
    setEditDialogOpen(true)
  }

  function openDeleteDialog(article: KnowledgeArticle) {
    setArticleToDelete(article)
    setDeleteDialogOpen(true)
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate stats
  const totalCitations = articles.reduce((sum, a) => sum + (a.citation_count || 0), 0)
  const lastUpdated = articles.length > 0
    ? new Date(Math.max(...articles.map(a => new Date(a.updated_at).getTime())))
    : null
  const uniqueCategories = new Set(articles.map(a => a.category))

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

        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
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
            <div className="text-4xl font-bold">{uniqueCategories.size}</div>
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
            <div className="text-4xl font-bold">{totalCitations}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Total references
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastUpdated
                ? `${Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))} days ago`
                : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Most recent update
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
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Articles Grid */}
      {!loading && filteredArticles.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-3">
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
                    <a
                      href={article.url}
                      className="hover:text-primary truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {article.url}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Updated {new Date(article.updated_at).toLocaleDateString()}
                    </div>
                    <Badge variant="secondary">{article.category}</Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => openEditDialog(article)}
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(article)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredArticles.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? "Try a different search query" : "Get started by adding your first article"}
            </p>
            {!searchQuery && (
              <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
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
          <CardTitle className="text-base">How Knowledge Base Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Add your content:</strong> Import articles, blog posts, product pages, and key information about your brand</p>
          <p>• <strong>Organize by category:</strong> Structure your content so AI can easily find relevant information</p>
          <p>• <strong>AI references it:</strong> When AI platforms search for information about your industry, they can cite your knowledge base</p>
          <p>• <strong>Track citations:</strong> See when and how AI platforms reference your content in their responses</p>
        </CardContent>
      </Card>

      {/* Add Article Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Article</DialogTitle>
            <DialogDescription>
              Enter a URL to automatically extract content, or manually fill in the details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url-scrape">URL to Import</Label>
              <div className="flex gap-2">
                <Input
                  id="url-scrape"
                  placeholder="https://example.com/article"
                  value={urlToScrape}
                  onChange={(e) => setUrlToScrape(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleScrapeUrl()
                    }
                  }}
                />
                <Button
                  onClick={handleScrapeUrl}
                  disabled={!urlToScrape || scraping}
                  className="gap-2"
                >
                  {scraping && <Loader2 className="h-4 w-4 animate-spin" />}
                  Import
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Article title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Source URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/article"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Article content or description"
                rows={8}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveArticle} disabled={saving || !formData.title || !formData.content}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Update the article details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Article title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== "All").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Article content or description"
                rows={8}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateArticle} disabled={saving || !formData.title || !formData.content}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteArticle} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
