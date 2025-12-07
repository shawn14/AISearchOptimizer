import { NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/lib/auth/session'

export async function POST() {
  try {
    await deleteSessionCookie()

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Sign out failed',
      },
      { status: 500 }
    )
  }
}
