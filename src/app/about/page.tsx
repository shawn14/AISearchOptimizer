import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "About - RevIntel",
  description: "Learn about RevIntel's mission to help brands thrive in the age of AI search",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">About RevIntel</h1>
            <p className="text-xl text-muted-foreground">
              We're building the future of brand visibility in AI search
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              As AI search engines like ChatGPT, Claude, and Perplexity become the primary way people discover information, brands need new tools to understand and optimize their visibility in this emerging landscape.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              RevIntel was founded to solve this problem. We help marketing teams monitor, analyze, and optimize their brand's presence across all major AI platforms.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform provides the insights and tools you need to ensure your brand is being recommended when it matters most.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Our Values</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  We believe in clear, honest reporting and giving you complete visibility into your AI search performance.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We're constantly evolving our platform to stay ahead of the rapidly changing AI landscape.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Customer Success</h3>
                <p className="text-muted-foreground">
                  Your success is our success. We're committed to helping you achieve your brand visibility goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join leading brands using RevIntel to dominate AI search
          </p>
          <Button asChild size="lg">
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
