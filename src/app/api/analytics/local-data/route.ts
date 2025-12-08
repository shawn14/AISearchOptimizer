import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const gaDataPath = path.join(process.cwd(), 'data', 'ga-data.json')

    if (!fs.existsSync(gaDataPath)) {
      return NextResponse.json(
        { error: 'Google Analytics data not found' },
        { status: 404 }
      )
    }

    const data = JSON.parse(fs.readFileSync(gaDataPath, 'utf-8'))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error reading GA data:', error)
    return NextResponse.json(
      { error: 'Failed to read Google Analytics data' },
      { status: 500 }
    )
  }
}
