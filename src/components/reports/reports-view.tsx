'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EarningsChart } from './earnings-chart'
import { WeeklyTrendsChart } from './weekly-trends-chart'
import { ShiftTypeChart } from './shift-type-chart'
import { ExportButton } from './export-button'
import { subDays, format } from 'date-fns'
import { CalendarDays, TrendingUp } from 'lucide-react'
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

interface ReportsViewProps {
  userId: string
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export function ReportsView({ userId }: ReportsViewProps) {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [isLoading, setIsLoading] = useState(true)

  const fetchShifts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/shifts')
      if (!response.ok) {
        throw new Error('Failed to fetch shifts')
      }
      const data = await response.json()
      setShifts(data || [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
      toast.error('Failed to load shifts data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  useEffect(() => {
    if (!shifts.length) {
      setFilteredShifts([])
      return
    }

    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case '1y':
        startDate = subDays(now, 365)
        break
      case 'all':
      default:
        startDate = new Date(0) // Beginning of time
        break
    }

    const filtered = shifts.filter(shift => {
      const shiftDate = new Date(shift.date)
      return shiftDate >= startDate
    })

    setFilteredShifts(filtered)
  }, [shifts, timeRange])

  const calculateStats = () => {
    if (!filteredShifts.length) {
      return {
        totalEarnings: 0,
        totalWages: 0,
        totalTips: 0,
        totalHours: 0,
        avgHourlyRate: 0,
        totalShifts: 0
      }
    }

    const totalWages = filteredShifts.reduce((sum, shift) => sum + ((shift.hours || 0) * shift.wage_rate), 0)
    const totalTips = filteredShifts.reduce((sum, shift) => sum + shift.tips_cashout, 0)
    const totalHours = filteredShifts.reduce((sum, shift) => sum + (shift.hours || 0), 0)
    const totalShifts = filteredShifts.length
    const totalEarnings = totalWages + totalTips
    const avgHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0

    return {
      totalEarnings,
      totalWages,
      totalTips,
      totalHours,
      avgHourlyRate,
      totalShifts
    }
  }

  const stats = calculateStats()

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '7d': return 'Last 7 Days'
      case '30d': return 'Last 30 Days'
      case '90d': return 'Last 90 Days'
      case '1y': return 'Last Year'
      case 'all': return 'All Time'
      default: return 'Last 30 Days'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-medium">Time Range:</span>
          </div>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ExportButton shifts={filteredShifts} timeRange={getTimeRangeLabel(timeRange)} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Earnings</div>
            <div className="text-2xl font-bold text-paid">${stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Hours</div>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg Hourly Rate</div>
            <div className="text-2xl font-bold">${stats.avgHourlyRate.toFixed(2)}/hr</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Shifts</div>
            <div className="text-2xl font-bold">{stats.totalShifts}</div>
          </CardContent>
        </Card>
      </div>

      {filteredShifts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data for selected period</h3>
            <p className="text-muted-foreground">
              No shifts found for {getTimeRangeLabel(timeRange).toLowerCase()}. Try selecting a different time range or add some shifts first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Earnings Over Time</CardTitle>
              <CardDescription>
                Daily breakdown of wages vs tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EarningsChart shifts={filteredShifts} />
            </CardContent>
          </Card>

          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Trends</CardTitle>
              <CardDescription>
                Average earnings by day of week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyTrendsChart shifts={filteredShifts} />
            </CardContent>
          </Card>

          {/* Shift Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Earnings by Shift Type</CardTitle>
              <CardDescription>
                Breakdown by hourly vs tips-only shifts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShiftTypeChart shifts={filteredShifts} />
            </CardContent>
          </Card>

          {/* Additional Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insights</CardTitle>
              <CardDescription>
                Key metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Wages vs Tips Ratio:</span>
                <span className="text-sm font-medium">
                  {stats.totalWages > 0 && stats.totalTips > 0 
                    ? `${((stats.totalWages / (stats.totalWages + stats.totalTips)) * 100).toFixed(0)}% : ${((stats.totalTips / (stats.totalWages + stats.totalTips)) * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average per Shift:</span>
                <span className="text-sm font-medium">${stats.totalShifts > 0 ? (stats.totalEarnings / stats.totalShifts).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Best Day (Earnings):</span>
                <span className="text-sm font-medium">
                  {filteredShifts.length > 0 
                    ? (() => {
                        const dailyEarnings = filteredShifts.reduce((acc, shift) => {
                          const day = format(new Date(shift.date), 'EEEE')
                          const earnings = (shift.hours || 0) * shift.wage_rate + shift.tips_cashout
                          acc[day] = (acc[day] || 0) + earnings
                          return acc
                        }, {} as Record<string, number>)
                        const bestDay = Object.entries(dailyEarnings).reduce((a, b) => a[1] > b[1] ? a : b)
                        return `${bestDay[0]} ($${bestDay[1].toFixed(2)})`
                      })()
                    : 'N/A'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}