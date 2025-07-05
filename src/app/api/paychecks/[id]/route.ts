import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const paycheck = await prisma.paycheck.update({
      where: { 
        id: params.id,
        user_id: user.id, // Ensure user owns this paycheck
      },
      data: {
        ...body,
        period_start: new Date(body.period_start),
        period_end: new Date(body.period_end),
        received_at: new Date(body.received_at),
      },
    })

    return NextResponse.json(paycheck)
  } catch (error) {
    console.error('Error updating paycheck:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    await prisma.paycheck.delete({
      where: { 
        id: params.id,
        user_id: user.id, // Ensure user owns this paycheck
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting paycheck:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}