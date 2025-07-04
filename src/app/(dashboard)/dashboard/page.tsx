import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, FileText, Plus, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in to view your dashboard</div>
  }

  // Fetch recent shifts
  const { data: recentShifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5)

  // Calculate this week's earnings
  const now = new Date()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  const { data: weekShifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', weekStart.toISOString().split('T')[0])

  const weekEarnings = (weekShifts || []).reduce((sum, shift) => {
    const wages = (shift.hours || 0) * shift.wage_rate
    const tips = shift.tips_cashout
    return sum + wages + tips
  }, 0)

  // Check for paycheck discrepancies
  const { data: paychecks } = await supabase
    .from('paychecks')
    .select('*')
    .eq('user_id', user.id)
    .order('period_end', { ascending: false })
    .limit(5)

  let discrepancyCount = 0
  if (paychecks) {
    for (const paycheck of paychecks) {
      const { data: periodShifts } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', paycheck.period_start)
        .lte('date', paycheck.period_end)

      const expectedWages = (periodShifts || []).reduce((sum, shift) => sum + ((shift.hours || 0) * shift.wage_rate), 0)
      const expectedTips = (periodShifts || []).reduce((sum, shift) => sum + shift.tips_cashout, 0)
      const totalExpected = expectedWages + expectedTips
      const totalReceived = paycheck.wages_paid + paycheck.tips_paid
      
      if (Math.abs(totalExpected - totalReceived) >= 0.01) {
        discrepancyCount++
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to WageHound!
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your shifts, wages, and tips all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentShifts && recentShifts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{recentShifts.length} recent shifts</p>
                <p className="text-muted-foreground text-sm">
                  Latest: {new Date(recentShifts[0].date).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No shifts recorded yet. Add your first shift to get started!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              This Week&apos;s Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-paid">${weekEarnings.toFixed(2)}</p>
            <p className="text-muted-foreground text-sm">Wages + Tips</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {discrepancyCount > 0 ? (
              <>
                <Badge variant="destructive" className="mb-2 bg-alert/20 text-alert border-alert/30">
                  {discrepancyCount} Discrepanc{discrepancyCount === 1 ? 'y' : 'ies'}
                </Badge>
                <p className="text-muted-foreground text-sm">
                  {discrepancyCount} paycheck{discrepancyCount === 1 ? '' : 's'} with discrepancies found.
                </p>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="mb-2 bg-paid/20 text-paid border-paid/30">All Clear</Badge>
                <p className="text-muted-foreground text-sm">
                  All caught up! No discrepancies found.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>
            Get started with these common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/calendar">
              <Button 
                className="bg-primary hover:bg-primary/80 text-gray-900 font-medium h-auto py-4 flex-col gap-2 w-full"
                variant="default"
              >
                <Plus className="h-5 w-5" />
                Add Shift
              </Button>
            </Link>
            <Link href="/paychecks">
              <Button 
                className="bg-secondary hover:bg-secondary/80 text-gray-900 font-medium h-auto py-4 flex-col gap-2 w-full"
                variant="secondary"
              >
                <DollarSign className="h-5 w-5" />
                Log Paycheck
              </Button>
            </Link>
            <Link href="/calendar">
              <Button 
                className="bg-accent hover:bg-accent/80 text-gray-900 font-medium h-auto py-4 flex-col gap-2 w-full"
                variant="outline"
              >
                <Calendar className="h-5 w-5" />
                View Calendar
              </Button>
            </Link>
            <Link href="/shifts">
              <Button 
                className="bg-paid hover:bg-paid/80 text-gray-900 font-medium h-auto py-4 flex-col gap-2 w-full"
                variant="outline"
              >
                <FileText className="h-5 w-5" />
                View Shifts
              </Button>
            </Link>
            <Link href="/reports">
              <Button 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-gray-900 font-medium h-auto py-4 flex-col gap-2 w-full"
                variant="outline"
              >
                <BarChart3 className="h-5 w-5" />
                View Reports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}