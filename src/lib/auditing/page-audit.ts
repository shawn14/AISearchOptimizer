import * as cheerio from 'cheerio'

export interface TechnicalAuditResult {
  score: number
  issues: string[]
  details: {
    hasMetaDescription: boolean
    hasTitle: boolean
    titleLength: number
    hasH1: boolean
    h1Count: number
    hasSchemaMarkup: boolean
    hasCanonical: boolean
    hasOpenGraph: boolean
    imageCount: number
    imagesWithAlt: number
    internalLinks: number
    externalLinks: number
    hasRobotsMeta: boolean
    pageSize: number
  }
}

export interface ContentAuditResult {
  score: number
  issues: string[]
  details: {
    wordCount: number
    paragraphCount: number
    headingStructure: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number }
    readabilityScore: number
    hasListElements: boolean
    listCount: number
    averageParagraphLength: number
    keywordDensity: Record<string, number>
  }
}

export interface AEOAuditResult {
  score: number
  issues: string[]
  details: {
    hasStructuredData: boolean
    hasFAQSchema: boolean
    hasHowToSchema: boolean
    hasArticleSchema: boolean
    semanticHTML: boolean
    contentDepth: number
    questionAnswerPairs: number
    citationsCount: number
  }
}

export interface PageAuditResult {
  url: string
  title: string | null
  technical: TechnicalAuditResult
  content: ContentAuditResult
  aeo: AEOAuditResult
  overallScore: number
}

export async function auditPageTechnical(html: string, url: string): Promise<TechnicalAuditResult> {
  const $ = cheerio.load(html)
  const issues: string[] = []

  // Meta Description
  const metaDescription = $('meta[name="description"]').attr('content')
  const hasMetaDescription = !!metaDescription && metaDescription.length > 0
  if (!hasMetaDescription) {
    issues.push('Missing meta description')
  } else if (metaDescription.length < 120) {
    issues.push('Meta description too short (< 120 characters)')
  } else if (metaDescription.length > 160) {
    issues.push('Meta description too long (> 160 characters)')
  }

  // Title Tag
  const title = $('title').text()
  const hasTitle = !!title && title.length > 0
  const titleLength = title.length
  if (!hasTitle) {
    issues.push('Missing title tag')
  } else if (titleLength < 30) {
    issues.push('Title too short (< 30 characters)')
  } else if (titleLength > 60) {
    issues.push('Title too long (> 60 characters)')
  }

  // H1 Tags
  const h1s = $('h1')
  const h1Count = h1s.length
  const hasH1 = h1Count > 0
  if (!hasH1) {
    issues.push('Missing H1 tag')
  } else if (h1Count > 1) {
    issues.push(`Multiple H1 tags found (${h1Count})`)
  }

  // Schema Markup
  const schemaScripts = $('script[type="application/ld+json"]')
  const hasSchemaMarkup = schemaScripts.length > 0
  if (!hasSchemaMarkup) {
    issues.push('No structured data (Schema.org) found')
  }

  // Canonical
  const canonical = $('link[rel="canonical"]').attr('href')
  const hasCanonical = !!canonical
  if (!hasCanonical) {
    issues.push('Missing canonical tag')
  }

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const hasOpenGraph = !!ogTitle
  if (!hasOpenGraph) {
    issues.push('Missing Open Graph tags')
  }

  // Images
  const images = $('img')
  const imageCount = images.length
  const imagesWithAlt = images.filter((_, img) => {
    return !!$(img).attr('alt')
  }).length

  if (imageCount > 0 && imagesWithAlt < imageCount) {
    issues.push(`${imageCount - imagesWithAlt} images missing alt text`)
  }

  // Links
  const links = $('a')
  const internalLinks = links.filter((_, link) => {
    const href = $(link).attr('href')
    return !!(href && (href.startsWith('/') || href.includes(new URL(url).hostname)))
  }).length
  const externalLinks = links.length - internalLinks

  // Robots Meta
  const robotsMeta = $('meta[name="robots"]').attr('content')
  const hasRobotsMeta = !!robotsMeta

  // Page Size
  const pageSize = Buffer.from(html).length
  if (pageSize > 1024 * 1024) { // > 1MB
    issues.push('Page size exceeds 1MB')
  }

  // Calculate score (out of 100)
  let score = 100
  score -= issues.length * 5 // Deduct 5 points per issue
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    issues,
    details: {
      hasMetaDescription,
      hasTitle,
      titleLength,
      hasH1,
      h1Count,
      hasSchemaMarkup,
      hasCanonical,
      hasOpenGraph,
      imageCount,
      imagesWithAlt,
      internalLinks,
      externalLinks,
      hasRobotsMeta,
      pageSize,
    }
  }
}

