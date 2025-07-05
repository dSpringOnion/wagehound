import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    const session = await getSession()

    if (session) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    console.error('Error checking session:', error)
    redirect('/login')
  }
}
