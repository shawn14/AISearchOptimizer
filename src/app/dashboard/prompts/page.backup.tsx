"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Sparkles, Trash2, Edit, Copy, TrendingUp, Loader2 } from "lucide-react"
import { PROMPT_TEMPLATES, getAllCategories, getTemplatesByCategory, substituteVariables, extractVariables } from "@/lib/prompts/prompt-templates"

interface CustomPrompt {
  id: string
  name: string
  prompt_text: string
  variables: Record<string, string>
  category?: string
  is_active: boolean
  performance_score?: number
  created_at: Date
}

export default function PromptsPage() {
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    prompt_text: '',
    category: '',
    variables: {} as Record<string, string>,
  })

  const categories = getAllCategories()

  useEffect(() => {
    fetchCustomPrompts()
  }, [])

  async function fetchCustomPrompts() {
    try {
      const response = await fetch('/api/prompts')
      const data = await response.json()
      setCustomPrompts(data.prompts || [])
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleTemplateSelect(templateId: string) {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    const variables = extractVariables(template.prompt)
    const variablesObj: Record<string, string> = {}
    variables.forEach(v => variablesObj[v] = '')

    setFormData({
      name: template.name,
      prompt_text: template.prompt,
      category: template.category,
      variables: variablesObj,
    })
  }

  function handleVariableChange(key: string, value: string) {
    setFormData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [key]: value,
      },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          prompt_text: formData.prompt_text,
          category: formData.category,
          variables: formData.variables,
          is_active: true,
        }),
      })

      if (response.ok) {
        await fetchCustomPrompts()
        setFormData({ name: '', prompt_text: '', category: '', variables: {} })
        setDialogOpen(false)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to create prompt:', error)
      alert('Failed to create prompt. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function deletePrompt(id: string) {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
      await fetchCustomPrompts()
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  const filteredTemplates = selectedCategory === 'all'
    ? PROMPT_TEMPLATES
    : getTemplatesByCategory(selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompts Library</h1>
          <p className="text-muted-foreground">
            Create custom prompts or use pre-built templates
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Prompt</DialogTitle>
              <DialogDescription>
                Create a new prompt from scratch or use a template
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Template Selector */}
              <div className="space-y-2">
                <Label>Start from Template (Optional)</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPT_TEMPLATES.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Prompt Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., SaaS Competitor Analysis"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., SaaS, E-commerce, Generic"
                />
              </div>

              {/* Prompt Text */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt Text *</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt_text}
                  onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                  placeholder="Use {{variable_name}} for dynamic values, e.g., 'What are the best {{industry}} tools?'"
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{variable_name}}"} for dynamic substitution
                </p>
              </div>

              {/* Variables */}
              {Object.keys(formData.variables).length > 0 && (
                <div className="space-y-2">
                  <Label>Variables</Label>
                  <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                    {Object.keys(formData.variables).map(key => (
                      <div key={key} className="flex items-center gap-2">
                        <Label className="w-32 text-xs font-mono">{`{{${key}}}`}</Label>
                        <Input
                          value={formData.variables[key]}
                          onChange={(e) => handleVariableChange(key, e.target.value)}
                          placeholder={`Value for ${key}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {formData.prompt_text && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-4 border rounded-md bg-muted/30 text-sm">
                    {substituteVariables(formData.prompt_text, formData.variables)}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Prompt'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs: Custom vs Templates */}
      <Tabs defaultValue="custom" className="space-y-4">
        <TabsList>
          <TabsTrigger value="custom">
            My Prompts ({customPrompts.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            Templates ({PROMPT_TEMPLATES.length})
          </TabsTrigger>
        </TabsList>

        {/* Custom Prompts Tab */}
        <TabsContent value="custom" className="space-y-4">
          {customPrompts.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="flex flex-col items-center justify-center text-center py-16">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>No custom prompts yet</CardTitle>
                <CardDescription className="mb-6 max-w-md">
                  Create your first custom prompt or use a template to get started
                </CardDescription>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prompt
                </Button>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {customPrompts.map(prompt => (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{prompt.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {prompt.category && (
                            <Badge variant="outline" className="mr-2">
                              {prompt.category}
                            </Badge>
                          )}
                          {prompt.performance_score && (
                            <span className="text-xs flex items-center gap-1 mt-2">
                              <TrendingUp className="h-3 w-3" />
                              Performance: {prompt.performance_score}%
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(prompt.prompt_text)
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePrompt(prompt.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-3 rounded">
                      {prompt.prompt_text}
                    </p>
                    {Object.keys(prompt.variables).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.keys(prompt.variables).map(key => (
                          <Badge key={key} variant="secondary" className="text-xs font-mono">
                            {`{{${key}}}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All ({PROMPT_TEMPLATES.length})
            </Button>
            {categories.map(category => {
              const count = getTemplatesByCategory(category).length
              return (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({count})
                </Button>
              )
            })}
          </div>

          {/* Templates Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">
                        {template.category}
                      </Badge>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono bg-muted/50 p-3 rounded mb-3">
                    {template.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        handleTemplateSelect(template.id)
                        setDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
