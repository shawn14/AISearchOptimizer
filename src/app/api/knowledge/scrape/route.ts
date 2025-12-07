import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISearchOptimizer/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch URL' },
        { status: response.status }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract metadata
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      'Untitled'

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    // Extract main content
    // Try to find article content, then fallback to body text
    let content = ''
    const articleSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.content',
      'body',
    ]

    for (const selector of articleSelectors) {
      const element = $(selector).first()
      if (element.length) {
        // Remove script, style, nav, header, footer elements
        element.find('script, style, nav, header, footer, .nav, .header, .footer').remove()
        content = element.text().trim()
        if (content.length > 100) break
      }
    }

    // Clean up content - remove extra whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .substring(0, 5000) // Limit to 5000 characters

    // Auto-categorize based on URL and content
    let type = 'Article'
    let category = 'General'

    const urlLower = url.toLowerCase()
    const contentLower = (title + ' ' + description + ' ' + content).toLowerCase()

    if (urlLower.includes('/about') || contentLower.includes('about us')) {
      type = 'About'
      category = 'Company Info'
    } else if (urlLower.includes('/product') || urlLower.includes('/features')) {
      type = 'Product'
      category = 'Products'
    } else if (urlLower.includes('/pricing') || contentLower.includes('pricing plan')) {
      type = 'Pricing'
      category = 'Sales'
    } else if (urlLower.includes('/case-stud') || urlLower.includes('/customer')) {
      type = 'Case Study'
      category = 'Marketing'
    } else if (urlLower.includes('/blog') || urlLower.includes('/news')) {
      type = 'Blog'
      category = 'Marketing'
    } else if (urlLower.includes('/support') || urlLower.includes('/help')) {
      type = 'Support'
      category = 'Support'
    }

    return NextResponse.json({
      success: true,
      data: {
        title: title.substring(0, 200),
        content: description || content,
        type,
        category,
        url,
      },
    })
  } catch (error: any) {
    console.error('Error scraping URL:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to scrape URL' },
      { status: 500 }
    )
  }
}
