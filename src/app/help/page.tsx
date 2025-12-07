import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Help Center - RevIntel",
  description: "Get help and find answers to common questions",
}

const faqs = [
  {
    question: "How does RevIntel track my brand in AI search?",
    answer: "RevIntel sends test queries to major AI platforms and analyzes the responses to see when and how your brand is mentioned. We track ChatGPT, Claude, Perplexity, Gemini, and Grok.",
  },
  {
    question: "How often is my brand monitored?",
    answer: "You can set up automated monitoring to run daily, weekly, or on-demand. Enterprise plans include real-time monitoring capabilities.",
  },
  {
    question: "Can I track competitors too?",
    answer: "Yes! RevIntel shows you which competitors appear alongside your brand in AI responses, helping you understand the competitive landscape.",
  },
  {
    question: "What's included in the Knowledge Base feature?",
    answer: "The Knowledge Base allows you to centralize your brand information by scraping URLs and organizing content. This helps ensure AI platforms have accurate, up-to-date information about your brand.",
  },
  {
    question: "Do you offer API access?",
    answer: "Yes, our Professional and Enterprise plans include API access for custom integrations and automated workflows.",
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions and get support
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Our support team is here to help you succeed
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/documentation">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
