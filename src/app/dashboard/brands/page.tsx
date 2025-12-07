"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, TrendingUp, AlertCircle, Loader2, Sparkles, Star, Trash2 } from "lucide-react"

interface CustomPrompt {
  id: string
  name: string
  prompt_text: string
  category?: string
  variables: Record<string, string>
}

interface Brand {
  id: string
  name: string
  website_url: string
  industry: string | null
  description: string | null
  is_primary?: boolean
  created_at: string
  updated_at: string
}

interface BrandStats {
  visibility_score?: number
  total_mentions?: number
  queries_tested?: number
}

export default function BrandsPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandStats, setBrandStats] = useState<Record<string, BrandStats>>({})
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [monitorDialogOpen, setMonitorDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [monitoring, setMonitoring] = useState<Set<string>>(new Set())

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    industry: '',
    description: ''
  })

  // Monitor form state
  const [monitorFormData, setMonitorFormData] = useState({
    useCustomPrompts: false,
    selectedPromptIds: [] as string[],
  })

  useEffect(() => {
    fetchBrands()
    fetchCustomPrompts()
  }, [])

  async function fetchBrands() {
    try {
      const [brandsRes, monitoringRes] = await Promise.all([
        fetch('/api/brands'),
        fetch('/api/monitoring')
      ])

      const brandsData = await brandsRes.json()
      const monitoringData = await monitoringRes.json()

      setBrands(brandsData.brands || [])

      // Build stats map from latest monitoring runs for each brand
      const stats: Record<string, BrandStats> = {}
      monitoringData.runs?.forEach((run: any) => {
        if (!stats[run.brand_id]) {
          stats[run.brand_id] = {
            visibility_score: run.visibility_score,
            total_mentions: run.total_mentions,
            queries_tested: run.queries_tested,
          }
        }
      })
      setBrandStats(stats)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCustomPrompts() {
    try {
      const response = await fetch('/api/prompts')
      const data = await response.json()
      setCustomPrompts(data.prompts || [])
    } catch (error) {
      console.error('Failed to fetch custom prompts:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      console.log('Submitting brand:', formData)
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        // Refresh brands list
        await fetchBrands()
        // Reset form
        setFormData({ name: '', website_url: '', industry: '', description: '' })
        // Close dialog
        setDialogOpen(false)
      } else {
        console.error('Create brand error:', data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Failed to create brand:', error)
    } finally {
      setSaving(false)
    }
  }

  function openMonitorDialog(brandId: string) {
    setSelectedBrandId(brandId)
    setMonitorFormData({
      useCustomPrompts: false,
      selectedPromptIds: [],
    })
    setMonitorDialogOpen(true)
  }

  async function runMonitoring() {
    if (!selectedBrandId) return

    setMonitoring(prev => new Set(prev).add(selectedBrandId))
    setMonitorDialogOpen(false)

    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrandId,
          useCustomPrompts: monitorFormData.useCustomPrompts,
          promptIds: monitorFormData.useCustomPrompts ? monitorFormData.selectedPromptIds : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Just refresh brands to show updated data - results will be visible in the card
        await fetchBrands()
      } else {
        console.error('Monitoring error:', data.error)
      }
    } catch (error) {
      console.error('Failed to run monitoring:', error)
    } finally {
      setMonitoring(prev => {
        const next = new Set(prev)
        next.delete(selectedBrandId)
        return next
      })
    }
  }

  function togglePromptSelection(promptId: string) {
    setMonitorFormData(prev => ({
      ...prev,
      selectedPromptIds: prev.selectedPromptIds.includes(promptId)
        ? prev.selectedPromptIds.filter(id => id !== promptId)
        : [...prev.selectedPromptIds, promptId]
    }))
  }

  async function setPrimaryBrand(brandId: string) {
    try {
      const response = await fetch('/api/brands/set-primary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId }),
      })

      if (response.ok) {
        await fetchBrands()
      } else {
        console.error('Failed to set primary brand')
      }
    } catch (error) {
      console.error('Error setting primary brand:', error)
    }
  }

  function openDeleteDialog(brand: Brand) {
    setBrandToDelete(brand)
    setDeleteDialogOpen(true)
  }

  async function handleDeleteBrand() {
    if (!brandToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/brands/${brandToDelete.id}`, {
        method: 'DELETE',
      })

      // Treat both 200 (success) and 404 (already deleted) as success
      if (response.ok || response.status === 404) {
        await fetchBrands()
        setDeleteDialogOpen(false)
        setBrandToDelete(null)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to delete brand:', errorData)
        alert(`Failed to delete brand: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
    } finally {
      setDeleting(false)
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">
            Manage and monitor your brands
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
                <DialogDescription>
                  Create a new brand to monitor across AI platforms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Brand Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Acme Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL *</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., SaaS, E-commerce"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the brand"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Brand
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brand Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {brands.length === 0 ? (
          <Card className="border-dashed col-span-2">
            <CardHeader className="flex flex-col items-center justify-center text-center py-16">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle>No brands yet</CardTitle>
              <CardDescription className="mb-4">
                Create your first brand to start monitoring across AI platforms
              </CardDescription>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </CardHeader>
          </Card>
        ) : (
          <>
            {brands.map((brand) => {
              const stats = brandStats[brand.id]
              return (
              <Card key={brand.id} className={brand.is_primary ? 'border-orange-500 border-2 bg-orange-50/50' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{brand.name}</CardTitle>
                        {brand.is_primary && (
                          <Badge className="bg-orange-500 hover:bg-orange-600">
                            <Star className="h-3 w-3 mr-1 fill-white" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{brand.website_url}</CardDescription>
                      {brand.industry && (
                        <Badge variant="outline" className="mt-2">{brand.industry}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPrimaryBrand(brand.id)}
                        className={brand.is_primary ? 'text-orange-500' : 'text-muted-foreground'}
                        title={brand.is_primary ? 'Primary brand' : 'Set as primary brand'}
                      >
                        <Star className={`h-4 w-4 ${brand.is_primary ? 'fill-orange-500' : ''}`} />
                      </Button>
                      <Badge>{stats ? 'Active' : 'Not Monitored'}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{stats?.visibility_score ?? '-'}</div>
                        <div className="text-xs text-muted-foreground">Visibility Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats?.queries_tested ?? '-'}</div>
                        <div className="text-xs text-muted-foreground">Queries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats?.total_mentions ?? '-'}</div>
                        <div className="text-xs text-muted-foreground">Mentions</div>
                      </div>
                    </div>

                    {brand.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">{brand.description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-2">Monitoring</p>
                      <p className="text-sm text-muted-foreground">Manual only</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push('/dashboard/analytics')}
                      >
                        View Analytics
                      </Button>
                      <Button
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => openMonitorDialog(brand.id)}
                        disabled={monitoring.has(brand.id)}
                      >
                        {monitoring.has(brand.id) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Monitoring...
                          </>
                        ) : (
                          'Run Monitor'
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => openDeleteDialog(brand)}
                        title="Delete brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})}

            {/* Add New Brand Card */}
            <Card className="border-dashed">
              <CardHeader className="h-full flex flex-col items-center justify-center text-center py-16">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>Add New Brand</CardTitle>
                <CardDescription className="mb-4">
                  Start monitoring a new brand across AI platforms
                </CardDescription>
                <Button onClick={() => setDialogOpen(true)}>Add Brand</Button>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Monitoring Activity</CardTitle>
          <CardDescription>Latest monitoring runs and results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                brand: "AISearchOptimizer",
                time: "2 hours ago",
                platforms: ["ChatGPT", "Claude", "Perplexity", "Gemini"],
                mentions: 12,
                status: "completed",
              },
              {
                brand: "AISearchOptimizer",
                time: "8 hours ago",
                platforms: ["ChatGPT", "Claude", "Perplexity"],
                mentions: 10,
                status: "completed",
              },
            ].map((run, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{run.brand}</span>
                    <Badge variant="outline" className="text-xs">
                      {run.status === "completed" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {run.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {run.platforms.join(", ")} • {run.time}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{run.mentions}</div>
                  <div className="text-xs text-muted-foreground">mentions</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitor Configuration Dialog */}
      <Dialog open={monitorDialogOpen} onOpenChange={setMonitorDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Configure Monitoring Run
            </DialogTitle>
            <DialogDescription>
              Choose how to monitor your brand across AI platforms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Monitoring Mode Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Monitoring Mode</Label>

              <div className="space-y-3">
                {/* Default Queries Option */}
                <div
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    !monitorFormData.useCustomPrompts
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setMonitorFormData({ ...monitorFormData, useCustomPrompts: false, selectedPromptIds: [] })}
                >
                  <input
                    type="radio"
                    checked={!monitorFormData.useCustomPrompts}
                    onChange={() => setMonitorFormData({ ...monitorFormData, useCustomPrompts: false, selectedPromptIds: [] })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Auto-Generated Queries</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Use 5 automatically generated queries based on your brand's industry
                    </div>
                  </div>
                </div>

                {/* Custom Prompts Option */}
                <div
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    monitorFormData.useCustomPrompts
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setMonitorFormData({ ...monitorFormData, useCustomPrompts: true })}
                >
                  <input
                    type="radio"
                    checked={monitorFormData.useCustomPrompts}
                    onChange={() => setMonitorFormData({ ...monitorFormData, useCustomPrompts: true })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Custom Prompts</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Select specific prompts from your library ({customPrompts.length} available)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Prompts Selection */}
            {monitorFormData.useCustomPrompts && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Select Prompts ({monitorFormData.selectedPromptIds.length} selected)
                </Label>

                {customPrompts.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No custom prompts available. Create prompts first.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/dashboard/prompts')}
                    >
                      Go to Prompts
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-3">
                    {customPrompts.map(prompt => (
                      <div
                        key={prompt.id}
                        className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                          monitorFormData.selectedPromptIds.includes(prompt.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => togglePromptSelection(prompt.id)}
                      >
                        <Checkbox
                          checked={monitorFormData.selectedPromptIds.includes(prompt.id)}
                          onCheckedChange={() => togglePromptSelection(prompt.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{prompt.name}</div>
                          {prompt.category && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {prompt.category}
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground font-mono mt-2 truncate">
                            {prompt.prompt_text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cost Estimate */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium mb-1">Estimated Cost</div>
                  <div className="text-muted-foreground">
                    {monitorFormData.useCustomPrompts
                      ? `${monitorFormData.selectedPromptIds.length} prompts × 4 platforms = ${monitorFormData.selectedPromptIds.length * 4} queries`
                      : '5 auto-generated queries × 4 platforms = 20 queries'
                    }
                    <br />
                    Approximate cost: ${monitorFormData.useCustomPrompts
                      ? (monitorFormData.selectedPromptIds.length * 4 * 0.002).toFixed(4)
                      : '0.0400'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMonitorDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={runMonitoring}
              disabled={monitorFormData.useCustomPrompts && monitorFormData.selectedPromptIds.length === 0}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Start Monitoring
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Brand Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{brandToDelete?.name}"? This will also delete all associated monitoring data and audits. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBrand}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
