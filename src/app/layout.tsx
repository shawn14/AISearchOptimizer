import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "RevIntel - AI Search Intelligence Platform | AEO & Brand Visibility Tracking",
    template: "%s | RevIntel"
  },
  description: "RevIntel helps businesses monitor and optimize their visibility across AI-powered search engines including ChatGPT, Claude, Perplexity, and Gemini. Track brand mentions, analyze citations, monitor competitors, and get AI-powered recommendations to improve your Answer Engine Optimization (AEO).",
  keywords: [
    "AI search optimization",
    "AEO",
    "Answer Engine Optimization",
    "ChatGPT visibility",
    "Claude AI",
    "Perplexity AI",
    "Gemini AI",
    "brand monitoring",
    "AI citations",
    "LLM optimization",
    "generative engine optimization",
    "GEO",
    "AI search tracking",
    "competitor analysis",
    "brand mentions",
    "AI search analytics",
    "conversational search",
    "zero-click search",
    "AI-powered search engines"
  ],
  authors: [{ name: "RevIntel" }],
  creator: "RevIntel",
  publisher: "RevIntel",
  metadataBase: new URL("https://revintel.ai"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://revintel.ai",
    siteName: "RevIntel",
    title: "RevIntel - AI Search Intelligence Platform",
    description: "Monitor and optimize your brand's visibility across ChatGPT, Claude, Perplexity, and Gemini. Track mentions, analyze citations, and improve your Answer Engine Optimization (AEO).",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RevIntel - AI Search Intelligence Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "RevIntel - AI Search Intelligence Platform",
    description: "Monitor and optimize your brand's visibility across ChatGPT, Claude, Perplexity, and Gemini. Track mentions, analyze citations, and improve your AEO.",
    images: ["/twitter-image.png"],
    creator: "@revintel"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code"
  },
  category: "technology"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "RevIntel",
    "url": "https://revintel.ai",
    "logo": "https://revintel.ai/logo.png",
    "description": "AI Search Intelligence Platform for monitoring and optimizing brand visibility across AI-powered search engines.",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/revintel",
      "https://linkedin.com/company/revintel"
    ]
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "RevIntel",
    "url": "https://revintel.ai",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "RevIntel is an AI Search Intelligence Platform that helps businesses monitor and optimize their visibility across AI-powered search engines including ChatGPT, Claude, Perplexity, and Gemini. Track brand mentions, analyze citations, monitor competitors, and get AI-powered recommendations to improve your Answer Engine Optimization (AEO).",
    "featureList": [
      "AI Search Monitoring across ChatGPT, Claude, Perplexity, and Gemini",
      "Brand Mention Tracking",
      "Citation Analysis",
      "Competitor Intelligence",
      "Answer Engine Optimization (AEO) Scoring",
      "AI-Powered Recommendations",
      "Real-time Visibility Metrics",
      "Content Optimization Insights",
      "Google Analytics Integration"
    ],
    "screenshot": "https://revintel.ai/screenshot.png"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RevIntel",
    "url": "https://revintel.ai",
    "description": "AI Search Intelligence Platform for Answer Engine Optimization",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://revintel.ai/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
