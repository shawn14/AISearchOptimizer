import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Press Kit - RevIntel",
  description: "Media resources and press information for RevIntel",
}

export default function PressPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Press Kit</h1>
            <p className="text-xl text-muted-foreground">
              Media resources and company information
            </p>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">About RevIntel</h2>
              <p className="text-lg text-muted-foreground mb-4">
                RevIntel is the leading AI search intelligence platform, helping brands monitor and optimize their visibility across ChatGPT, Claude, Perplexity, and other AI search engines.
              </p>
              <p className="text-lg text-muted-foreground">
                Founded in 2024, we serve marketing teams at companies ranging from startups to Fortune 500 enterprises.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Company Facts</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Founded: 2024</li>
                <li>• Headquarters: United States</li>
                <li>• Employees: 10-50</li>
                <li>• Platform: SaaS / Web Application</li>
                <li>• Coverage: 5+ AI platforms</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Brand Assets</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Logo Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Download our logo in various formats for use in your publication.
                  </p>
                  <Button asChild>
                    <Link href="/contact">Request Assets</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Media Contact</h2>
              <p className="text-muted-foreground mb-4">
                For press inquiries, please contact:
              </p>
              <Button asChild>
                <Link href="/contact">Contact Press Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
