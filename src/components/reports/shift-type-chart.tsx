'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

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

interface ShiftTypeChartProps {
  shifts: Shift[]
}

export function ShiftTypeChart({ shifts }: ShiftTypeChartProps) {
  const chartData = useMemo(() => {
    if (!shifts.length) return null

    // Group shifts by type and calculate earnings
    const typeEarnings = shifts.reduce((acc, shift) => {
      const earnings = (shift.hours || 0) * shift.wage_rate + shift.tips_cashout
      const type = shift.shift_type === 'HOURLY_PLUS_TIPS' ? 'Hourly + Tips' : 'Tips Only'

      if (!acc[type]) {
        acc[type] = { earnings: 0, count: 0 }
      }

      acc[type].earnings += earnings
      acc[type].count += 1

      return acc
    }, {} as Record<string, { earnings: number; count: number }>)

    const labels = Object.keys(typeEarnings)
    const data = labels.map(label => typeEarnings[label].earnings)
    const counts = labels.map(label => typeEarnings[label].count)

    return {
      labels,
      datasets: [
        {
          label: 'Earnings by Type',
          data,
          backgroundColor: [
            'rgba(177, 224, 137, 0.8)', // --color-paid
            'rgba(255, 224, 179, 0.8)', // --color-accent
            'rgba(176, 224, 255, 0.8)', // --color-secondary
          ],
          borderColor: [
            'rgba(177, 224, 137, 1)',
            'rgba(255, 224, 179, 1)', 
            'rgba(176, 224, 255, 1)',
          ],
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8
        }
      ],
      counts
    }
  }, [shifts])

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Quicksand, sans-serif',
            size: 12
          },
          color: '#6b7280',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Quicksand, sans-serif',
          size: 14
        },
        bodyFont: {
          family: 'Quicksand, sans-serif',
          size: 12
        },
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed
            const chartData = context.chart.data as { counts?: number[] }
            const count = chartData.counts?.[context.dataIndex] || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            
            return [
              `${label}: $${value.toFixed(2)}`,
              `${count} shifts (${percentage}%)`
            ]
          }
        }
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderRadius: 8
      }
    }
  }

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  const totalEarnings = chartData.datasets[0].data.reduce((a, b) => a + b, 0)

  return (
    <div className="relative">
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-2xl font-bold text-paid">${totalEarnings.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Total Earnings</div>
      </div>
    </div>
  )
}