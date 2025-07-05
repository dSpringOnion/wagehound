import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await requireAuth()
    
    const shifts = await prisma.shift.findMany({
      where: { user_id: user.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return new NextResponse('Unauthorized', { status: 401 })
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