'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { format, parseISO } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
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

interface EarningsChartProps {
  shifts: Shift[]
}

export function EarningsChart({ shifts }: EarningsChartProps) {
  const chartData = useMemo(() => {
    if (!shifts.length) return null

    // Group shifts by date and calculate daily earnings
    const dailyEarnings = shifts.reduce((acc, shift) => {
      const date = shift.date
      const wages = (shift.hours || 0) * shift.wage_rate
      const tips = shift.tips_cashout

      if (!acc[date]) {
        acc[date] = { wages: 0, tips: 0 }
      }

      acc[date].wages += wages
      acc[date].tips += tips

      return acc
    }, {} as Record<string, { wages: number; tips: number }>)

    // Sort dates and create chart data
    const sortedDates = Object.keys(dailyEarnings).sort()
    const labels = sortedDates.map(date => format(parseISO(date), 'MMM d'))
    const wagesData = sortedDates.map(date => dailyEarnings[date].wages)
    const tipsData = sortedDates.map(date => dailyEarnings[date].tips)

    return {
      labels,
      datasets: [
        {
          label: 'Wages',
          data: wagesData,
          backgroundColor: 'rgba(177, 224, 137, 0.8)', // --color-paid with opacity
          borderColor: 'rgba(177, 224, 137, 1)',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Tips',
          data: tipsData,
          backgroundColor: 'rgba(255, 224, 179, 0.8)', // --color-accent with opacity
          borderColor: 'rgba(255, 224, 179, 1)',
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    }
  }, [shifts])

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Quicksand, sans-serif',
            size: 12
          },
          color: '#6b7280'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
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
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
          },
          afterBody: function(tooltipItems) {
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0)
            return [`Total: $${total.toFixed(2)}`]
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Quicksand, sans-serif',
            size: 11
          },
          color: '#9ca3af'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          font: {
            family: 'Quicksand, sans-serif',
            size: 11
          },
          color: '#9ca3af',
          callback: function(value) {
            return '$' + Number(value).toFixed(0)
          }
        }
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

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}