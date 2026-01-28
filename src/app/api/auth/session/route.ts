import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { db, COLLECTIONS } from '@/lib/firebase/config'
import { Timestamp } from 'firebase-admin/firestore'
import { cookies } from 'next/headers'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me'
)

/**
 * POST /api/auth/session
 * Verify Firebase ID token and create session
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    
    if (!idToken) {
      return NextResponse.json({ error: 'ID token required' }, { status: 400 })
    }
    
    // Verify the Firebase ID token
    const auth = getAuth()
    const decodedToken = await auth.verifyIdToken(idToken)
    
    const { uid, email, name, picture } = decodedToken
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    
    // Create or update user in Firestore
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid)
    const userDoc = await userRef.get()
    
    if (!userDoc.exists) {
      // Create new user
      await userRef.set({
        email: email.toLowerCase(),
        first_name: name?.split(' ')[0] || '',
        last_name: name?.split(' ').slice(1).join(' ') || '',
        photo_url: picture || null,
        auth_provider: 'google',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      })
    } else {
      // Update last login
      await userRef.update({
        updated_at: Timestamp.now(),
        photo_url: picture || userDoc.data()?.photo_url,
      })
    }
    
    // Create JWT session token
    const token = await new jose.SignJWT({
      userId: uid,
      email: email,
      name: name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)
    
    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: uid,
        email,
        name,
      }
    })
    
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
