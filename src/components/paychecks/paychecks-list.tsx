'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaycheckDialog } from './paycheck-dialog'
import { format, parseISO } from 'date-fns'
import { Calendar, DollarSign, Edit, Trash2, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Paycheck {
  id: string
  period_start: string
  period_end: string
  wages_paid: number
  tips_paid: number
  received_at: string
}

interface PaycheckWithShifts extends Paycheck {
  expectedWages: number
  expectedTips: number
  wageDifference: number
  tipsDifference: number
  totalDifference: number
}

interface PaychecksListProps {
  userId: string
}

export function PaychecksList({ userId }: PaychecksListProps) {
  const [paychecks, setPaychecks] = useState<PaycheckWithShifts[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPaycheck, setSelectedPaycheck] = useState<Paycheck | null>(null)
  const supabase = createClient()

  const fetchPaychecks = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch paychecks
      const { data: paychecksData, error: paychecksError } = await supabase
        .from('paychecks')
        .select('*')
        .eq('user_id', userId)
        .order('period_end', { ascending: false })

      if (paychecksError) throw paychecksError

      // Fetch all shifts for the user
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', userId)

      if (shiftsError) throw shiftsError

      // Calculate expected earnings for each paycheck period
      const paychecksWithShifts: PaycheckWithShifts[] = (paychecksData || []).map(paycheck => {
        const periodStart = parseISO(paycheck.period_start)
        const periodEnd = parseISO(paycheck.period_end)

        // Find shifts within the paycheck period
        const periodShifts = (shiftsData || []).filter(shift => {
          const shiftDate = parseISO(shift.date)
          return shiftDate >= periodStart && shiftDate <= periodEnd
        })

        // Calculate expected wages and tips
        const expectedWages = periodShifts.reduce((sum, shift) => {
          return sum + ((shift.hours || 0) * shift.wage_rate)
        }, 0)

        const expectedTips = periodShifts.reduce((sum, shift) => {
          return sum + shift.tips_cashout
        }, 0)

        const wageDifference = paycheck.wages_paid - expectedWages
        const tipsDifference = paycheck.tips_paid - expectedTips
        const totalDifference = wageDifference + tipsDifference

        return {
          ...paycheck,
          expectedWages,
          expectedTips,
          wageDifference,
          tipsDifference,
          totalDifference
        }
      })

      setPaychecks(paychecksWithShifts)
    } catch (error) {
      console.error('Error fetching paychecks:', error)
      toast.error('Failed to load paychecks')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchPaychecks()
  }, [fetchPaychecks])

  const handleDeletePaycheck = async (paycheckId: string) => {
    if (!confirm('Are you sure you want to delete this paycheck?')) return

    const { error } = await supabase
      .from('paychecks')
      .delete()
      .eq('id', paycheckId)

    if (error) {
      console.error('Error deleting paycheck:', error)
      toast.error('Failed to delete paycheck')
    } else {
      toast.success('Paycheck deleted successfully')
      fetchPaychecks()
    }
  }

  const handleEditPaycheck = (paycheck: Paycheck) => {
    setSelectedPaycheck(paycheck)
    setIsDialogOpen(true)
  }

  const handlePaycheckSaved = () => {
    fetchPaychecks()
    setIsDialogOpen(false)
    setSelectedPaycheck(null)
  }

  const getDiscrepancyBadge = (difference: number) => {
    if (Math.abs(difference) < 0.01) {
      return (
        <Badge variant="secondary" className="bg-paid/20 text-paid border-paid/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive" className="bg-alert/20 text-alert border-alert/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          ${Math.abs(difference).toFixed(2)} {difference > 0 ? 'over' : 'under'}
        </Badge>
      )
    }
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {paychecks.length} paycheck{paychecks.length !== 1 ? 's' : ''} recorded
        </div>
        <Button 
          onClick={() => {
            setSelectedPaycheck(null)
            setIsDialogOpen(true)
          }}
          className="bg-primary hover:bg-primary/80 text-gray-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Paycheck
        </Button>
      </div>

      {paychecks.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No paychecks recorded yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first paycheck to begin tracking verification
          </p>
          <Button 
            onClick={() => {
              setSelectedPaycheck(null)
              setIsDialogOpen(true)
            }}
            className="bg-primary hover:bg-primary/80 text-gray-900"
          >
            Add Your First Paycheck
          </Button>
        </div>
      ) : (
        paychecks.map((paycheck) => (
          <Card key={paycheck.id} className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(paycheck.period_start), 'MMM d')} - {format(parseISO(paycheck.period_end), 'MMM d, yyyy')}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span>Received: {format(parseISO(paycheck.received_at), 'MMM d, yyyy')}</span>
                    {getDiscrepancyBadge(paycheck.totalDifference)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPaycheck(paycheck)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePaycheck(paycheck.id)}
                    className="h-8 w-8 p-0 text-alert hover:bg-alert/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Received</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Wages:</span>
                      <span>${paycheck.wages_paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tips:</span>
                      <span>${paycheck.tips_paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>${(paycheck.wages_paid + paycheck.tips_paid).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Expected (from shifts)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Wages:</span>
                      <span>${paycheck.expectedWages.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tips:</span>
                      <span>${paycheck.expectedTips.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>${(paycheck.expectedWages + paycheck.expectedTips).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {Math.abs(paycheck.totalDifference) >= 0.01 && (
                <div className="mt-4 p-3 bg-alert/10 border border-alert/20 rounded">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-alert" />
                    <span className="font-medium">
                      Discrepancy: ${Math.abs(paycheck.totalDifference).toFixed(2)} 
                      {paycheck.totalDifference > 0 ? ' overpaid' : ' underpaid'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Wages: {paycheck.wageDifference >= 0 ? '+' : ''}${paycheck.wageDifference.toFixed(2)} | 
                    Tips: {paycheck.tipsDifference >= 0 ? '+' : ''}${paycheck.tipsDifference.toFixed(2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      <PaycheckDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedPaycheck(null)
        }}
        onSaved={handlePaycheckSaved}
        userId={userId}
        paycheck={selectedPaycheck}
      />
    </div>
  )
}