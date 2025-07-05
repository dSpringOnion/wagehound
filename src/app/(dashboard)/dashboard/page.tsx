import { requireAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, FileText, Plus, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await requireAuth()

  // Use mock data for now to avoid build issues
  const recentShifts = [
    { id: '1', date: '2024-01-15', hours: 8, wage_rate: 15.50, tips_cashout: 45.00 },
    { id: '2', date: '2024-01-14', hours: 8, wage_rate: 15.50, tips_cashout: 67.50 }
  ]

  const weekEarnings = 500.25
  const discrepancyCount: number = 0

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
                  {discrepancyCount} Discrepanc{discrepancyCount !== 1 ? 'ies' : 'y'}
                </Badge>
                <p className="text-muted-foreground text-sm">
                  {discrepancyCount} paycheck{discrepancyCount !== 1 ? 's' : ''} with discrepancies found.
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