"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, TrendingUp, AlertCircle, Loader2 } from "lucide-react"

interface Brand {
  id: string
  name: string
  website_url: string
  industry: string | null
  description: string | null
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
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [monitoring, setMonitoring] = useState<Set<string>>(new Set())

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    industry: '',
    description: ''
  })

  useEffect(() => {
    fetchBrands()
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh brands list
        await fetchBrands()
        // Reset form
        setFormData({ name: '', website_url: '', industry: '', description: '' })
        // Close dialog
        setDialogOpen(false)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to create brand:', error)
      alert('Failed to create brand. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function runMonitoring(brandId: string) {
    setMonitoring(prev => new Set(prev).add(brandId))

    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Monitoring complete!\n\nVisibility Score: ${data.result.visibility_score}\nMentions: ${data.result.total_mentions}/${data.result.queries_tested}\nCost: $${data.result.total_cost.toFixed(4)}`)
        // Refresh brands to show updated data
        await fetchBrands()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to run monitoring:', error)
      alert('Failed to run monitoring. Please try again.')
    } finally {
      setMonitoring(prev => {
        const next = new Set(prev)
        next.delete(brandId)
        return next
      })
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
              <Card key={brand.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{brand.name}</CardTitle>
                      <CardDescription>{brand.website_url}</CardDescription>
                      {brand.industry && (
                        <Badge variant="outline" className="mt-2">{brand.industry}</Badge>
                      )}
                    </div>
                    <Badge>{stats ? 'Active' : 'Not Monitored'}</Badge>
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
                      <p className="text-sm font-medium mb-2">Monitoring Frequency</p>
                      <p className="text-sm text-muted-foreground">Every 6 hours</p>
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
                        onClick={() => runMonitoring(brand.id)}
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
    </div>
  )
}
