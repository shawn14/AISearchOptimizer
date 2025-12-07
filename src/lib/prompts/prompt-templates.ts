/**
 * Prompt Templates by Industry
 * Pre-built prompt templates optimized for different industries
 */

export interface PromptTemplate {
  id: string
  name: string
  category: string
  prompt: string
  variables: string[] // e.g., ['brand_name', 'industry', 'product_type']
  description: string
  industry?: string
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Generic / Universal
  {
    id: 'generic-best-in-category',
    name: 'Best in Category',
    category: 'Generic',
    prompt: 'What are the best {{industry}} companies?',
    variables: ['industry'],
    description: 'General best-in-category query',
  },
  {
    id: 'generic-recommendations',
    name: 'Recommendations',
    category: 'Generic',
    prompt: 'Can you recommend {{product_type}} for {{use_case}}?',
    variables: ['product_type', 'use_case'],
    description: 'Product recommendation query',
  },
  {
    id: 'generic-alternatives',
    name: 'Alternatives to Brand',
    category: 'Generic',
    prompt: 'What are alternatives to {{brand_name}}?',
    variables: ['brand_name'],
    description: 'Find competitive alternatives',
  },
  {
    id: 'generic-comparison',
    name: 'Brand Comparison',
    category: 'Generic',
    prompt: 'Compare {{brand_name}} vs {{competitor_name}} for {{category}}',
    variables: ['brand_name', 'competitor_name', 'category'],
    description: 'Direct competitor comparison',
  },
  {
    id: 'generic-features',
    name: 'Feature Inquiry',
    category: 'Generic',
    prompt: 'Which {{product_type}} has the best {{feature}}?',
    variables: ['product_type', 'feature'],
    description: 'Feature-based search',
  },

  // SaaS & Technology
  {
    id: 'saas-best-tools',
    name: 'Best SaaS Tools',
    category: 'SaaS',
    industry: 'SaaS',
    prompt: 'What are the best {{tool_category}} tools for {{team_size}} teams?',
    variables: ['tool_category', 'team_size'],
    description: 'SaaS tool recommendations by team size',
  },
  {
    id: 'saas-use-case',
    name: 'SaaS by Use Case',
    category: 'SaaS',
    industry: 'SaaS',
    prompt: 'Best {{software_type}} for {{use_case}}',
    variables: ['software_type', 'use_case'],
    description: 'Use case specific SaaS search',
  },
  {
    id: 'saas-integration',
    name: 'Integration Compatibility',
    category: 'SaaS',
    industry: 'SaaS',
    prompt: 'Which {{software_type}} integrates with {{platform}}?',
    variables: ['software_type', 'platform'],
    description: 'Integration-focused query',
  },
  {
    id: 'saas-pricing',
    name: 'Affordable Options',
    category: 'SaaS',
    industry: 'SaaS',
    prompt: 'Most affordable {{software_type}} for {{budget_range}}',
    variables: ['software_type', 'budget_range'],
    description: 'Price-conscious search',
  },

  // E-commerce & Retail
  {
    id: 'ecommerce-product-search',
    name: 'Product Search',
    category: 'E-commerce',
    industry: 'E-commerce',
    prompt: 'Where can I buy {{product_name}} online?',
    variables: ['product_name'],
    description: 'Product availability query',
  },
  {
    id: 'ecommerce-best-price',
    name: 'Best Price',
    category: 'E-commerce',
    industry: 'E-commerce',
    prompt: 'Best deals on {{product_category}} under {{price_point}}',
    variables: ['product_category', 'price_point'],
    description: 'Price comparison query',
  },
  {
    id: 'ecommerce-reviews',
    name: 'Product Reviews',
    category: 'E-commerce',
    industry: 'E-commerce',
    prompt: 'Reviews for {{brand_name}} {{product_type}}',
    variables: ['brand_name', 'product_type'],
    description: 'Review and reputation query',
  },

  // Healthcare & Wellness
  {
    id: 'healthcare-provider',
    name: 'Provider Search',
    category: 'Healthcare',
    industry: 'Healthcare',
    prompt: 'Best {{specialty}} providers in {{location}}',
    variables: ['specialty', 'location'],
    description: 'Healthcare provider search',
  },
  {
    id: 'healthcare-treatment',
    name: 'Treatment Options',
    category: 'Healthcare',
    industry: 'Healthcare',
    prompt: 'What are the best treatments for {{condition}}?',
    variables: ['condition'],
    description: 'Medical treatment information',
  },

