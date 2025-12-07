import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Careers - RevIntel",
  description: "Join our team and help shape the future of AI search",
}

const openings = [
  {
    title: "Senior Full Stack Engineer",
    location: "Remote",
    type: "Full-time",
    description: "Help build the platform that's defining AI search intelligence.",
  },
  {
    title: "Product Designer",
    location: "Remote",
    type: "Full-time",
    description: "Design beautiful, intuitive experiences for marketing teams.",
  },
  {
    title: "Customer Success Manager",
    location: "Remote",
    type: "Full-time",
    description: "Help our customers succeed with AI search optimization.",
  },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Careers at RevIntel</h1>
            <p className="text-xl text-muted-foreground">
              Join us in building the future of brand visibility in AI search
            </p>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-6">Why Join RevIntel?</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                We're a small, fast-moving team working on one of the most exciting challenges in marketing technology: helping brands thrive in the age of AI search.
              </p>
              <p>
                You'll have the opportunity to shape our product, work with cutting-edge AI technology, and make a real impact on how brands connect with customers.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-2xl font-bold mb-6">Benefits</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Competitive salary and equity</li>
              <li>• Remote-first culture</li>
              <li>• Health, dental, and vision insurance</li>
              <li>• Unlimited PTO</li>
              <li>• Latest tech equipment</li>
              <li>• Professional development budget</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
            <div className="space-y-6">
              {openings.map((job, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="text-base">
                          {job.location} • {job.type}
                        </CardDescription>
                      </div>
                      <Button asChild>
                        <Link href="/contact">Apply</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{job.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't see a fit?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            We're always looking for talented people. Send us your resume!
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
