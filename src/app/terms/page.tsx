import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Terms of Service - RevIntel",
  description: "RevIntel terms of service and user agreement",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using RevIntel, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Use of Service</h2>
            <p className="text-muted-foreground mb-4">
              You may use RevIntel only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Use the service in any way that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Accounts</h2>
            <p className="text-muted-foreground mb-4">
              You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Subscription and Payment</h2>
            <p className="text-muted-foreground mb-4">
              Subscription fees are billed in advance on a recurring basis (monthly or annually). You can cancel your subscription at any time through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              The service and its original content, features, and functionality are owned by RevIntel and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              RevIntel shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Contact</h2>
            <p className="text-muted-foreground">
              Questions about these Terms? Contact us at legal@revintel.io
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
