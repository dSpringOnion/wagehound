import { NextRequest, NextResponse } from 'next/server'
import { createOrGetUser, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return new NextResponse('Invalid email', { status: 400 })
    }

    const user = await createOrGetUser(email)
    await createSession(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}