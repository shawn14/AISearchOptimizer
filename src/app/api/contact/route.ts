import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from '@/lib/firebase/config'

export async function POST(request: NextRequest) {
  try {
    const { name, email, department, message } = await request.json()

    // Validate required fields
    if (!name || !email || !department || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // Validate department
    const validDepartments = ['sales', 'support', 'general', 'partnership', 'press']
    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { error: 'Invalid department' },
        { status: 400 }
      )
    }

    const db = getFirestore()

    // Create contact message document
    const contactData = {
      name,
      email,
      department,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    }

    const docRef = await db.collection('contact_messages').add(contactData)

    return NextResponse.json({
      success: true,
      messageId: docRef.id,
    })
  } catch (error: any) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}
