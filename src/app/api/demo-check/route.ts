import { NextRequest, NextResponse } from "next/server"
import { queryAllPlatforms, analyzeBrandMention as analyzeMention } from "@/lib/ai-clients"
import { AIPlatform } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { brandName, competitor, industry } = await request.json()

    if (!brandName || !competitor || !industry) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate a relevant query based on the industry
    const query = `What are the best ${industry} solutions for businesses? Please provide a comprehensive list with brief descriptions.`

    // Query all platforms: ChatGPT, Perplexity, and Grok
    // Note: Claude and Gemini can be added but may have rate limits
    const platforms: AIPlatform[] = ['chatgpt', 'perplexity', 'grok']

    console.log(`Running demo check for: ${brandName} vs ${competitor} in ${industry}`)
    console.log(`Platforms: ${platforms.join(', ')}`)

    const results = await queryAllPlatforms(query, platforms)

    // Analyze each platform's response
    const platformResults = results.map(result => {
      const yourBrandAnalysis = analyzeBrandMention(result.response, brandName)
      const competitorAnalysis = analyzeBrandMention(result.response, competitor)

      return {
        platform: result.platform,
        query,
        response: result.response,
        yourBrand: yourBrandAnalysis,
        competitor: competitorAnalysis,
        error: result.error,
      }
    })

    // If all platforms failed, return error
    if (platformResults.every(r => r.error)) {
      return NextResponse.json(
        { error: "Failed to query AI platforms. Please try again." },
        { status: 500 }
      )
    }

    // Return results from all platforms
    return NextResponse.json({
      query,
      platforms: platformResults,
      summary: {
        totalPlatforms: platformResults.length,
        yourBrandMentions: platformResults.filter(r => r.yourBrand.mentioned).length,
        competitorMentions: platformResults.filter(r => r.competitor.mentioned).length,
      }
    })
  } catch (error: any) {
    console.error("Demo check error:", error)
    return NextResponse.json(
      { error: "Failed to check rankings. Please try again." },
      { status: 500 }
    )
  }
}

function analyzeBrandMention(text: string, brandName: string) {
  const lowerText = text.toLowerCase()
  const lowerBrand = brandName.toLowerCase()

  // Check if mentioned
  const mentioned = lowerText.includes(lowerBrand)

  if (!mentioned) {
    return {
      mentioned: false,
      prominence: 0,
    }
  }

  // Find position in list (simple heuristic)
  const lines = text.split('\n')
  let position: number | undefined
  let context = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (line.includes(lowerBrand)) {
      // Try to extract position number (e.g., "1.", "2)", etc.)
      const posMatch = lines[i].match(/^\s*(\d+)[\.\)]\s/)
      if (posMatch) {
        position = parseInt(posMatch[1])
      }

      // Get context (the line mentioning the brand)
      context = lines[i].replace(/^\s*\d+[\.\)]\s*/, "").trim()

      // Also include the next line if it exists and looks like a description
      if (i + 1 < lines.length && !lines[i + 1].match(/^\s*\d+[\.\)]/)) {
        context += " " + lines[i + 1].trim()
      }

      break
    }
  }

  // Calculate prominence (rough estimate based on position in text)
  const brandIndex = lowerText.indexOf(lowerBrand)
  const textLength = text.length
  const relativePosition = brandIndex / textLength

  // Earlier in text = higher prominence
  // Position 1 = 100%, Position 2 = 85%, Position 3 = 70%, etc.
  let prominence = 100
  if (position) {
    prominence = Math.max(100 - (position - 1) * 15, 40)
  } else {
    // If no numbered position, use relative text position
    prominence = Math.round((1 - relativePosition) * 100)
  }

  return {
    mentioned: true,
    position,
    prominence,
    context: context.substring(0, 200), // Limit context length
  }
}
