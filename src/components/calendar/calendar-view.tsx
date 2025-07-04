'use client'

import { useState, useEffect, useCallback } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShiftDialog } from './shift-dialog'
import { createClient } from '@/utils/supabase/client'
import { format, isSameDay, parseISO } from 'date-fns'
import { Plus, Clock } from 'lucide-react'

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

interface CalendarViewProps {
  userId: string
}

export function CalendarView({ userId }: CalendarViewProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const supabase = createClient()

  const fetchShifts = useCallback(async () => {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching shifts:', error)
    } else {
      setShifts(data || [])
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const onDateClick = (clickedDate: Date) => {
    setSelectedDate(clickedDate)
  }


  const getShiftsForDate = (date: Date) => {
    return shifts.filter(shift => 
      isSameDay(parseISO(shift.date), date)
    )
  }

  const getTileContent = ({ date: tileDate }: { date: Date }) => {
    const dayShifts = getShiftsForDate(tileDate)
    if (dayShifts.length === 0) return null

    const totalEarnings = dayShifts.reduce((sum, shift) => {
      const wages = (shift.hours || 0) * shift.wage_rate
      const tips = shift.tips_cashout
      return sum + wages + tips
    }, 0)

    return (
      <div className="flex flex-col items-center gap-1 mt-1">
        <div className="text-xs font-semibold text-primary">
          {dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}
        </div>
        <div className="text-xs text-paid font-medium">
          ${totalEarnings.toFixed(2)}
        </div>
      </div>
    )
  }

  const selectedDateShifts = selectedDate ? getShiftsForDate(selectedDate) : []

  const handleShiftSaved = () => {
    fetchShifts()
    setIsDialogOpen(false)
  }

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift)
    setIsDialogOpen(true)
  }

  const handleDeleteShift = async (shiftId: string) => {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', shiftId)

    if (error) {
      console.error('Error deleting shift:', error)
    } else {
      fetchShifts()
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                setDate(value)
              }
            }}
            value={date}
            onClickDay={onDateClick}
            tileContent={getTileContent}
            className="w-full border rounded-lg shadow-sm"
            tileClassName={({ date: tileDate }) => {
              const dayShifts = getShiftsForDate(tileDate)
              const isSelected = selectedDate && isSameDay(tileDate, selectedDate)
              return `
                ${dayShifts.length > 0 ? 'bg-primary/10 border-primary/20' : ''}
                ${isSelected ? 'bg-primary/20 border-primary' : ''}
                hover:bg-primary/20 transition-colors cursor-pointer
              `
            }}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Double-click a date to add a shift
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>
            {selectedDate && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedShift(null)
                  setIsDialogOpen(true)
                }}
                className="bg-primary hover:bg-primary/80 text-gray-900"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Shift
              </Button>
            )}
          </div>

          {selectedDate && selectedDateShifts.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No shifts on this date</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSelectedShift(null)
                    setIsDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Shift
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedDateShifts.map((shift) => (
            <Card key={shift.id} className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {shift.shift_type === 'HOURLY_PLUS_TIPS' ? 'Hourly + Tips' : 'Tips Only'}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {shift.hours ? `${shift.hours}h` : 'No hours'}
                  </Badge>
                </div>
                <CardDescription>
                  {shift.start_time && shift.end_time ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(shift.start_time), 'h:mm a')} - {format(parseISO(shift.end_time), 'h:mm a')}
                    </div>
                  ) : (
                    'No time specified'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Wage Rate:</span>
                    <span>${shift.wage_rate.toFixed(2)}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tips Cash-out:</span>
                    <span className="text-paid font-medium">${shift.tips_cashout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                    <span>Total Earnings:</span>
                    <span className="text-paid">
                      ${((shift.hours || 0) * shift.wage_rate + shift.tips_cashout).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditShift(shift)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteShift(shift.id)}
                    className="flex-1 text-alert border-alert hover:bg-alert hover:text-white"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ShiftDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaved={handleShiftSaved}
        userId={userId}
        selectedDate={selectedDate}
        shift={selectedShift}
      />
    </div>
  )
}