import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Fetch the page
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RevIntel/1.0; +https://revintel.io)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract metadata
    const metadata = {
      title: $('title').text() ||
             $('meta[property="og:title"]').attr('content') ||
             $('meta[name="twitter:title"]').attr('content') ||
             '',
      description: $('meta[name="description"]').attr('content') ||
                   $('meta[property="og:description"]').attr('content') ||
                   $('meta[name="twitter:description"]').attr('content') ||
                   '',
      canonical: $('link[rel="canonical"]').attr('href') || url,
      ogImage: $('meta[property="og:image"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',

      // SEO metrics
      h1Count: $('h1').length,
      h2Count: $('h2').length,
      imageCount: $('img').length,
      imagesWithoutAlt: $('img:not([alt])').length,
      wordCount: $('body').text().trim().split(/\s+/).length,

      // Schema.org structured data
      hasStructuredData: $('script[type="application/ld+json"]').length > 0,

      // Open Graph tags
      hasOgTags: $('meta[property^="og:"]').length > 0,

      // Meta robots
      metaRobots: $('meta[name="robots"]').attr('content') || '',
    }

    return NextResponse.json({ metadata })
  } catch (error: any) {
    console.error('Fetch metadata error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}
