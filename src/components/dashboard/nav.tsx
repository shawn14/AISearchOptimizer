"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Target,
  BarChart3,
  FileText,
  Settings,
  Sparkles,
  Bot,
  MessageSquare,
  LogOut,
  BookOpen,
  Eye,
  TrendingUp,
  Search,
  Quote,
  Users,
  Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Agent",
    href: "/dashboard/agent",
    icon: Bot,
  },
  {
    name: "Brands",
    href: "/dashboard/brands",
    icon: Target,
  },
  {
    name: "Competitors",
    href: "/dashboard/competitors",
    icon: Users,
  },
  {
    name: "Knowledge Base",
    href: "/dashboard/knowledge",
    icon: BookOpen,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Visibility",
    href: "/dashboard/visibility",
    icon: Eye,
  },
  {
    name: "Mentions",
    href: "/dashboard/mentions",
    icon: MessageSquare,
  },
  {
    name: "Citations",
    href: "/dashboard/citations",
    icon: Quote,
  },
  {
    name: "Traffic",
    href: "/dashboard/traffic",
    icon: TrendingUp,
  },
  {
    name: "Prompts",
    href: "/dashboard/prompts",
    icon: Search,
  },
  {
    name: "Recommendations",
    href: "/dashboard/recommendations",
    icon: Lightbulb,
  },
  {
    name: "Content",
    href: "/dashboard/content",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/signin')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <nav className="flex flex-col h-screen bg-card">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="h-9 w-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-primary-foreground font-bold text-sm">R</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none">RevIntel</span>
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5">AI Search Intelligence</span>
        </div>
      </div>
      <div className="flex-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg mb-1",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </div>
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
