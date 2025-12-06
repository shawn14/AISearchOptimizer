import { NextRequest, NextResponse } from 'next/server'
import { monitorBrand } from '@/lib/monitoring/brand-monitor'
import { getBrand, saveMonitoringRun } from '@/lib/file-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brandId } = body

    if (!brandId) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Get brand details
    const brand = await getBrand(brandId)
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    console.log(`Starting monitoring for brand: ${brand.name}`)

    // Run monitoring
    const result = await monitorBrand(brand.name, brand.industry, 5)

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
      timestamp: result.timestamp,
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Monitoring error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Monitoring failed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
