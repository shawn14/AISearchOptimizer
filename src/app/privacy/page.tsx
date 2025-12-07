import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Privacy Policy - RevIntel",
  description: "RevIntel privacy policy and data protection information",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground mb-4">
              RevIntel ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI search intelligence platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">Account Information</h3>
            <p className="text-muted-foreground mb-4">
              When you create an account, we collect your email address, name, and company information.
            </p>

            <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
            <p className="text-muted-foreground mb-4">
              We automatically collect information about how you use our platform, including monitoring runs, queries tested, and features accessed.
            </p>

            <h3 className="text-xl font-semibold mb-3">Brand Information</h3>
            <p className="text-muted-foreground mb-4">
              We collect and store information about the brands you monitor, including brand names, URLs, and knowledge base content you provide.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide and maintain our services</li>
              <li>To monitor your brand's visibility across AI platforms</li>
              <li>To send you service updates and marketing communications (with your consent)</li>
              <li>To improve our platform and develop new features</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest. We regularly review and update our security practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your data for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at privacy@revintel.io
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
