import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createId } from '@paralleldrive/cuid2'

const SESSION_COOKIE = 'wagehound-session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function createSession(userId: string) {
  const sessionId = createId()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await prisma.session.create({
    data: {
      id: sessionId,
      user_id: userId,
      expires_at: expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  return sessionId
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (!sessionId) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session || session.expires_at < new Date()) {
    await deleteSession()
    return null
  }

  return session
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionId) {
    await prisma.session.delete({
      where: { id: sessionId },
    }).catch(() => {
      // Session might not exist, ignore error
    })
  }

  cookieStore.delete(SESSION_COOKIE)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session.user
}

export async function createOrGetUser(email: string) {
  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    user = await prisma.user.create({
      data: { email },
    })
  }

  return user
}