import { requireAuth } from '@/lib/auth'
import { CalendarView } from '@/components/calendar/calendar-view'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default async function CalendarPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Calendar
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage your work shifts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Work Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarView />
        </CardContent>
      </Card>
    </div>
  )
}