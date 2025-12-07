import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">RevIntel</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Pricing</Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition">Login</Link>
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 h-10">
              <Link href="/signup">Start for free</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
