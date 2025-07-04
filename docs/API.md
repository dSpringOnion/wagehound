# 🔌 WageHound API Documentation

This document describes the internal API structure of WageHound, including database operations, authentication flows, and data models.

## 🏗️ Architecture Overview

WageHound uses Next.js App Router with:
- **Server Components**: For initial data fetching
- **Client Components**: For interactive features
- **Route Handlers**: For API endpoints (future)
- **Supabase**: For database operations and authentication
- **Prisma**: For type-safe database queries

## 🔐 Authentication

### Supabase Auth Integration

WageHound uses Supabase Auth with magic links for secure authentication.

#### Authentication Flow
1. User enters email on login page
2. Supabase sends magic link email
3. User clicks link → redirected to `/auth/callback`
4. Callback handler processes auth token
5. User redirected to dashboard with session

#### Key Files
- `src/utils/supabase/client.ts` - Browser Supabase client
- `src/utils/supabase/server.ts` - Server Supabase client  
- `src/utils/supabase/middleware.ts` - Auth middleware
- `src/middleware.ts` - Next.js middleware for route protection

#### Session Management
```typescript
// Check authentication status
const { data: { user } } = await supabase.auth.getUser()

// Redirect if not authenticated
if (!user) {
  redirect('/login')
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT cuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### Shifts Table
```sql
CREATE TABLE shifts (
  id TEXT PRIMARY KEY DEFAULT cuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  hours DECIMAL(5,2),
  wage_rate DECIMAL(6,2) DEFAULT 0,
  tips_cashout DECIMAL(8,2) DEFAULT 0,
  shift_type shift_type_enum NOT NULL
);

CREATE TYPE shift_type_enum AS ENUM ('HOURLY_PLUS_TIPS', 'TIPS_ONLY');
```

### Paychecks Table
```sql
CREATE TABLE paychecks (
  id TEXT PRIMARY KEY DEFAULT cuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  wages_paid DECIMAL(10,2) NOT NULL,
  tips_paid DECIMAL(10,2) NOT NULL,
  received_at DATE NOT NULL
);
```

## 📊 Data Operations

### Shift Operations

#### Create Shift
```typescript
const { data, error } = await supabase
  .from('shifts')
  .insert([{
    user_id: userId,
    date: '2024-01-15',
    start_time: '2024-01-15T09:00:00',
    end_time: '2024-01-15T17:00:00',
    hours: 8.0,
    wage_rate: 15.50,
    tips_cashout: 45.00,
    shift_type: 'HOURLY_PLUS_TIPS'
  }])
```

#### Read Shifts
```typescript
// Get all shifts for user
const { data: shifts } = await supabase
  .from('shifts')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false })

// Get shifts for date range
const { data: shifts } = await supabase
  .from('shifts')
  .select('*')
  .eq('user_id', userId)
  .gte('date', startDate)
  .lte('date', endDate)
```

#### Update Shift
```typescript
const { error } = await supabase
  .from('shifts')
  .update({
    hours: 8.5,
    tips_cashout: 50.00
  })
  .eq('id', shiftId)
```

#### Delete Shift
```typescript
const { error } = await supabase
  .from('shifts')
  .delete()
  .eq('id', shiftId)
```

### Paycheck Operations

#### Create Paycheck
```typescript
const { data, error } = await supabase
  .from('paychecks')
  .insert([{
    user_id: userId,
    period_start: '2024-01-01',
    period_end: '2024-01-07',
    wages_paid: 310.00,
    tips_paid: 45.00,
    received_at: '2024-01-10'
  }])
```

#### Paycheck Reconciliation Logic
```typescript
// Get shifts for paycheck period
const { data: shifts } = await supabase
  .from('shifts')
  .select('*')
  .eq('user_id', userId)
  .gte('date', paycheck.period_start)
  .lte('date', paycheck.period_end)

// Calculate expected earnings
const expectedWages = shifts.reduce((sum, shift) => 
  sum + ((shift.hours || 0) * shift.wage_rate), 0)
const expectedTips = shifts.reduce((sum, shift) => 
  sum + shift.tips_cashout, 0)

// Calculate differences
const wageDifference = paycheck.wages_paid - expectedWages
const tipsDifference = paycheck.tips_paid - expectedTips
const totalDifference = wageDifference + tipsDifference

// Flag discrepancies > $0.01
const hasDiscrepancy = Math.abs(totalDifference) >= 0.01
```

## 📈 Analytics Calculations

### Summary Statistics
```typescript
interface EarningsStats {
  totalEarnings: number
  totalWages: number
  totalTips: number
  totalHours: number
  avgHourlyRate: number
  totalShifts: number
}

