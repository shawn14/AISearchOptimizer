import OpenAI from 'openai'
import { AIClientResponse } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function queryOpenAI(
  prompt: string,
  model: string = 'gpt-3.5-turbo'
): Promise<AIClientResponse> {
  const startTime = Date.now()

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0, // Deterministic responses
      max_tokens: 1500,
    })

    const executionTime = Date.now() - startTime
    const text = response.choices[0]?.message?.content || ''

    // Calculate cost (approximate - update with current pricing)
    const inputTokens = response.usage?.prompt_tokens || 0
    const outputTokens = response.usage?.completion_tokens || 0
    const cost = calculateOpenAICost(model, inputTokens, outputTokens)

    return {
      platform: 'chatgpt',
      text,
      citations: extractCitations(text),
      metadata: {
        model: response.model,
        tokens: (response.usage?.total_tokens || 0),
        cost,
        responseTime: executionTime,
        inputTokens,
        outputTokens,
      },
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    throw new Error(`OpenAI query failed: ${error.message}`)
  }
}

function calculateOpenAICost(model: string, inputTokens: number, outputTokens: number): number {
  // Pricing as of 2024 - update as needed
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
    'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
    'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
  }

  const modelKey = Object.keys(pricing).find(key => model.includes(key)) || 'gpt-3.5-turbo'
  const rates = pricing[modelKey]

  return (inputTokens * rates.input) + (outputTokens * rates.output)
}

function extractCitations(text: string): string[] {
  // Extract URLs from the response text
  const urlRegex = /https?:\/\/[^\s<>"\]]+/g
  const urls = text.match(urlRegex) || []
  return [...new Set(urls)] // Remove duplicates
}