  // Finance & Banking
  {
    id: 'finance-services',
    name: 'Financial Services',
    category: 'Finance',
    industry: 'Finance',
    prompt: 'Best {{service_type}} for {{customer_segment}}',
    variables: ['service_type', 'customer_segment'],
    description: 'Financial service recommendations',
  },
  {
    id: 'finance-comparison',
    name: 'Financial Comparison',
    category: 'Finance',
    industry: 'Finance',
    prompt: 'Compare {{product_type}} interest rates and fees',
    variables: ['product_type'],
    description: 'Financial product comparison',
  },

  // Real Estate
  {
    id: 'realestate-market',
    name: 'Market Information',
    category: 'Real Estate',
    industry: 'Real Estate',
    prompt: 'Best neighborhoods in {{city}} for {{buyer_type}}',
    variables: ['city', 'buyer_type'],
    description: 'Real estate market query',
  },

  // Professional Services
  {
    id: 'services-provider',
    name: 'Service Provider',
    category: 'Professional Services',
    industry: 'Professional Services',
    prompt: 'Top rated {{service_type}} in {{location}}',
    variables: ['service_type', 'location'],
    description: 'Local service provider search',
  },

  // Education
  {
    id: 'education-courses',
    name: 'Course Search',
    category: 'Education',
    industry: 'Education',
    prompt: 'Best {{subject}} courses for {{skill_level}}',
    variables: ['subject', 'skill_level'],
    description: 'Educational course search',
  },
  {
    id: 'education-platform',
    name: 'Learning Platform',
    category: 'Education',
    industry: 'Education',
    prompt: 'Best online learning platforms for {{topic}}',
    variables: ['topic'],
    description: 'Platform recommendation',
  },

  // Travel & Hospitality
  {
    id: 'travel-destination',
    name: 'Destination Recommendations',
    category: 'Travel',
    industry: 'Travel',
    prompt: 'Best {{destination_type}} for {{traveler_type}} in {{season}}',
    variables: ['destination_type', 'traveler_type', 'season'],
    description: 'Travel destination search',
  },
  {
    id: 'travel-booking',
    name: 'Booking Platforms',
    category: 'Travel',
    industry: 'Travel',
    prompt: 'Best platforms to book {{service_type}} in {{location}}',
    variables: ['service_type', 'location'],
    description: 'Booking service comparison',
  },

  // Marketing & Advertising
  {
    id: 'marketing-agency',
    name: 'Agency Search',
    category: 'Marketing',
    industry: 'Marketing',
    prompt: 'Top {{service_type}} agencies for {{industry}}',
    variables: ['service_type', 'industry'],
    description: 'Marketing agency search',
  },
  {
    id: 'marketing-tools',
    name: 'Marketing Tools',
    category: 'Marketing',
    industry: 'Marketing',
    prompt: 'Best {{tool_type}} tools for {{use_case}}',
    variables: ['tool_type', 'use_case'],
    description: 'Marketing tool recommendations',
  },
]

/**
 * Get templates by industry
 */
export function getTemplatesByIndustry(industry: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(
    t => !t.industry || t.industry.toLowerCase() === industry.toLowerCase()
  )
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(t => t.id === id)
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return [...new Set(PROMPT_TEMPLATES.map(t => t.category))].sort()
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(t => t.category === category)
}

/**
 * Substitute variables in a prompt
 */
export function substituteVariables(
  prompt: string,
  variables: Record<string, string>
): string {
  let result = prompt

  // Replace all {{variable}} with values
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  })

  return result
}

/**
 * Extract variables from a prompt string
 */
export function extractVariables(prompt: string): string[] {
  const matches = prompt.match(/{{([^}]+)}}/g)
  if (!matches) return []

  return matches.map(match => match.replace(/{{|}}/g, ''))
}

/**
 * Validate that all variables are provided
 */
export function validatePrompt(
  prompt: string,
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const required = extractVariables(prompt)
  const provided = Object.keys(variables)
  const missing = required.filter(v => !provided.includes(v))

  return {
    valid: missing.length === 0,
    missing,
  }
}
