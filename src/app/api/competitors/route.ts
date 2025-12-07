import { NextRequest, NextResponse } from 'next/server'
import { getCompetitors, createCompetitor, deleteCompetitor } from '@/lib/file-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')

    const competitors = await getCompetitors(brandId || undefined)

    return NextResponse.json({ competitors })
  } catch (error) {
    console.error('Error fetching competitors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, brandId } = body

    if (!name || !brandId) {
      return NextResponse.json(
        { error: 'Name and brandId are required' },
        { status: 400 }
      )
    }

    const competitor = await createCompetitor({
      brand_id: brandId,
      name: name.trim(),
    })

    return NextResponse.json({ competitor }, { status: 201 })
  } catch (error) {
    console.error('Error creating competitor:', error)
    return NextResponse.json(
      { error: 'Failed to create competitor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      )
    }

    const success = await deleteCompetitor(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting competitor:', error)
    return NextResponse.json(
      { error: 'Failed to delete competitor' },
      { status: 500 }
    )
  }
}
