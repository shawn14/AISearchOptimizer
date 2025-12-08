"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, CheckCircle2, XCircle, TrendingUp, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlatformResult {
  platform: string
  query: string
  response: string
  yourBrand: {
    mentioned: boolean
    position?: number
    prominence: number
    context?: string
  }
  competitor: {
    mentioned: boolean
    position?: number
    prominence: number
    context?: string
  }
  error?: string
}

interface DemoResult {
  query: string
  platforms: PlatformResult[]
  summary: {
    totalPlatforms: number
    yourBrandMentions: number
    competitorMentions: number
  }
}

export function InteractiveDemo() {
  const [brandName, setBrandName] = useState("")
  const [competitor, setCompetitor] = useState("")
  const [industry, setIndustry] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DemoResult | null>(null)
  const [error, setError] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!brandName.trim() || !competitor.trim() || !industry.trim()) {
      setError("Please fill in all fields")
      return
    }

    setError("")
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/demo-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brandName.trim(),
          competitor: competitor.trim(),
          industry: industry.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run demo check")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="interactive-demo" className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Search className="h-4 w-4" />
            Free AI Ranking Check
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            See Where You Rank Right Now
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your brand and a competitor. We'll run a live AI search and show you exactly where you stand.
          </p>
        </div>

        {/* Demo Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Brand
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Salesforce"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competitor
                </label>
                <Input
                  type="text"
                  placeholder="e.g., HubSpot"
                  value={competitor}
                  onChange={(e) => setCompetitor(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <Input
                  type="text"
                  placeholder="e.g., CRM software"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Checking AI Rankings...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Check My Ranking (Free)
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              No credit card required • Results in ~10-15 seconds • Powered by ChatGPT, Perplexity & Grok
            </p>
          </form>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{result.summary.totalPlatforms}</div>
                  <div className="text-sm text-gray-600">AI Platforms</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{result.summary.yourBrandMentions}</div>
                  <div className="text-sm text-gray-600">Your Mentions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">{result.summary.competitorMentions}</div>
                  <div className="text-sm text-gray-600">Competitor Mentions</div>
                </div>
              </div>
            </div>

            {/* Platform Tabs */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200">
                {result.platforms.map((platform, idx) => (
                  <button
                    key={platform.platform}
                    onClick={() => setSelectedPlatform(idx)}
                    className={cn(
                      "flex-1 px-6 py-4 font-semibold text-sm transition-colors",
                      selectedPlatform === idx
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {platform.platform === 'chatgpt' && 'ChatGPT'}
                    {platform.platform === 'perplexity' && 'Perplexity'}
                    {platform.platform === 'grok' && 'Grok'}
                    {platform.platform === 'claude' && 'Claude'}
                    {platform.platform === 'gemini' && 'Gemini'}
                  </button>
                ))}
              </div>

              {/* Current Platform Results */}
              {result.platforms[selectedPlatform] && (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Your Brand */}
                    <div
                      className={cn(
                        "border-2 rounded-2xl p-6 shadow-lg",
                        result.platforms[selectedPlatform].yourBrand.mentioned
                          ? "bg-green-50 border-green-500"
                          : "bg-orange-50 border-orange-500"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{brandName}</h3>
                        {result.platforms[selectedPlatform].yourBrand.mentioned ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-orange-600" />
                        )}
                      </div>

                      {result.platforms[selectedPlatform].yourBrand.mentioned ? (
                        <div>
                          <div className="mb-2">
                            <span className="text-3xl font-bold text-gray-900">
                              #{result.platforms[selectedPlatform].yourBrand.position || "?"}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">position</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${result.platforms[selectedPlatform].yourBrand.prominence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {result.platforms[selectedPlatform].yourBrand.prominence}%
                            </span>
                          </div>
                          {result.platforms[selectedPlatform].yourBrand.context && (
                            <p className="text-sm text-gray-700 bg-white/50 rounded-lg p-3 italic">
                              "{result.platforms[selectedPlatform].yourBrand.context.substring(0, 120)}..."
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-semibold text-orange-700 mb-2">Not mentioned</p>
                          <p className="text-sm text-gray-700">
                            Not found in this platform's response.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Competitor */}
                    <div
                      className={cn(
                        "border-2 rounded-2xl p-6 shadow-lg",
                        result.platforms[selectedPlatform].competitor.mentioned
                          ? "bg-red-50 border-red-300"
                          : "bg-gray-50 border-gray-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{competitor}</h3>
                        {result.platforms[selectedPlatform].competitor.mentioned ? (
                          <CheckCircle2 className="h-6 w-6 text-red-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-gray-400" />
                        )}
                      </div>

                      {result.platforms[selectedPlatform].competitor.mentioned ? (
                        <div>
                          <div className="mb-2">
                            <span className="text-3xl font-bold text-gray-900">
                              #{result.platforms[selectedPlatform].competitor.position || "?"}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">position</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${result.platforms[selectedPlatform].competitor.prominence}%` }}
                        ></div>
                      </div>
                            <span className="text-sm font-medium text-gray-700">
                              {result.platforms[selectedPlatform].competitor.prominence}%
                            </span>
                          </div>
                          {result.platforms[selectedPlatform].competitor.context && (
                            <p className="text-sm text-gray-700 bg-white/50 rounded-lg p-3 italic">
                              "{result.platforms[selectedPlatform].competitor.context.substring(0, 120)}..."
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-semibold text-gray-700 mb-2">Not mentioned</p>
                          <p className="text-sm text-gray-600">
                            Not found in this platform's response.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Response Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-500 mb-2">Full AI Response:</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {result.platforms[selectedPlatform].response}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-xl">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-3">Want to Track This Daily?</h3>
              <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                Get continuous monitoring across ChatGPT, Perplexity, Grok, Claude & Gemini.
                See exactly when your rankings change and get AI-powered recommendations to climb higher.
              </p>
              <Button
                asChild
                variant="secondary"
                className="h-12 px-8 font-semibold text-base"
              >
                <a href="/signup?ref=demo">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <p className="text-xs text-blue-200 mt-3">
                Free 7-day trial • No credit card required
              </p>
            </div>

            {/* Try Another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null)
                  setBrandName("")
                  setCompetitor("")
                  setIndustry("")
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Try another comparison
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
