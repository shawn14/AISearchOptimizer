import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIClientResponse } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function queryGemini(
  prompt: string,
  model: string = 'gemini-2.5-flash-lite'
): Promise<AIClientResponse> {
  const startTime = Date.now()

  try {
    const geminiModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1500,
      }
    })

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const executionTime = Date.now() - startTime

    // Note: Gemini API doesn't always provide token counts in the same way
    const tokenCount = response.usageMetadata?.totalTokenCount || 0
    const inputTokens = response.usageMetadata?.promptTokenCount || 0
    const outputTokens = response.usageMetadata?.candidatesTokenCount || 0

    // Calculate cost
    const cost = calculateGeminiCost(model, inputTokens, outputTokens)

    return {
      platform: 'gemini',
      text,
      citations: extractCitations(text),
      metadata: {
        model,
        tokens: tokenCount,
        cost,
        responseTime: executionTime,
        inputTokens,
        outputTokens,
      },
    }
  } catch (error: any) {
    console.error('Gemini API error:', error)
    throw new Error(`Gemini query failed: ${error.message}`)
  }
}

function calculateGeminiCost(model: string, inputTokens: number, outputTokens: number): number {
  // Gemini pricing as of December 2025
  const pricing: Record<string, { input: number; output: number }> = {
    'gemini-2.5-flash-lite': { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 }, // Cheapest option
    'gemini-2.5-flash': { input: 0.30 / 1_000_000, output: 2.50 / 1_000_000 },
    'gemini-1.5-pro': { input: 1.25 / 1_000_000, output: 5 / 1_000_000 },
    'gemini-1.5-flash': { input: 0.075 / 1_000_000, output: 0.3 / 1_000_000 },
    'gemini-pro': { input: 0.5 / 1_000_000, output: 1.5 / 1_000_000 },
  }

  const modelKey = Object.keys(pricing).find(key => model.includes(key)) || 'gemini-2.5-flash-lite'
  const rates = pricing[modelKey]

  return (inputTokens * rates.input) + (outputTokens * rates.output)
}

function extractCitations(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"\]]+/g
  const urls = text.match(urlRegex) || []
  return [...new Set(urls)]
}
