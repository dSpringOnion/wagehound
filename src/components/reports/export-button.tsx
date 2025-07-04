'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'
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

interface ExportButtonProps {
  shifts: Shift[]
  timeRange: string
}

export function ExportButton({ shifts, timeRange }: ExportButtonProps) {
  const exportToCSV = () => {
    if (!shifts.length) {
      toast.error('No data to export')
      return
    }

    try {
      // Define CSV headers
      const headers = [
        'Date',
        'Day of Week',
        'Start Time',
        'End Time',
        'Hours',
        'Shift Type',
        'Wage Rate',
        'Wages Earned',
        'Tips Cash-out',
        'Total Earnings'
      ]

      // Convert shifts to CSV rows
      const rows = shifts.map(shift => {
        const date = parseISO(shift.date)
        const wages = (shift.hours || 0) * shift.wage_rate
        const total = wages + shift.tips_cashout

        return [
          format(date, 'yyyy-MM-dd'),
          format(date, 'EEEE'),
          shift.start_time ? format(parseISO(shift.start_time), 'HH:mm') : '',
          shift.end_time ? format(parseISO(shift.end_time), 'HH:mm') : '',
          shift.hours?.toString() || '',
          shift.shift_type === 'HOURLY_PLUS_TIPS' ? 'Hourly + Tips' : 'Tips Only',
          shift.wage_rate.toFixed(2),
          wages.toFixed(2),
          shift.tips_cashout.toFixed(2),
          total.toFixed(2)
        ]
      })

      // Calculate summary statistics
      const totalWages = shifts.reduce((sum, shift) => sum + ((shift.hours || 0) * shift.wage_rate), 0)
      const totalTips = shifts.reduce((sum, shift) => sum + shift.tips_cashout, 0)
      const totalHours = shifts.reduce((sum, shift) => sum + (shift.hours || 0), 0)
      const totalEarnings = totalWages + totalTips

      // Add summary rows
      const summaryRows = [
        [''], // Empty row
        ['SUMMARY'],
        ['Total Shifts', shifts.length.toString()],
        ['Total Hours', totalHours.toFixed(1)],
        ['Total Wages', totalWages.toFixed(2)],
        ['Total Tips', totalTips.toFixed(2)],
        ['Total Earnings', totalEarnings.toFixed(2)],
        ['Average per Shift', shifts.length > 0 ? (totalEarnings / shifts.length).toFixed(2) : '0.00'],
        ['Average Hourly Rate', totalHours > 0 ? (totalEarnings / totalHours).toFixed(2) : '0.00']
      ]

      // Combine all rows
      const allRows = [headers, ...rows, ...summaryRows]

      // Convert to CSV string
      const csvContent = allRows
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `wagehound-earnings-${timeRange.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Earnings report exported successfully!')
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export data')
    }
  }

  return (
    <Button 
      onClick={exportToCSV}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      disabled={!shifts.length}
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}