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
import { useState, useEffect } from "react"
import Image from "next/image"

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
  const [brandFavicon, setBrandFavicon] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBrandFavicon() {
      try {
        const response = await fetch('/api/brands')
        const brands = await response.json()
        if (brands.length > 0 && brands[0].website_url) {
          const url = new URL(brands[0].website_url.startsWith('http')
            ? brands[0].website_url
            : `https://${brands[0].website_url}`)
          setBrandFavicon(`https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`)
        }
      } catch (error) {
        console.error('Failed to fetch brand favicon:', error)
      }
    }
    fetchBrandFavicon()
  }, [])

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
        <div className="h-8 w-8 bg-gray-900 rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="font-semibold text-lg">RevIntel</span>
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
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {brandFavicon ? (
            <div className="h-4 w-4 relative flex-shrink-0">
              <Image
                src={brandFavicon}
                alt="Brand"
                width={16}
                height={16}
                className="object-contain"
                onError={() => setBrandFavicon(null)}
              />
            </div>
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span>Sign Out</span>
        </Button>
      </div>
    </nav>
  )
}
