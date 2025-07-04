import { createClient } from '@/utils/supabase/server'
import { ReportsView } from '@/components/reports/reports-view'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in to view your reports</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize your earnings trends and analyze your work patterns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Analytics</CardTitle>
          <CardDescription>
            Interactive charts showing your wages, tips, and total earnings over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsView userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}