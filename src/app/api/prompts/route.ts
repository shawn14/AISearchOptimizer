import { NextRequest, NextResponse } from 'next/server'
import { getAllPrompts, createPrompt } from '@/lib/firebase/storage'

export async function GET() {
  try {
    const prompts = await getAllPrompts()
    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, prompt_text, category, variables, is_active } = body

    if (!name || !prompt_text) {
      return NextResponse.json(
        { error: 'Name and prompt text are required' },
        { status: 400 }
      )
    }

    const prompt = await createPrompt({
      brand_id: null, // Global prompt (not brand-specific)
      name,
      prompt_text,
      category: category || undefined,
      variables: variables || {},
      is_active: is_active !== undefined ? is_active : true,
    })

    return NextResponse.json({ prompt }, { status: 201 })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}
