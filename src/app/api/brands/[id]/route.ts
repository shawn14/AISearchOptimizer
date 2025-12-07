import { NextRequest, NextResponse } from 'next/server'
import { deleteBrand } from '@/lib/file-storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteBrand(id)

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Brand deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete brand' },
      { status: 500 }
    )
  }
}
