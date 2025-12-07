import { NextRequest, NextResponse } from 'next/server'
import { updateKnowledgeArticle, deleteKnowledgeArticle } from '@/lib/firebase/storage'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()

    await updateKnowledgeArticle(id, updates)

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Error updating knowledge article:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update knowledge article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    await deleteKnowledgeArticle(id)

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting knowledge article:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete knowledge article' },
      { status: 500 }
    )
  }
}
