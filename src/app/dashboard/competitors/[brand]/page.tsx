"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare } from "lucide-react"

interface MentionDetail {
  query: string
  platform: string
  context: string
}

export default function BrandMentionsPage() {
  const params = useParams()
  const router = useRouter()
  const brandName = decodeURIComponent(params.brand as string)

  const [loading, setLoading] = useState(true)
  const [mentions, setMentions] = useState<MentionDetail[]>([])
  const [totalMentions, setTotalMentions] = useState(0)

  useEffect(() => {
    fetchBrandMentions()
  }, [brandName])

  async function fetchBrandMentions() {
    try {
      setLoading(true)

      // Get monitoring data
      const response = await fetch('/api/monitoring')
      const data = await response.json()
      const latestRun = data.runs?.[0]

      if (!latestRun?.individual_results) {
        setLoading(false)
        return
      }

      // Extract mentions for this specific brand
      const brandMentionDetails: MentionDetail[] = []
      let count = 0

      latestRun.individual_results.forEach((result: any) => {
        const text = result.response_text || ''

        // Check if this brand is mentioned in the response
        const regex = new RegExp(`\\b${brandName}\\b`, 'gi')
        const matches = text.match(regex)

        if (matches && matches.length > 0) {
          count += matches.length

          // Add unique query/platform combinations
          const existing = brandMentionDetails.find(
            d => d.query === result.query && d.platform === result.platform
          )

          if (!existing) {
            brandMentionDetails.push({
              query: result.query,
              platform: result.platform,
              context: result.context || text || ''
            })
          }
        }
      })

      setMentions(brandMentionDetails)
      setTotalMentions(count)
    } catch (error) {
      console.error('Error fetching brand mentions:', error)
    } finally {
      setLoading(false)
    }
  }

  function highlightBrand(text: string) {
    // Escape special regex characters in brand name
    const escapedBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(\\b${escapedBrand}\\b)`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.toLowerCase() === brandName.toLowerCase()) {
        return (
          <mark
            key={index}
            className="bg-yellow-300 dark:bg-yellow-600/50 text-gray-900 dark:text-white font-semibold px-1 rounded"
          >
            {part}
          </mark>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mentions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push('/dashboard/competitors')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Industry Landscape
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Mentions of</h1>
          <Badge variant="outline" className="text-xl px-3 py-1 font-bold">
            {brandName}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          View all queries and contexts where this brand was mentioned
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMentions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Different contexts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(mentions.map(m => m.platform)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI platforms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mentions List */}
      <div className="space-y-4">
        {mentions.length > 0 ? (
          mentions.map((mention, idx) => (
            <Card key={idx} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{mention.platform}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Query #{idx + 1}
                      </span>
                    </div>
                    <CardTitle className="text-base font-medium">
                      {mention.query}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {highlightBrand(mention.context.substring(0, 1000))}
                    {mention.context.length > 1000 && '...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No mentions found</h3>
              <p className="text-muted-foreground text-center">
                This brand was not mentioned in the latest monitoring run
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
