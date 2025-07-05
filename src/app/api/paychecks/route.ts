import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Return mock data for now
    const mockPaychecks = [
      {
        id: '1',
        period_start: '2024-01-01',
        period_end: '2024-01-15',
        wages_paid: 1240.00,
        tips_paid: 567.50,
        received_at: '2024-01-17'
      }
    ]

    return NextResponse.json(mockPaychecks)
  } catch (error) {
    console.error('Error fetching paychecks:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const paycheck = await prisma.paycheck.create({
      data: {
        ...body,
        user_id: user.id,
        period_start: new Date(body.period_start),
        period_end: new Date(body.period_end),
        received_at: new Date(body.received_at),
      },
    })

    return NextResponse.json(paycheck)
  } catch (error) {
    console.error('Error creating paycheck:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}