"use client"

import { useState } from "react"
import { BarChart3, Target, FileText, Zap } from "lucide-react"
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

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("analytics")

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
                        <p className="text-sm font-medium text-gray-500 mb-2">When someone asks:</p>
                        <p className="text-base font-semibold text-gray-900 mb-4">"What's the best CRM for small businesses?"</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-5 border-l-4 border-green-500">
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        Based on current market analysis, here are the top CRM solutions for small businesses:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex-shrink-0">
                            1
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Your Brand</p>
                            <p className="text-xs text-gray-600">Ranked first in 72% of AI responses</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 opacity-60">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex-shrink-0">
                            2
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Competitor A</p>
                            <p className="text-xs text-gray-500">Ranked second in 68% of responses</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 opacity-60">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex-shrink-0">
                            3
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Competitor B</p>
                            <p className="text-xs text-gray-500">Ranked third in 62% of responses</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Tracked across ChatGPT, Google & Perplexity
                      </span>
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                        ↑ Up 2 positions this week
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
                        <span className="text-3xl font-bold text-gray-900">#1</span>
                        <span className="text-sm text-gray-500">position</span>
                      </div>
                      <p className="text-xs text-gray-600">In 78% of responses</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Google</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">#1</span>
                        <span className="text-sm text-gray-500">position</span>
                      </div>
                      <p className="text-xs text-gray-600">In 71% of AI Overviews</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Perplexity</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">#2</span>
                        <span className="text-sm text-gray-500">position</span>
                      </div>
                      <p className="text-xs text-gray-600">In 67% of responses</p>
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
                  {/* Platform Cards */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">ChatGPT</h3>
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">156</div>
                    <p className="text-xs text-gray-500">Total mentions</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">78%</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">Claude</h3>
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">142</div>
                    <p className="text-xs text-gray-500">Total mentions</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "71%" }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">71%</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">Perplexity</h3>
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">128</div>
                    <p className="text-xs text-gray-500">Total mentions</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "64%" }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">64%</span>
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
                            <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">85/100</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <span className="text-sm text-gray-700">Technical SEO</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }}></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">92/100</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pb-3">
                        <span className="text-sm text-gray-700">Content Quality</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: "78%" }}></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">78/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-6">Pages Audited</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">24</div>
                    <p className="text-sm text-gray-600 mb-6">Total pages analyzed</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">High Priority</span>
                        <span className="font-medium text-orange-600">3 issues</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Medium Priority</span>
                        <span className="font-medium text-yellow-600">8 issues</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Low Priority</span>
                        <span className="font-medium text-gray-500">12 issues</span>
                      </div>
                    </div>
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
                    <div className="flex gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Zap className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Add FAQ Schema</h4>
                        <p className="text-xs text-gray-600">
                          Adding FAQ structured data to 3 pages can improve visibility by 15-20%
                        </p>
                        <button className="mt-2 text-xs font-medium text-orange-600 hover:text-orange-700">
                          View Details →
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Optimize Content Depth</h4>
                        <p className="text-xs text-gray-600">
                          5 pages need more comprehensive content (1000+ words recommended)
                        </p>
                        <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">
                          View Details →
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Improve Citation Sources</h4>
                        <p className="text-xs text-gray-600">
                          Add authoritative backlinks from .edu and .gov domains
                        </p>
                        <button className="mt-2 text-xs font-medium text-green-600 hover:text-green-700">
                          View Details →
                        </button>
                      </div>
                    </div>
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
