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

    const shift = await prisma.shift.update({
      where: { 
        id: params.id,
        user_id: user.id, // Ensure user owns this shift
      },
      data: {
        ...body,
        date: new Date(body.date),
        start_time: body.start_time ? new Date(body.start_time) : null,
        end_time: body.end_time ? new Date(body.end_time) : null,
      },
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Error updating shift:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    await prisma.shift.delete({
      where: { 
        id: params.id,
        user_id: user.id, // Ensure user owns this shift
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting shift:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}