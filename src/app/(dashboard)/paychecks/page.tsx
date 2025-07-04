import { createClient } from '@/utils/supabase/server'
import { PaychecksList } from '@/components/paychecks/paychecks-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default async function PaychecksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in to view your paychecks</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Paychecks
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and verify your paycheck amounts against logged shifts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paycheck History</CardTitle>
          <CardDescription>
            Your recorded paychecks and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaychecksList userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}