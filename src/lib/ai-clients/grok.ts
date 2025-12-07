import { AIClientResponse } from '@/types'

// Grok API (X.AI) - OpenAI-compatible API
// https://docs.x.ai/docs
export async function queryGrok(
  prompt: string,
  model: string = 'grok-2-1212'
): Promise<AIClientResponse> {
  const startTime = Date.now()
  const apiKey = process.env.GROK_API_KEY

  if (!apiKey) {
    throw new Error('GROK_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
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
      throw new Error(`Grok API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const executionTime = Date.now() - startTime
    const text = data.choices[0]?.message?.content || ''

    // Extract citations if available
    const citations: string[] = []
    const urlRegex = /https?:\/\/[^\s<>"\]]+/g
    const urls = text.match(urlRegex) || []
    citations.push(...new Set<string>(urls))

    // Calculate cost
    const inputTokens = data.usage?.prompt_tokens || 0
    const outputTokens = data.usage?.completion_tokens || 0
    const cost = calculateGrokCost(model, inputTokens, outputTokens)

    return {
      platform: 'grok',
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
    console.error('Grok API error:', error)
    throw new Error(`Grok query failed: ${error.message}`)
  }
}

function calculateGrokCost(model: string, inputTokens: number, outputTokens: number): number {
  // Grok pricing as of 2025
  const pricing: Record<string, { input: number; output: number }> = {
    'grok-2-1212': { input: 2 / 1_000_000, output: 10 / 1_000_000 },
    'grok-2': { input: 2 / 1_000_000, output: 10 / 1_000_000 },
  }

  const modelKey = Object.keys(pricing).find(key => model.includes(key)) || 'grok-2-1212'
  const rates = pricing[modelKey]

  return (inputTokens * rates.input) + (outputTokens * rates.output)
}
