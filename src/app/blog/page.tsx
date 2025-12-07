import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Blog - RevIntel",
  description: "Insights, updates, and best practices for AI search optimization",
}

const posts = [
  {
    title: "The Rise of AI Search: What It Means for Your Brand",
    excerpt: "Understanding how ChatGPT, Claude, and other AI assistants are changing the way people discover brands.",
    date: "2025-01-15",
    category: "Industry Insights",
    slug: "rise-of-ai-search",
  },
  {
    title: "5 Strategies to Improve Your AI Search Visibility",
    excerpt: "Actionable tips to increase your brand's chances of being recommended by AI platforms.",
    date: "2025-01-10",
    category: "Best Practices",
    slug: "5-strategies-ai-visibility",
  },
  {
    title: "How to Track Your Brand in ChatGPT Responses",
    excerpt: "A step-by-step guide to monitoring your brand's presence in AI-generated content.",
    date: "2025-01-05",
    category: "Tutorials",
    slug: "track-brand-chatgpt",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground">
              Insights, updates, and best practices for AI search optimization
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {posts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{post.category}</Badge>
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                  </div>
                  <CardTitle className="text-2xl">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-base">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Read more →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mt-12 text-center">
            <p className="text-muted-foreground">More posts coming soon...</p>
          </div>
        </div>
      </section>
    </div>
  )
}
