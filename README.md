# 🦴 WageHound

**A beautiful PWA for tracking wages, tips, and paycheck verification**

WageHound helps workers verify that their weekly direct-deposits match their logged shifts and cash-out tips. Built with modern web technologies and featuring a delightful pastel design.

![WageHound Dashboard](https://via.placeholder.com/800x400/F8E8FA/333333?text=WageHound+Dashboard)

## ✨ Features

### 🔐 Authentication
- **Magic Link Login**: Secure email-based authentication via Supabase
- **Session Management**: Persistent login with SSR support
- **Protected Routes**: Automatic redirection for unauthenticated users

### 📅 Shift Management
- **Interactive Calendar**: Visual shift tracking with react-calendar
- **Smart Entry Forms**: Automatic hours calculation from start/end times
- **Shift Types**: Support for "Hourly + Tips" and "Tips Only" work
- **CRUD Operations**: Add, edit, delete shifts with form validation

### 💰 Paycheck Reconciliation
- **Automatic Verification**: Compares paychecks against logged shifts
- **Discrepancy Detection**: Flags differences greater than $0.01
- **Period Matching**: Smart date range matching for pay periods
- **Visual Indicators**: Color-coded badges for verification status

### 📊 Analytics Dashboard
- **Multiple Chart Types**: Bar charts, line charts, doughnut charts
- **Time Range Filtering**: 7d, 30d, 90d, 1y, all time
- **Real-time Statistics**: Earnings, hours, rates, shift counts
- **CSV Export**: Complete data export with summary statistics
- **Smart Insights**: Wages vs tips ratios, best earning days

### 🎨 Design & UX
- **Pastel Color Palette**: Soft pink, blue, yellow theme
- **Responsive Design**: Works beautifully on mobile and desktop
- **Loading States**: Skeleton animations and smooth transitions
- **Toast Notifications**: User feedback for all actions
- **Professional Typography**: Quicksand font for friendly feel

## 🚀 Tech Stack

- **Frontend**: Next.js 15.3.4 with App Router, TypeScript 5.8.3
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: shadcn/ui with custom theming
- **Database**: PostgreSQL via Prisma ORM 6.11.1
- **Authentication**: Supabase Auth with magic links
- **Charts**: Chart.js with react-chartjs-2
- **Calendar**: react-calendar with custom styling
- **Forms**: react-hook-form with Zod validation
- **PWA**: Progressive Web App ready with manifest

## 📦 Installation

### Prerequisites
- Node.js 18.18.0+
- pnpm 10.12.4
- PostgreSQL database
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wagehound
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   ```

4. **Database setup**
   ```bash
   pnpm migrate
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see WageHound in action!

## 🧪 Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Visit app without login → redirects to login page
- [ ] Enter email → magic link sent successfully
- [ ] Click magic link → redirects to dashboard
- [ ] User session persists on refresh
- [ ] Sign out → redirects to login

#### Shift Management
- [ ] Navigate to Calendar page
- [ ] Click on a date → date selector works
- [ ] Add new shift → form validation works
- [ ] Auto-calculate hours from times
- [ ] Edit existing shift → pre-fills form
- [ ] Delete shift → confirmation dialog
- [ ] Calendar tiles show shift count and earnings

#### Paycheck Reconciliation
- [ ] Navigate to Paychecks page
- [ ] Add paycheck → form validation
- [ ] Paycheck matches shifts → green verified badge
- [ ] Paycheck has discrepancy → red alert badge
- [ ] Edit paycheck → updates verification
- [ ] Dashboard shows discrepancy count

#### Analytics & Reports
- [ ] Navigate to Reports page
- [ ] Charts load with data
- [ ] Time range filter updates charts
- [ ] Summary stats update correctly
- [ ] CSV export downloads file
- [ ] Insights show correct calculations
- [ ] Empty state when no data

#### UI/UX Testing
- [ ] Responsive on mobile devices
- [ ] Loading states show properly
- [ ] Toast notifications appear
- [ ] Navigation between pages works
- [ ] Color theme consistent
- [ ] Typography readable

### Automated Testing

```bash
# Unit tests
pnpm test

# E2E tests (when implemented)
pnpm test:e2e

# Linting
pnpm lint

# Type checking
pnpm build
```

## 📱 PWA Features

WageHound is Progressive Web App ready:

- **Installable**: Can be installed on mobile devices
- **Offline Ready**: Service worker cache (when configured)
- **App-like Experience**: Standalone display mode
- **Custom Icons**: Branded app icons for home screen

## 🎯 Usage Guide

### Getting Started

1. **Sign Up**: Enter your email to receive a magic link
2. **Add Your First Shift**: Use the calendar to add work shifts
3. **Log Paychecks**: Enter paycheck details when received
4. **Monitor Verification**: Check dashboard for discrepancies
5. **Analyze Trends**: Use reports to understand earning patterns

### Best Practices

- **Consistent Logging**: Add shifts immediately after work
- **Accurate Times**: Use precise start/end times for hour calculation
- **Regular Paycheck Entry**: Log paychecks as soon as received
- **Review Discrepancies**: Investigate any flagged differences
- **Export Data**: Regular CSV exports for personal records

## 🔧 Configuration

### Customizing Colors

The WageHound color palette can be customized in `src/app/globals.css`:

```css
:root {
  --color-primary: #F8E8FA;      /* pastel pink */
  --color-secondary: #B0E0FF;    /* pastel blue */
  --color-accent: #FFE0B3;       /* pastel yellow */
  --color-paid: #8ED99E;         /* paid green */
  --color-alert: #FF8A8A;        /* alert red */
}
```

### Database Schema

WageHound uses a simple, efficient schema:

- **users**: User accounts with email
- **shifts**: Work shifts with times, rates, and tips
- **paychecks**: Paycheck records for verification

See `prisma/schema.prisma` for complete schema definition.

## 🚀 Deployment

### Railway (Recommended)

1. Connect GitHub repository to Railway
2. Add environment variables
3. Deploy automatically on git push

### Vercel + Supabase

1. Deploy frontend to Vercel
2. Use Supabase for database and auth
3. Configure environment variables

### Docker

```bash
docker build -t wagehound .
docker run -p 3000:3000 wagehound
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- **TypeScript**: Strict mode enabled, all types required
- **ESLint**: Zero warnings policy
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Follow commit message standards
- **Testing**: Write tests for new features

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **shadcn/ui**: Beautiful component library
- **Chart.js**: Powerful charting library
- **Supabase**: Backend-as-a-Service platform
- **Vercel**: Next.js deployment platform
- **Prisma**: Type-safe database toolkit

---

**Built with ❤️ for hardworking people everywhere**

*WageHound helps you track what you've earned and verify you're paid fairly.*