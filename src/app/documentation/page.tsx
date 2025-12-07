import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Code, Zap, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Documentation - RevIntel",
  description: "Complete guides and documentation for RevIntel",
}

const sections = [
  {
    icon: Book,
    title: "Getting Started",
    description: "Learn the basics of RevIntel and set up your first monitoring campaign",
    links: [
      { title: "Quick Start Guide", href: "#" },
      { title: "Adding Your Brand", href: "#" },
      { title: "Running Your First Monitor", href: "#" },
    ],
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Complete API documentation for developers",
    links: [
      { title: "Authentication", href: "/api-reference" },
      { title: "Endpoints", href: "/api-reference" },
      { title: "Rate Limits", href: "/api-reference" },
    ],
  },
  {
    icon: Zap,
    title: "Features",
    description: "In-depth guides for all RevIntel features",
    links: [
      { title: "Brand Monitoring", href: "#" },
      { title: "Competitor Analysis", href: "#" },
      { title: "Knowledge Base", href: "#" },
    ],
  },
  {
    icon: Shield,
    title: "Best Practices",
    description: "Tips and strategies for maximizing your AI search visibility",
    links: [
      { title: "Optimization Strategies", href: "#" },
      { title: "Content Guidelines", href: "#" },
      { title: "Troubleshooting", href: "#" },
    ],
  },
]

export default function DocumentationPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to get the most out of RevIntel
            </p>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            href={link.href}
                            className="text-primary hover:underline"
                          >
                            {link.title} →
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need more help?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Can't find what you're looking for? Contact our support team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  )
}
