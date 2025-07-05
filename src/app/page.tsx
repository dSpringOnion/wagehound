import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    // If Supabase is not configured, redirect to login
    redirect('/login')
  }
}
