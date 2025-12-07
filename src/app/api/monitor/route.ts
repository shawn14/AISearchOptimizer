import { NextRequest, NextResponse } from 'next/server'
import { monitorBrand, monitorBrandWithCustomQueries } from '@/lib/monitoring/brand-monitor'
import { getBrand, saveMonitoringRun, getPrompt, updatePromptPerformance } from '@/lib/firebase/storage'
import { checkRateLimit, recordRequest, completeRequest, getUsageStats } from '@/lib/rate-limiting'
import { substituteVariables } from '@/lib/prompts/prompt-templates'

export async function POST(request: NextRequest) {
  // Get user ID (in production, get from auth)
  const userId = request.headers.get('x-user-id') || 'anonymous'

  try {
    const body = await request.json()
    const { brandId, useCustomPrompts, promptIds } = body

    if (!brandId) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Check rate limits
    const rateLimitCheck = checkRateLimit(userId, 'monitor')
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter,
          usage: getUsageStats(userId),
        },
        {
          status: 429,
          headers: rateLimitCheck.retryAfter
            ? { 'Retry-After': rateLimitCheck.retryAfter.toString() }
            : {}
        }
      )
    }

    // Record request start
    recordRequest(userId, 'monitor')

    // Get brand details
    const brand = await getBrand(brandId)
    if (!brand) {
      completeRequest(userId)
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    console.log(`Starting monitoring for brand: ${brand.name}`)

    let result

    // Run monitoring with custom prompts or auto-generated queries
    if (useCustomPrompts && promptIds && promptIds.length > 0) {
      console.log(`Using ${promptIds.length} custom prompts`)

      // Fetch all prompts
      const prompts = await Promise.all(
        promptIds.map((id: string) => getPrompt(id))
      )

      // Filter out null prompts and substitute variables
      const queries = prompts
        .filter(p => p !== null)
        .map(prompt => {
          // Substitute brand name and industry variables
          const variables: Record<string, string> = {
            brand_name: brand.name,
            industry: brand.industry || 'company',
            ...prompt!.variables,
          }
          return substituteVariables(prompt!.prompt_text, variables)
        })

      if (queries.length === 0) {
        completeRequest(userId)
        return NextResponse.json({ error: 'No valid prompts found' }, { status: 400 })
      }

      result = await monitorBrandWithCustomQueries(brand.name, queries)
    } else {
      // Use auto-generated queries
      result = await monitorBrand(brand.name, brand.industry, 5)
    }

    console.log(`Monitoring complete:`, {
      mentions: result.total_mentions,
      visibility: result.visibility_score,
      cost: `$${result.total_cost.toFixed(4)}`,
    })

    // Save monitoring run to storage
    await saveMonitoringRun({
      brand_id: brandId,
      brand_name: result.brand_name,
      visibility_score: result.visibility_score,
      total_mentions: result.total_mentions,
      queries_tested: result.queries_tested,
      platform_results: result.platform_results,
      individual_results: result.individual_results,
      total_cost: result.total_cost,
      timestamp: typeof result.timestamp === 'string' ? new Date(result.timestamp) : result.timestamp,
      prompt_ids: useCustomPrompts && promptIds ? promptIds : undefined,
      used_custom_prompts: useCustomPrompts || false,
    })

    // Update prompt performance if custom prompts were used
    if (useCustomPrompts && promptIds && promptIds.length > 0) {
      // Update performance for each prompt asynchronously (don't wait)
      Promise.all(
        promptIds.map((id: string) => updatePromptPerformance(id))
      ).catch(err => console.error('Error updating prompt performance:', err))
    }

    // Record the cost for rate limiting
    recordRequest(userId, 'monitor', result.total_cost)

    // Mark request as complete
    completeRequest(userId)

    // Include usage stats in response
    const usageStats = getUsageStats(userId)

    return NextResponse.json({
      success: true,
      result,
      usage: usageStats
    })
  } catch (error) {
    console.error('Monitoring error:', error)
    completeRequest(userId)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Monitoring failed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
