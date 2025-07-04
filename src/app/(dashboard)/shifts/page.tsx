import { createClient } from '@/utils/supabase/server'
import { ShiftsList } from '@/components/shifts/shifts-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ShiftsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in to view your shifts</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Shifts
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your work shifts and track earnings
          </p>
        </div>
        <Link href="/calendar">
          <Button className="bg-primary hover:bg-primary/80 text-gray-900">
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
          <CardDescription>
            Your most recent work shifts and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShiftsList userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}