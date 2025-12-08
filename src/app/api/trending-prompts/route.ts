import { NextResponse } from "next/server"
import { getBrands } from "@/lib/file-storage"
import { generateQueriesWithCache } from "@/lib/prompts/llm-query-generator"

export async function GET() {
  try {
    // Get the user's brand(s)
    const brands = await getBrands()

    if (brands.length === 0) {
      // No brands yet - return empty state
      return NextResponse.json({ prompts: [], hasData: false })
    }

    // Use the first brand (or we could support multiple brands later)
    const brand = brands[0]
    const brandName = brand.name
    const industry = brand.industry || null
    const description = brand.description || null
    const websiteUrl = brand.website_url || null

    // Generate queries using LLM analysis
    const result = await generateQueriesWithCache(
      brandName,
      websiteUrl,
      industry,
      description,
      30 // Generate 30 queries
    )

    // Transform to match frontend expectation
    const prompts = result.queries.map((q, idx) => ({
      id: String(idx + 1),
      prompt: q.query,
      category: q.category,
      intent: q.intent,
      reasoning: q.reasoning
    }))

    return NextResponse.json({
      prompts,
      hasData: true,
      brandName,
      industry,
      generationCost: result.totalCost
    })
  } catch (error) {
    console.error("Error generating trending prompts:", error)
    return NextResponse.json(
      { error: "Failed to generate prompts" },
      { status: 500 }
    )
  }
}

