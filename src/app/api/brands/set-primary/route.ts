import { NextRequest, NextResponse } from 'next/server'
import { getAllBrands, updateBrand } from '@/lib/firebase/storage'

export async function POST(request: NextRequest) {
  try {
    const { brandId } = await request.json()

    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    // Read all brands
    const brands = await getAllBrands()

    // Find the brand to set as primary
    const targetBrand = brands.find(b => b.id === brandId)

    if (!targetBrand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Set all brands to not primary
    for (const brand of brands) {
      if (brand.id !== brandId && brand.is_primary) {
        await updateBrand(brand.id, { is_primary: false })
      }
    }

    // Set the selected brand as primary
    const updatedBrand = await updateBrand(brandId, { is_primary: true })

    return NextResponse.json({
      success: true,
      brand: updatedBrand
    })
  } catch (error: any) {
    console.error('Error setting primary brand:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set primary brand' },
      { status: 500 }
    )
  }
}
