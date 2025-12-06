import Anthropic from '@anthropic-ai/sdk'
import { AIClientResponse } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function queryClaude(
  prompt: string,
  model: string = 'claude-3-haiku-20240307'
): Promise<AIClientResponse> {
  const startTime = Date.now()

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1500,
      temperature: 0, // Deterministic responses
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const executionTime = Date.now() - startTime
    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''

    // Calculate cost
    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens
    const cost = calculateClaudeCost(model, inputTokens, outputTokens)

    return {
      platform: 'claude',
      text,
      citations: extractCitations(text),
      metadata: {
        model: response.model,
        tokens: inputTokens + outputTokens,
        cost,
        responseTime: executionTime,
        inputTokens,
        outputTokens,
      },
    }
  } catch (error: any) {
    console.error('Anthropic API error:', error)
    throw new Error(`Claude query failed: ${error.message}`)
  }
}

function calculateClaudeCost(model: string, inputTokens: number, outputTokens: number): number {
  // Pricing as of 2024 - update as needed
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-opus': { input: 15 / 1_000_000, output: 75 / 1_000_000 },
    'claude-3-sonnet': { input: 3 / 1_000_000, output: 15 / 1_000_000 },
    'claude-3-haiku': { input: 0.25 / 1_000_000, output: 1.25 / 1_000_000 },
  }

  const modelKey = Object.keys(pricing).find(key => model.includes(key)) || 'claude-3-haiku'
  const rates = pricing[modelKey]

  return (inputTokens * rates.input) + (outputTokens * rates.output)
}

function extractCitations(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"\]]+/g
  const urls = text.match(urlRegex) || []
  return [...new Set(urls)]
}
