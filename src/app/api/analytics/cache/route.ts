import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()

    const cachePath = path.join(process.cwd(), 'data', 'ga-cache.json')
    const cacheData = {
      data,
      timestamp: Date.now()
    }

    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to cache GA data:', error)
    return NextResponse.json(
      { error: 'Failed to cache data' },
      { status: 500 }
    )
  }
}
