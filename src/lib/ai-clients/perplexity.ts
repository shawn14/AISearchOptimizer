import { AIClientResponse } from '@/types'

// Perplexity uses OpenAI-compatible API
// https://docs.perplexity.ai/docs/getting-started
export async function queryPerplexity(
  prompt: string,
  model: string = 'sonar'
): Promise<AIClientResponse> {
  const startTime = Date.now()
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const executionTime = Date.now() - startTime
    const text = data.choices[0]?.message?.content || ''

    // Extract citations from Perplexity response
    const citations = data.citations || []

    // Calculate cost (Perplexity pricing)
    const inputTokens = data.usage?.prompt_tokens || 0
    const outputTokens = data.usage?.completion_tokens || 0
    const cost = calculatePerplexityCost(model, inputTokens, outputTokens)

    return {
      platform: 'perplexity',
      text,
      citations,
      metadata: {
        model: data.model || model,
        tokens: data.usage?.total_tokens || 0,
        cost,
        responseTime: executionTime,
        inputTokens,
        outputTokens,
      },
    }
  } catch (error: any) {
    console.error('Perplexity API error:', error)
    throw new Error(`Perplexity query failed: ${error.message}`)
  }
}

function calculatePerplexityCost(model: string, inputTokens: number, outputTokens: number): number {
  // Perplexity pricing as of 2025
  const pricing: Record<string, { input: number; output: number }> = {
    'sonar': { input: 0.2 / 1_000_000, output: 0.2 / 1_000_000 },
    'sonar-pro': { input: 3 / 1_000_000, output: 15 / 1_000_000 },
    'sonar-reasoning': { input: 1 / 1_000_000, output: 5 / 1_000_000 },
  }

  const modelKey = Object.keys(pricing).find(key => model.includes(key)) || 'sonar'
  const rates = pricing[modelKey]

  return (inputTokens * rates.input) + (outputTokens * rates.output)
}