const calculateStats = (shifts: Shift[]): EarningsStats => {
  const totalWages = shifts.reduce((sum, shift) => 
    sum + ((shift.hours || 0) * shift.wage_rate), 0)
  const totalTips = shifts.reduce((sum, shift) => 
    sum + shift.tips_cashout, 0)
  const totalHours = shifts.reduce((sum, shift) => 
    sum + (shift.hours || 0), 0)
  const totalShifts = shifts.length
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
```

### Chart Data Processing

#### Daily Earnings Chart
```typescript
const getDailyEarnings = (shifts: Shift[]) => {
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

  return dailyEarnings
}
```

#### Weekly Trends Chart
```typescript
const getWeeklyTrends = (shifts: Shift[]) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
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

  return avgEarnings
}
```

## 🔄 State Management

### Client-Side State
WageHound uses React hooks for state management:

```typescript
// Component state patterns
const [shifts, setShifts] = useState<Shift[]>([])
const [isLoading, setIsLoading] = useState(true)
const [selectedDate, setSelectedDate] = useState<Date | null>(null)

// Data fetching with useCallback
const fetchShifts = useCallback(async () => {
  setIsLoading(true)
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error:', error)
    toast.error('Failed to load shifts')
  } else {
    setShifts(data || [])
  }
  setIsLoading(false)
}, [userId, supabase])
```

### Server State
Server components fetch initial data:

```typescript
// Server component data fetching
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch recent shifts
  const { data: recentShifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5)

  return <Dashboard shifts={recentShifts} />
}
```

## 🎨 Component Architecture

### Component Hierarchy
```
App Layout (Root)
├── Auth Layout
│   └── Login Page
└── Dashboard Layout
    ├── Header (Navigation)
    ├── Dashboard Page
    ├── Calendar Page
    │   ├── CalendarView
    │   └── ShiftDialog
    ├── Shifts Page
    │   └── ShiftsList
    ├── Paychecks Page
    │   ├── PaychecksList
    │   └── PaycheckDialog
    └── Reports Page
        ├── ReportsView
        ├── EarningsChart
        ├── WeeklyTrendsChart
        ├── ShiftTypeChart
        └── ExportButton
```

### Component Props Interface
```typescript
// Typical component props pattern
interface ComponentProps {
  userId: string
  data?: DataType[]
  onSave?: () => void
  isLoading?: boolean
}

// Component with proper TypeScript
export function Component({ userId, data = [], onSave, isLoading = false }: ComponentProps) {
  // Component implementation
}
```

## 🛡️ Error Handling

### Database Error Handling
```typescript
const handleDatabaseOperation = async () => {
  try {
    const { data, error } = await supabase
      .from('table')
      .operation()

    if (error) {
      console.error('Database error:', error)
      toast.error('Operation failed. Please try again.')
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    toast.error('An unexpected error occurred.')
    return null
  }
}
```

### Form Validation
```typescript
// Using react-hook-form with Zod
const schema = z.object({
  wage_rate: z.number().min(0, 'Wage rate must be positive'),
  tips_cashout: z.number().min(0, 'Tips must be positive'),
  hours: z.number().min(0).max(24, 'Hours must be between 0 and 24')
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

## 📁 File Structure

### Key Directories
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth layout group
│   ├── (dashboard)/       # Dashboard layout group
│   └── auth/              # Auth callback routes
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── calendar/         # Calendar-specific components
│   ├── paychecks/        # Paycheck-specific components
│   ├── reports/          # Reports-specific components
│   └── shifts/           # Shift-specific components
├── lib/                  # Utility libraries
├── utils/                # Utility functions
│   └── supabase/         # Supabase client utilities
└── middleware.ts         # Next.js middleware
```

## 🔧 Development Utilities

### Database Utilities
```typescript
// Prisma client setup
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Date Utilities
```typescript
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns'

// Common date operations
export const formatDate = (date: string | Date) => 
  format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd')

export const getWeekRange = (date: Date) => ({
  start: startOfWeek(date, { weekStartsOn: 1 }),
  end: endOfWeek(date, { weekStartsOn: 1 })
})
```

## 🚀 Performance Optimization

### Data Fetching Optimization
- Use `useCallback` for async functions
- Implement proper loading states
- Cache expensive calculations with `useMemo`
- Limit database queries with proper indexing

### Component Optimization
- Minimize re-renders with proper dependency arrays
- Use React.memo for expensive components
- Implement virtualization for large lists
- Optimize bundle size with dynamic imports

---

**This API documentation helps developers understand WageHound's internal architecture! 🔧**