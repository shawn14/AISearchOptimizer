"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScoreGauge } from "@/components/dashboard/score-gauge"
import { Search, X, Plus, Rocket, Loader2 } from "lucide-react"

interface PageAudit {
  id: string
  page_title: string | null
  page_url: string
  is_homepage: boolean
  technical_score: number | null
  content_score: number | null
  aeo_score: number | null
  last_audited_at: string | null
}

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [pages, setPages] = useState<PageAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [runningAudits, setRunningAudits] = useState<Set<string>>(new Set())
  const [newPageUrl, setNewPageUrl] = useState("")
  const [brandId, setBrandId] = useState<string | null>(null)

  // Fetch pages and brands on mount
  useEffect(() => {
    fetchBrandAndPages()
  }, [])

  async function fetchBrandAndPages() {
    try {
      // Fetch brands first
      const brandsResponse = await fetch('/api/brands')
      const brandsData = await brandsResponse.json()
      const brands = brandsData.brands || []

      // Use first brand if available
      if (brands.length > 0) {
        setBrandId(brands[0].id)
      }

      // Fetch audits
      const response = await fetch('/api/audits')
      const data = await response.json()
      setPages(data.audits || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPages() {
    try {
      const response = await fetch('/api/audits')
      const data = await response.json()
      setPages(data.audits || [])
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    }
  }

  async function runAudit(pageUrl: string, pageId?: string) {
    if (!brandId) {
      alert('No brand found. Please add a brand first in the Brands page.')
      return
    }

    setRunningAudits(prev => new Set(prev).add(pageUrl))

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: pageUrl,
          brandId: brandId
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the page list
        await fetchPages()
      } else {
        console.error('Audit failed:', data.error)
        alert(`Audit failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Error running audit:', error)
      alert('Failed to run audit. Please try again.')
    } finally {
      setRunningAudits(prev => {
        const next = new Set(prev)
        next.delete(pageUrl)
        return next
      })
    }
  }

  async function addPage() {
    if (!newPageUrl.trim()) return

    const url = newPageUrl.trim()

    // Validate URL
    try {
      new URL(url)
    } catch {
      alert('Please enter a valid URL')
      return
    }

    // Run audit for the new page
    await runAudit(url)
    setNewPageUrl("")
  }

  const filteredPages = pages.filter(page =>
    (page.page_title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    page.page_url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const avgTechnical = pages.length > 0
    ? Math.round(pages.reduce((sum, p) => sum + (p.technical_score || 0), 0) / pages.length)
    : 0
  const avgContent = pages.length > 0
    ? Math.round(pages.reduce((sum, p) => sum + (p.content_score || 0), 0) / pages.length)
    : 0
  const avgAEO = pages.length > 0
    ? Math.round(pages.reduce((sum, p) => sum + (p.aeo_score || 0), 0) / pages.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search from ${pages.length} URLs or titles...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL to audit..."
              value={newPageUrl}
              onChange={(e) => setNewPageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPage()}
              className="w-64"
            />
            <Button variant="outline" size="sm" onClick={addPage} disabled={!newPageUrl.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Page
            </Button>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md">
            <div className="w-32 h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 rounded-full" />
            <span className="text-sm font-medium">{selectedPages.length}/{pages.length}</span>
          </div>
          <Button variant="outline" size="sm">
            Track {selectedPages.length} pages
          </Button>
          <Button size="sm">
            <Rocket className="mr-2 h-4 w-4" />
            Start Campaign
          </Button>
        </div>
      </div>

      {/* Score Gauges */}
      <div className="grid gap-6 md:grid-cols-3">
        <ScoreGauge
          title="Technical"
          description="Technical SEO health and optimization"
          score={avgTechnical}
        />
        <ScoreGauge
          title="Content Quality"
          description="Content depth, relevance, and readability"
          score={avgContent}
        />
        <ScoreGauge
          title="AEO"
          description="AI Engine Optimization"
          score={avgAEO}
        />
      </div>

      {/* Page Audit Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Page URL ({filteredPages.length})
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">
                    Issues
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">
                    Technical
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">
                    Content
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">
                    AEO
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {pages.length === 0 ? (
                        <div>
                          <p className="text-lg font-medium mb-2">No pages added yet</p>
                          <p className="text-sm">Add a URL above to start auditing your pages</p>
                        </div>
                      ) : (
                        <p>No pages match your search</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => {
                    const isRunning = runningAudits.has(page.page_url)
                    const hasScores = page.technical_score !== null && page.content_score !== null && page.aeo_score !== null

                    return (
                      <tr key={page.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <div className="font-medium flex items-center gap-2">
                              {page.page_title || 'Untitled'}
                              {page.is_homepage && (
                                <Badge variant="secondary" className="text-xs">
                                  Homepage
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {page.page_url}
                            </div>
                            {page.last_audited_at && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Last audited: {new Date(page.last_audited_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-muted-foreground">-</span>
                        </td>
                        <td className="p-4 text-center">
                          {page.technical_score !== null ? (
                            <span className={`font-semibold ${page.technical_score >= 80 ? 'text-green-600' : page.technical_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {page.technical_score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {page.content_score !== null ? (
                            <span className={`font-semibold ${page.content_score >= 80 ? 'text-green-600' : page.content_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {page.content_score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {page.aeo_score !== null ? (
                            <span className={`font-semibold ${page.aeo_score >= 80 ? 'text-green-600' : page.aeo_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {page.aeo_score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-orange-200 hover:bg-orange-300 text-orange-900"
                            onClick={() => runAudit(page.page_url, page.id)}
                            disabled={isRunning}
                          >
                            {isRunning ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>▶ {hasScores ? 'Re-run' : 'Run'}</>
                            )}
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
