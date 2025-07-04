'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { toast } from 'sonner'

interface Paycheck {
  id: string
  period_start: string
  period_end: string
  wages_paid: number
  tips_paid: number
  received_at: string
}

interface PaycheckDialogProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  userId: string
  paycheck?: Paycheck | null
}

export function PaycheckDialog({ isOpen, onClose, onSaved, userId, paycheck }: PaycheckDialogProps) {
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [wagesPaid, setWagesPaid] = useState('')
  const [tipsPaid, setTipsPaid] = useState('')
  const [receivedAt, setReceivedAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      if (paycheck) {
        // Editing existing paycheck
        setPeriodStart(paycheck.period_start)
        setPeriodEnd(paycheck.period_end)
        setWagesPaid(paycheck.wages_paid.toString())
        setTipsPaid(paycheck.tips_paid.toString())
        setReceivedAt(paycheck.received_at)
      } else {
        // Creating new paycheck - suggest current week
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 }) // Sunday
        
        setPeriodStart(format(weekStart, 'yyyy-MM-dd'))
        setPeriodEnd(format(weekEnd, 'yyyy-MM-dd'))
        setWagesPaid('')
        setTipsPaid('')
        setReceivedAt(format(now, 'yyyy-MM-dd'))
      }
    }
  }, [isOpen, paycheck])

  const resetForm = () => {
    setPeriodStart('')
    setPeriodEnd('')
    setWagesPaid('')
    setTipsPaid('')
    setReceivedAt('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!periodStart || !periodEnd || !receivedAt) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const paycheckData = {
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        wages_paid: parseFloat(wagesPaid) || 0,
        tips_paid: parseFloat(tipsPaid) || 0,
        received_at: receivedAt,
      }

      let error

      if (paycheck) {
        // Update existing paycheck
        const { error: updateError } = await supabase
          .from('paychecks')
          .update(paycheckData)
          .eq('id', paycheck.id)
        error = updateError
      } else {
        // Create new paycheck
        const { error: insertError } = await supabase
          .from('paychecks')
          .insert([paycheckData])
        error = insertError
      }

      if (error) {
        console.error('Error saving paycheck:', error)
        toast.error('Failed to save paycheck. Please try again.')
      } else {
        toast.success(paycheck ? 'Paycheck updated successfully!' : 'Paycheck added successfully!')
        onSaved()
        onClose()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving paycheck:', error)
      toast.error('Failed to save paycheck. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {paycheck ? 'Edit Paycheck' : 'Add New Paycheck'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period-start">Pay Period Start *</Label>
              <Input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-end">Pay Period End *</Label>
              <Input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="received-at">Date Received *</Label>
            <Input
              id="received-at"
              type="date"
              value={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wages-paid">Wages Paid ($)</Label>
              <Input
                id="wages-paid"
                type="number"
                step="0.01"
                min="0"
                value={wagesPaid}
                onChange={(e) => setWagesPaid(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tips-paid">Tips Paid ($)</Label>
              <Input
                id="tips-paid"
                type="number"
                step="0.01"
                min="0"
                value={tipsPaid}
                onChange={(e) => setTipsPaid(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            * Required fields
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
              {isLoading ? 'Saving...' : (paycheck ? 'Update Paycheck' : 'Add Paycheck')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}