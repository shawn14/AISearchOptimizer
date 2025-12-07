import { DashboardNav } from "@/components/dashboard/nav"
import { ChatWidget } from "@/components/dashboard/chat-widget"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "RevIntel dashboard - Monitor your brand's AI search visibility across ChatGPT, Claude, Perplexity, and Gemini",
  robots: {
    index: false,
    follow: false
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card min-h-screen fixed left-0 top-0 bottom-0">
          <DashboardNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="px-8 py-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>

        {/* Floating Chat Widget */}
        <ChatWidget />
      </div>
    </div>
  )
}
