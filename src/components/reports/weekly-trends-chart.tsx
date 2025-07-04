'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { parseISO, getDay } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

interface WeeklyTrendsChartProps {
  shifts: Shift[]
}

export function WeeklyTrendsChart({ shifts }: WeeklyTrendsChartProps) {
  const chartData = useMemo(() => {
    if (!shifts.length) return null

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Group shifts by day of week
    const weeklyEarnings = shifts.reduce((acc, shift) => {
      const dayIndex = getDay(parseISO(shift.date))
      const earnings = (shift.hours || 0) * shift.wage_rate + shift.tips_cashout

      if (!acc[dayIndex]) {
        acc[dayIndex] = { total: 0, count: 0 }
      }

      acc[dayIndex].total += earnings
      acc[dayIndex].count += 1

      return acc
    }, {} as Record<number, { total: number; count: number }>)

    // Calculate average earnings per day
    const avgEarnings = dayNames.map((_, index) => {
      const dayData = weeklyEarnings[index]
      return dayData ? dayData.total / dayData.count : 0
    })


    return {
      labels: dayNames,
      datasets: [
        {
          label: 'Average Earnings',
          data: avgEarnings,
          borderColor: 'rgba(248, 232, 250, 1)', // --color-primary
          backgroundColor: 'rgba(248, 232, 250, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(248, 232, 250, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true
        }
      ]
    }
  }, [shifts])

  const options: ChartOptions<'line'> = {
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
            return `Avg Earnings: $${context.parsed.y.toFixed(2)}`
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
      <Line data={chartData} options={options} />
    </div>
  )
}