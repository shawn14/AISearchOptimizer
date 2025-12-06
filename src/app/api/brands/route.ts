import { NextRequest, NextResponse } from 'next/server'
import { getBrands, createBrand } from '@/lib/file-storage'

export async function GET() {
  try {
    const brands = await getBrands()
    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, website_url, industry, description } = body

    if (!name || !website_url) {
      return NextResponse.json(
        { error: 'Name and website URL are required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(website_url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      )
    }

    const brand = await createBrand({
      name,
      website_url,
      industry: industry || null,
      description: description || null,
    })

    return NextResponse.json({ brand }, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
