import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/firebase/storage'
import { createSession, setSessionCookie } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser({
      email,
      firstName,
      lastName,
      password,
    })

    // Create session
    const token = await createSession({
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    })

    // Set session cookie
    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Sign up failed',
      },
      { status: 500 }
    )
  }
}
