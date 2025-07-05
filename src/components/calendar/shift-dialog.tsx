'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
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

interface ShiftDialogProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  userId: string
  selectedDate: Date | null
  shift?: Shift | null
}

export function ShiftDialog({ isOpen, onClose, onSaved, userId, selectedDate, shift }: ShiftDialogProps) {
  const [shiftType, setShiftType] = useState<'HOURLY_PLUS_TIPS' | 'TIPS_ONLY'>('HOURLY_PLUS_TIPS')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [hours, setHours] = useState('')
  const [wageRate, setWageRate] = useState('')
  const [tipsCashout, setTipsCashout] = useState('')
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    if (isOpen) {
      if (shift) {
        // Editing existing shift
        setShiftType(shift.shift_type)
        setStartTime(shift.start_time ? format(new Date(shift.start_time), 'HH:mm') : '')
        setEndTime(shift.end_time ? format(new Date(shift.end_time), 'HH:mm') : '')
        setHours(shift.hours?.toString() || '')
        setWageRate(shift.wage_rate.toString())
        setTipsCashout(shift.tips_cashout.toString())
      } else {
        // Creating new shift
        resetForm()
      }
    }
  }, [isOpen, shift])

  const resetForm = () => {
    setShiftType('HOURLY_PLUS_TIPS')
    setStartTime('')
    setEndTime('')
    setHours('')
    setWageRate('')
    setTipsCashout('0')
  }

  const calculateHours = useCallback(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}:00`)
      const end = new Date(`2000-01-01T${endTime}:00`)
      
      // Handle overnight shifts
      if (end < start) {
        end.setDate(end.getDate() + 1)
      }
      
      const diffMs = end.getTime() - start.getTime()
      const diffHours = diffMs / (1000 * 60 * 60)
      setHours(diffHours.toFixed(2))
    }
  }, [startTime, endTime])

  useEffect(() => {
    calculateHours()
  }, [calculateHours])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return

    setIsLoading(true)

    try {
      const shiftData = {
        date: selectedDate.toISOString().split('T')[0],
        start_time: startTime ? `${selectedDate.toISOString().split('T')[0]}T${startTime}:00` : null,
        end_time: endTime ? `${selectedDate.toISOString().split('T')[0]}T${endTime}:00` : null,
        hours: hours ? parseFloat(hours) : null,
        wage_rate: parseFloat(wageRate) || 0,
        tips_cashout: parseFloat(tipsCashout) || 0,
        shift_type: shiftType,
      }

      if (shift) {
        // Update existing shift
        const response = await fetch(`/api/shifts/${shift.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shiftData)
        })
        if (!response.ok) {
          throw new Error('Failed to update shift')
        }
      } else {
        // Create new shift
        const response = await fetch('/api/shifts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shiftData)
        })
        if (!response.ok) {
          throw new Error('Failed to create shift')
        }
      }

      toast.success(shift ? 'Shift updated successfully!' : 'Shift added successfully!')
      onSaved()
      onClose()
    } catch (error) {
      console.error('Error saving shift:', error)
      toast.error('Failed to save shift. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {shift ? 'Edit Shift' : 'Add New Shift'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="text"
              value={selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift-type">Shift Type</Label>
            <Select value={shiftType} onValueChange={(value: 'HOURLY_PLUS_TIPS' | 'TIPS_ONLY') => setShiftType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOURLY_PLUS_TIPS">Hourly + Tips</SelectItem>
                <SelectItem value="TIPS_ONLY">Tips Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours Worked</Label>
            <Input
              id="hours"
              type="number"
              step="0.01"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Auto-calculated from times"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wage-rate">Wage Rate ($/hour)</Label>
            <Input
              id="wage-rate"
              type="number"
              step="0.01"
              min="0"
              value={wageRate}
              onChange={(e) => setWageRate(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tips-cashout">Tips Cash-out ($)</Label>
            <Input
              id="tips-cashout"
              type="number"
              step="0.01"
              min="0"
              value={tipsCashout}
              onChange={(e) => setTipsCashout(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/80 text-gray-900"
            >
              {isLoading ? 'Saving...' : (shift ? 'Update Shift' : 'Add Shift')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}