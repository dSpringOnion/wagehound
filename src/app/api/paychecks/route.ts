import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await requireAuth()
    
    const paychecks = await prisma.paycheck.findMany({
      where: { user_id: user.id },
      orderBy: { period_end: 'desc' },
    })

    return NextResponse.json(paychecks)
  } catch (error) {
    console.error('Error fetching paychecks:', error)
    return new NextResponse('Unauthorized', { status: 401 })
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