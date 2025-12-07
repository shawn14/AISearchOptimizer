"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

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
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: "",
    coverLetter: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          position: selectedJob,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application")
      }

      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        resume: "",
        coverLetter: "",
      })
      setSelectedJob(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
                      <Button onClick={() => setSelectedJob(job.title)}>
                        Apply
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

      {/* Application Form Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Apply for {selectedJob}</CardTitle>
              <CardDescription>
                Fill out the form below to submit your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-8">
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for applying. We'll review your application and get back to you soon.
                  </p>
                  <Button onClick={() => setSuccess(false)}>Close</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume URL *</Label>
                    <Input
                      id="resume"
                      type="url"
                      required
                      placeholder="https://..."
                      value={formData.resume}
                      onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Please provide a link to your resume (Google Drive, Dropbox, LinkedIn, etc.)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      rows={6}
                      placeholder="Tell us why you're interested in this position..."
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setSelectedJob(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't see a fit?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            We're always looking for talented people. Send us your resume!
          </p>
          <Button size="lg" onClick={() => setSelectedJob("General Application")}>
            Get in Touch
          </Button>
        </div>
      </section>
    </div>
  )
}