export async function auditPageContent(html: string): Promise<ContentAuditResult> {
  const $ = cheerio.load(html)
  const issues: string[] = []

  // Extract text content (remove scripts, styles)
  $('script, style, nav, header, footer').remove()
  const textContent = $('body').text()

  // Word Count
  const words = textContent.trim().split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length

  if (wordCount < 300) {
    issues.push('Content too short (< 300 words)')
  }

  // Paragraphs
  const paragraphs = $('p')
  const paragraphCount = paragraphs.length

  if (paragraphCount < 3) {
    issues.push('Too few paragraphs (< 3)')
  }

  // Heading Structure
  const headingStructure = {
    h1: $('h1').length,
    h2: $('h2').length,
    h3: $('h3').length,
    h4: $('h4').length,
    h5: $('h5').length,
    h6: $('h6').length,
  }

  if (headingStructure.h2 === 0) {
    issues.push('No H2 headings found')
  }

  // Lists
  const lists = $('ul, ol')
  const listCount = lists.length
  const hasListElements = listCount > 0

  if (!hasListElements) {
    issues.push('No list elements found')
  }

  // Average Paragraph Length
  let totalParagraphWords = 0
  paragraphs.each((_, p) => {
    const pWords = $(p).text().trim().split(/\s+/).filter(w => w.length > 0)
    totalParagraphWords += pWords.length
  })
  const averageParagraphLength = paragraphCount > 0 ? totalParagraphWords / paragraphCount : 0

  if (averageParagraphLength > 150) {
    issues.push('Paragraphs too long (avg > 150 words)')
  }

  // Keyword Density (top 5 keywords)
  const wordFrequency: Record<string, number> = {}
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how'])

  words.forEach(word => {
    const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (normalized.length > 3 && !stopWords.has(normalized)) {
      wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1
    }
  })

  const keywordDensity: Record<string, number> = {}
  Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([word, count]) => {
      keywordDensity[word] = (count / wordCount) * 100
    })

  // Simple Readability Score (Flesch-Kincaid approximation)
  const sentenceCount = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const syllableCount = words.reduce((sum, word) => {
    return sum + Math.max(1, word.match(/[aeiouy]+/gi)?.length || 1)
  }, 0)

  const readabilityScore = sentenceCount > 0 && wordCount > 0
    ? Math.max(0, Math.min(100, 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)))
    : 50

  if (readabilityScore < 60) {
    issues.push('Content may be difficult to read')
  }

  // Calculate score
  let score = 100
  score -= issues.length * 5

  // Bonus for good word count
  if (wordCount > 1000) score += 10
  if (wordCount > 2000) score += 5

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    issues,
    details: {
      wordCount,
      paragraphCount,
      headingStructure,
      readabilityScore,
      hasListElements,
      listCount,
      averageParagraphLength,
      keywordDensity,
    }
  }
}

export async function auditPageAEO(html: string): Promise<AEOAuditResult> {
  const $ = cheerio.load(html)
  const issues: string[] = []

  // Structured Data
  const schemaScripts = $('script[type="application/ld+json"]')
  const hasStructuredData = schemaScripts.length > 0

  let hasFAQSchema = false
  let hasHowToSchema = false
  let hasArticleSchema = false

  schemaScripts.each((_, script) => {
    const content = $(script).html()
    if (content) {
      try {
        const schema = JSON.parse(content)
        const type = Array.isArray(schema) ? schema.map(s => s['@type']).join(',') : schema['@type']

        if (type?.includes('FAQPage')) hasFAQSchema = true
        if (type?.includes('HowTo')) hasHowToSchema = true
        if (type?.includes('Article') || type?.includes('BlogPosting')) hasArticleSchema = true
      } catch (e) {
        // Invalid JSON
      }
    }
  })

  if (!hasStructuredData) {
    issues.push('No structured data found')
  }

  if (!hasFAQSchema && !hasHowToSchema) {
    issues.push('Missing FAQ or HowTo schema for AI optimization')
  }

  // Semantic HTML
  const hasMain = $('main').length > 0
  const hasArticle = $('article').length > 0
  const hasSection = $('section').length > 0
  const semanticHTML = hasMain || hasArticle || hasSection

  if (!semanticHTML) {
    issues.push('Limited use of semantic HTML5 elements')
  }

  // Content Depth (based on heading hierarchy and structure)
  const h2Count = $('h2').length
  const h3Count = $('h3').length
  const contentDepth = (h2Count * 2) + (h3Count * 1)

  if (contentDepth < 5) {
    issues.push('Content lacks depth (insufficient heading structure)')
  }

  // Question-Answer Pairs (good for AI understanding)
  const textContent = $('body').text()
  const questionMatches = textContent.match(/\b(what|why|how|when|where|who|which)\b[^.?!]*\?/gi)
  const questionAnswerPairs = questionMatches?.length || 0

  if (questionAnswerPairs === 0) {
    issues.push('No question-answer format detected')
  }

  // Citations/Links (AI models value authoritative sources)
  const links = $('a[href^="http"]')
  const citationsCount = links.filter((_, link) => {
    const text = $(link).text().toLowerCase()
    const href = $(link).attr('href') || ''
    return href.includes('doi.org') ||
           href.includes('.edu') ||
           href.includes('.gov') ||
           text.includes('source') ||
           text.includes('study') ||
           text.includes('research')
  }).length

  if (citationsCount === 0) {
    issues.push('No authoritative citations or sources found')
  }

  // Calculate AEO score
  let score = 100
  score -= issues.length * 8 // AEO issues are weighted higher

  // Bonuses
  if (hasFAQSchema) score += 15
  if (hasHowToSchema) score += 10
  if (hasArticleSchema) score += 5
  if (questionAnswerPairs > 5) score += 10
  if (citationsCount > 3) score += 10

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    issues,
    details: {
      hasStructuredData,
      hasFAQSchema,
      hasHowToSchema,
      hasArticleSchema,
      semanticHTML,
      contentDepth,
      questionAnswerPairs,
      citationsCount,
    }
  }
}

export async function auditPage(url: string): Promise<PageAuditResult> {
  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISearchOptimizer/1.0; +https://aisearchoptimizer.com/bot)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const title = $('title').text() || null

    // Run all audits in parallel
    const [technical, content, aeo] = await Promise.all([
      auditPageTechnical(html, url),
      auditPageContent(html),
      auditPageAEO(html),
    ])

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (technical.score * 0.3) +
      (content.score * 0.35) +
      (aeo.score * 0.35)
    )

    return {
      url,
      title,
      technical,
      content,
      aeo,
      overallScore,
    }
  } catch (error) {
    throw new Error(`Page audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
