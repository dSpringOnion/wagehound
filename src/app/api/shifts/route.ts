import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Return mock data for now
    const mockShifts = [
      {
        id: '1',
        date: '2024-01-15',
        start_time: '2024-01-15T09:00:00Z',
        end_time: '2024-01-15T17:00:00Z',
        hours: 8,
        wage_rate: 15.50,
        tips_cashout: 45.00,
        shift_type: 'HOURLY_PLUS_TIPS'
      },
      {
        id: '2', 
        date: '2024-01-14',
        start_time: '2024-01-14T10:00:00Z',
        end_time: '2024-01-14T18:00:00Z',
        hours: 8,
        wage_rate: 15.50,
        tips_cashout: 67.50,
        shift_type: 'HOURLY_PLUS_TIPS'
      }
    ]

    return NextResponse.json(mockShifts)
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const shift = await prisma.shift.create({
      data: {
        ...body,
        user_id: user.id,
        date: new Date(body.date),
        start_time: body.start_time ? new Date(body.start_time) : null,
        end_time: body.end_time ? new Date(body.end_time) : null,
      },
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error creating shift:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}