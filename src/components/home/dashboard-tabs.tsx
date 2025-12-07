"use client"

import { useState, useEffect } from "react"
import { BarChart3, Target, FileText, Zap, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type TabId = "analytics" | "monitoring" | "content" | "optimization"

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "monitoring", label: "Monitoring", icon: <Target className="h-4 w-4" /> },
  { id: "content", label: "Content", icon: <FileText className="h-4 w-4" /> },
  { id: "optimization", label: "Optimization", icon: <Zap className="h-4 w-4" /> },
]

interface HomepageData {
  hasData: boolean
  brands: number
  analytics: {
    visibilityScore: number
    totalMentions: number
    queriesTested: number
    mentionRate: number
    platformStats: {
      chatgpt: { position: number; percentage: number; mentions: number }
      google: { position: number; percentage: number; mentions: number }
      perplexity: { position: number; percentage: number; mentions: number }
    }
    realQueryExample: {
      query: string
      response: string
      mentioned: boolean
      platform: string
      prominence: number
    } | null
    brandName: string
  }
  monitoring: {
    totalRuns: number
    platforms: string[]
    recentActivity: Array<{
      timestamp: string
      visibilityScore: number
      mentions: number
      queries: number
    }>
  }
  content: {
    pagesAudited: number
    avgAEO: number
    avgTechnical: number
    avgContent: number
    topPage: { title: string; url: string; aeoScore: number } | null
    bottomPage: { title: string; url: string; aeoScore: number } | null
  }
  optimization: {
    recommendations: Array<{
      title: string
      description: string
      priority: string
    }>
  }
}

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("analytics")
  const [data, setData] = useState<HomepageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/homepage-data")
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch homepage data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </section>
    )
  }

  if (!data || !data.hasData) {
    return (
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-12 shadow-sm text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">See Your Rankings in Action</h3>
            <p className="text-gray-600 mb-6">
              Connect your brand to see real-time data showing exactly where you rank across ChatGPT, Google, and Perplexity
            </p>
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">
              Get Started Free
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative">
          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="space-y-6">
                  {/* Query Example */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">Real query tracked:</p>
                        <p className="text-base font-semibold text-gray-900 mb-4">
                          {data.analytics.realQueryExample?.query || "Example query will appear here"}
                        </p>
                      </div>
                    </div>

                    <div className={cn(
                      "bg-gradient-to-br from-gray-50 to-white rounded-lg p-5 border-l-4",
                      data.analytics.realQueryExample?.mentioned ? "border-green-500" : "border-orange-500"
                    )}>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {data.analytics.realQueryExample?.response
                          ? data.analytics.realQueryExample.response.substring(0, 300) + "..."
                          : "AI response will appear here when monitoring runs"}
                      </p>
                      {data.analytics.realQueryExample?.mentioned ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex-shrink-0">
                              ✓
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{data.analytics.brandName}</p>
                              <p className="text-xs text-gray-600">
                                Mentioned with prominence score: {data.analytics.realQueryExample.prominence}/100
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex-shrink-0">
                            !
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Not mentioned in this query</p>
                            <p className="text-xs text-gray-600">Opportunity to optimize for this search</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          data.analytics.realQueryExample?.mentioned ? "bg-green-500" : "bg-orange-500"
                        )}></div>
                        Platform: {data.analytics.realQueryExample?.platform || "ChatGPT"}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-full font-medium",
                        data.analytics.realQueryExample?.mentioned
                          ? "bg-green-50 text-green-700"
                          : "bg-orange-50 text-orange-700"
                      )}>
                        Visibility: {data.analytics.visibilityScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Platform Breakdown */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">GP</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">ChatGPT</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {data.analytics.platformStats.chatgpt.mentions}
                        </span>
                        <span className="text-sm text-gray-500">mentions</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        In {data.analytics.platformStats.chatgpt.percentage}% of responses
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Google</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {data.analytics.platformStats.google.mentions}
                        </span>
                        <span className="text-sm text-gray-500">mentions</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        In {data.analytics.platformStats.google.percentage}% of AI Overviews
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Perplexity</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {data.analytics.platformStats.perplexity.mentions}
                        </span>
                        <span className="text-sm text-gray-500">mentions</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        In {data.analytics.platformStats.perplexity.percentage}% of responses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === "monitoring" && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">Total Runs</h3>
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{data.monitoring.totalRuns}</div>
                    <p className="text-xs text-gray-500">Monitoring sessions completed</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">Queries Tested</h3>
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{data.analytics.queriesTested}</div>
                    <p className="text-xs text-gray-500">Across all platforms</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">Total Mentions</h3>
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{data.analytics.totalMentions}</div>
                    <p className="text-xs text-gray-500">Brand mentions found</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${data.analytics.mentionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{data.analytics.mentionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-6">Content Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <span className="text-sm text-gray-700">AEO Score</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${data.content.avgAEO}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{data.content.avgAEO}/100</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <span className="text-sm text-gray-700">Technical SEO</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${data.content.avgTechnical}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{data.content.avgTechnical}/100</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pb-3">
                        <span className="text-sm text-gray-700">Content Quality</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${data.content.avgContent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{data.content.avgContent}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-6">Pages Audited</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{data.content.pagesAudited}</div>
                    <p className="text-sm text-gray-600 mb-6">Total pages analyzed</p>
                    {data.content.topPage && (
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Top Performing Page</div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {data.content.topPage.title}
                          </div>
                          <div className="text-xs text-green-600">AEO Score: {data.content.topPage.aeoScore}/100</div>
                        </div>
                        {data.content.bottomPage && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Needs Improvement</div>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {data.content.bottomPage.title}
                            </div>
                            <div className="text-xs text-orange-600">
                              AEO Score: {data.content.bottomPage.aeoScore}/100
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === "optimization" && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-6">Recommended Actions</h3>
                  <div className="space-y-4">
                    {data.optimization.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex gap-4 p-4 border rounded-lg",
                          rec.priority === "high"
                            ? "bg-orange-50 border-orange-200"
                            : rec.priority === "medium"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-green-50 border-green-200"
                        )}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                            rec.priority === "high"
                              ? "bg-orange-100"
                              : rec.priority === "medium"
                              ? "bg-blue-100"
                              : "bg-green-100"
                          )}
                        >
                          <Zap
                            className={cn(
                              "h-4 w-4",
                              rec.priority === "high"
                                ? "text-orange-600"
                                : rec.priority === "medium"
                                ? "text-blue-600"
                                : "text-green-600"
                            )}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{rec.title}</h4>
                          <p className="text-xs text-gray-600">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
