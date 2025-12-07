import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from '@/lib/firebase/config'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, resume, coverLetter, position } = await request.json()

    // Validate required fields
    if (!name || !email || !resume || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate resume URL format
    try {
      new URL(resume)
    } catch {
      return NextResponse.json(
        { error: 'Invalid resume URL' },
        { status: 400 }
      )
    }

    const db = getFirestore()

    // Create application document
    const applicationData = {
      name,
      email,
      phone: phone || null,
      resume,
      coverLetter: coverLetter || null,
      position,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    }

    const docRef = await db.collection('job_applications').add(applicationData)

    return NextResponse.json({
      success: true,
      applicationId: docRef.id,
    })
  } catch (error: any) {
    console.error('Error submitting job application:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    )
  }
}
