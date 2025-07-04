'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Check your email for the magic link!')
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
          🦴 WageHound
        </CardTitle>
        <CardDescription>
          Track your wages and tips with ease
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMagicLink} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-primary hover:bg-primary/80 text-gray-900 font-medium"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          No passwords required! We&apos;ll send you a secure login link.
        </div>
      </CardContent>
    </Card>
  )
}