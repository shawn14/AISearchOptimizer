import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeArticle, getAllKnowledgeArticles } from '@/lib/firebase/storage'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandId = searchParams.get('brandId') || undefined

    const articles = await getAllKnowledgeArticles(brandId)

    return NextResponse.json({
      success: true,
      articles,
    })
  } catch (error: any) {
    console.error('Error fetching knowledge articles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch knowledge articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, type, content, url, category, brand_id } = body

    if (!title || !content || !url) {
      return NextResponse.json(
        { error: 'Title, content, and URL are required' },
        { status: 400 }
      )
    }

    const article = await createKnowledgeArticle({
      brand_id: brand_id || null,
      title,
      type: type || 'Article',
      content,
      url,
      category: category || 'General',
    })

    return NextResponse.json({
      success: true,
      article,
    })
  } catch (error: any) {
    console.error('Error creating knowledge article:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create knowledge article' },
      { status: 500 }
    )
  }
}
