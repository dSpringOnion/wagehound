'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Shift {
  id: string
  date: string
  start_time: string | null
  end_time: string | null
  hours: number | null
  wage_rate: number
  tips_cashout: number
  shift_type: 'HOURLY_PLUS_TIPS' | 'TIPS_ONLY'
}

export function ShiftsList() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchShifts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/shifts')
      if (response.ok) {
        const data = await response.json()
        setShifts(data || [])
      } else {
        throw new Error('Failed to fetch shifts')
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
      toast.error('Failed to load shifts')
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return

    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Shift deleted successfully')
        fetchShifts()
      } else {
        throw new Error('Failed to delete shift')
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      toast.error('Failed to delete shift')
    }
  }

  const calculateTotalEarnings = (shift: Shift) => {
    const wages = (shift.hours || 0) * shift.wage_rate
    const tips = shift.tips_cashout
    return wages + tips
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (shifts.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No shifts recorded yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by adding your first shift to track your earnings
        </p>
        <Button 
          onClick={() => window.location.href = '/calendar'}
          className="bg-primary hover:bg-primary/80 text-gray-900"
        >
          Add Your First Shift
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {shifts.map((shift) => (
        <Card key={shift.id} className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(parseISO(shift.date), 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {shift.shift_type === 'HOURLY_PLUS_TIPS' ? 'Hourly + Tips' : 'Tips Only'}
                  </Badge>
                  {shift.hours && (
                    <Badge variant="secondary" className="text-xs">
                      {shift.hours}h
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = `/calendar?edit=${shift.id}`}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteShift(shift.id)}
                  className="h-8 w-8 p-0 text-alert hover:bg-alert/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {shift.start_time && shift.end_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(parseISO(shift.start_time), 'h:mm a')} - {format(parseISO(shift.end_time), 'h:mm a')}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">Wage Rate: </span>
                  <span>${shift.wage_rate.toFixed(2)}/hr</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Tips: </span>
                  <span className="text-paid font-medium">${shift.tips_cashout.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-paid">
                  ${calculateTotalEarnings(shift).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Earnings
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}