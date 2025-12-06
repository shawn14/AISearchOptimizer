"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Target,
  BarChart3,
  FileText,
  Settings,
  Sparkles,
  Bot
} from "lucide-react"

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
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
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

  return (
    <nav className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-4 py-4 mb-4 border-b">
        <Sparkles className="h-6 w-6" />
        <span className="font-bold text-lg">AISearchOptimizer</span>
      </div>
      {navigation.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-base font-medium transition-all relative",
              isActive
                ? "bg-black text-white rounded-r-none"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
            {isActive && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-black" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
