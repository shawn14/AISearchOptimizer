import { NextResponse } from "next/server"
import { getBrands } from "@/lib/file-storage"
import { getTemplatesByIndustry, substituteVariables, PROMPT_TEMPLATES } from "@/lib/prompts/prompt-templates"

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
    const industry = brand.industry || "business"
    const description = brand.description || ""

    // Generate contextual prompts based on the brand's industry
    const trendingPrompts = generateTrendingPrompts(brandName, industry, description)

    return NextResponse.json({
      prompts: trendingPrompts,
      hasData: true,
      brandName,
      industry,
    })
  } catch (error) {
    console.error("Error generating trending prompts:", error)
    return NextResponse.json(
      { error: "Failed to generate prompts" },
      { status: 500 }
    )
  }
}

interface TrendingPrompt {
  id: string
  prompt: string
  volume: number
  difficulty: string
  category: string
  trend: string
  competitors: number
}

function generateTrendingPrompts(
  brandName: string,
  industry: string,
  description: string
): TrendingPrompt[] {
  // Map common industries to our template categories
  const industryMapping: Record<string, string> = {
    "stocks": "Finance",
    "finance": "Finance",
    "banking": "Finance",
    "investment": "Finance",
    "trading": "Finance",
    "saas": "SaaS",
    "software": "SaaS",
    "technology": "SaaS",
    "ecommerce": "E-commerce",
    "retail": "E-commerce",
    "healthcare": "Healthcare",
    "medical": "Healthcare",
    "wellness": "Healthcare",
    "education": "Education",
    "learning": "Education",
    "travel": "Travel",
    "hospitality": "Travel",
    "marketing": "Marketing",
    "advertising": "Marketing",
    "real estate": "Real Estate",
    "property": "Real Estate",
  }

  // Determine which template category to use
  const normalizedIndustry = industry.toLowerCase()
  let templateCategory = "Generic"

  for (const [key, value] of Object.entries(industryMapping)) {
    if (normalizedIndustry.includes(key)) {
      templateCategory = value
      break
    }
  }

  // Get templates for this industry
  const industryTemplates = PROMPT_TEMPLATES.filter(
    t => t.category === templateCategory || t.category === "Generic"
  )

  // Generate contextual prompts
  const prompts: TrendingPrompt[] = []

  // Helper to infer product type from industry and description
  const inferProductType = () => {
    if (normalizedIndustry.includes("stock") || normalizedIndustry.includes("trading")) {
      return "stock tracking app"
    }
    if (normalizedIndustry.includes("saas") || normalizedIndustry.includes("software")) {
      return "software platform"
    }
    if (normalizedIndustry.includes("ecommerce")) {
      return "online store"
    }
    return "solution"
  }

  const inferUseCase = () => {
    if (normalizedIndustry.includes("stock") || normalizedIndustry.includes("trading")) {
      return "day traders"
    }
    if (normalizedIndustry.includes("saas")) {
      return "growing businesses"
    }
    return "professionals"
  }

  const inferFeature = () => {
    if (normalizedIndustry.includes("stock")) {
      return "real-time alerts"
    }
    if (normalizedIndustry.includes("saas")) {
      return "automation"
    }
    return "features"
  }

  const productType = inferProductType()
  const useCase = inferUseCase()
  const feature = inferFeature()

  // Generate prompts from templates with contextual variables
  let idCounter = 1

  // Add "Best in Category" prompt
  const bestInCategory = industryTemplates.find(t => t.id === "generic-best-in-category")
  if (bestInCategory) {
    prompts.push({
      id: String(idCounter++),
      prompt: substituteVariables(bestInCategory.prompt, { industry }),
      volume: Math.floor(Math.random() * 500) + 800,
      difficulty: "Medium",
      category: templateCategory,
      trend: `+${Math.floor(Math.random() * 30) + 25}%`,
      competitors: Math.floor(Math.random() * 8) + 10,
    })
  }

  // Add "Recommendations" prompt
  const recommendations = industryTemplates.find(t => t.id === "generic-recommendations")
  if (recommendations) {
    prompts.push({
      id: String(idCounter++),
      prompt: substituteVariables(recommendations.prompt, { product_type: productType, use_case: useCase }),
      volume: Math.floor(Math.random() * 400) + 600,
      difficulty: "Low",
      category: templateCategory,
      trend: `+${Math.floor(Math.random() * 40) + 50}%`,
      competitors: Math.floor(Math.random() * 5) + 5,
    })
  }

  // Add "Alternatives to Brand" prompt
  const alternatives = industryTemplates.find(t => t.id === "generic-alternatives")
  if (alternatives) {
    prompts.push({
      id: String(idCounter++),
      prompt: substituteVariables(alternatives.prompt, { brand_name: brandName }),
      volume: Math.floor(Math.random() * 300) + 400,
      difficulty: "High",
      category: templateCategory,
      trend: `+${Math.floor(Math.random() * 25) + 15}%`,
      competitors: Math.floor(Math.random() * 10) + 15,
    })
  }

  // Add "Feature Inquiry" prompt
  const features = industryTemplates.find(t => t.id === "generic-features")
  if (features) {
    prompts.push({
      id: String(idCounter++),
      prompt: substituteVariables(features.prompt, { product_type: productType, feature }),
      volume: Math.floor(Math.random() * 300) + 500,
      difficulty: "Medium",
      category: templateCategory,
      trend: `+${Math.floor(Math.random() * 35) + 30}%`,
      competitors: Math.floor(Math.random() * 6) + 7,
    })
  }

  // Add industry-specific prompts
  if (templateCategory === "Finance") {
    // For StockAlarm and similar finance apps
    prompts.push({
      id: String(idCounter++),
      prompt: `Best stock tracking apps for active traders`,
      volume: 890,
      difficulty: "Medium",
      category: "Finance",
      trend: "+45%",
      competitors: 8,
    })

    prompts.push({
      id: String(idCounter++),
      prompt: `How to set up stock price alerts`,
      volume: 720,
      difficulty: "Low",
      category: "Finance",
      trend: "+67%",
      competitors: 5,
    })

    prompts.push({
      id: String(idCounter++),
      prompt: `Real-time stock monitoring tools comparison`,
      volume: 650,
      difficulty: "Medium",
      category: "Finance",
      trend: "+38%",
      competitors: 9,
    })
  } else if (templateCategory === "SaaS") {
    // Add SaaS-specific prompts
    const saasTemplate = industryTemplates.find(t => t.id === "saas-best-tools")
    if (saasTemplate) {
      prompts.push({
        id: String(idCounter++),
        prompt: substituteVariables(saasTemplate.prompt, { tool_category: industry, team_size: "small" }),
        volume: Math.floor(Math.random() * 400) + 600,
        difficulty: "Medium",
        category: "SaaS",
        trend: `+${Math.floor(Math.random() * 30) + 25}%`,
        competitors: Math.floor(Math.random() * 7) + 8,
      })
    }
  } else if (templateCategory === "E-commerce") {
    // Add e-commerce specific prompts
    prompts.push({
      id: String(idCounter++),
      prompt: `Best online shopping platforms for ${industry}`,
      volume: Math.floor(Math.random() * 500) + 700,
      difficulty: "Medium",
      category: "E-commerce",
      trend: `+${Math.floor(Math.random() * 30) + 20}%`,
      competitors: Math.floor(Math.random() * 8) + 12,
    })
  }

  // Ensure we have at least 5 prompts
  while (prompts.length < 5) {
    prompts.push({
      id: String(idCounter++),
      prompt: `How to choose the best ${productType}`,
      volume: Math.floor(Math.random() * 300) + 400,
      difficulty: "Low",
      category: templateCategory,
      trend: `+${Math.floor(Math.random() * 40) + 20}%`,
      competitors: Math.floor(Math.random() * 5) + 4,
    })
  }

  return prompts
}
