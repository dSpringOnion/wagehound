# WageHound Development Rules

## Project Overview
- **Name**: WageHound
- **Type**: PWA wage-and-tip tracker with pastel calendar UI
- **Deployment**: Railway (Next.js + Postgres)
- **Goal**: Help users verify weekly direct-deposits match logged shifts + cash-out tips

## Tech Stack Requirements
- **Frontend**: Next.js 14 (App Router), TypeScript 5.x, Tailwind CSS
- **UI**: shadcn/ui components, react-calendar, lucide-react icons, react-chartjs-2
- **Backend**: Next.js Route Handlers, Postgres 15 via Prisma ORM
- **Auth**: Supabase Auth (magic-link email)
- **PWA**: next-pwa with manifest.json and service worker

## Environment Requirements
- Node: 20.15.0
- pnpm: 9.2.0
- Next.js: 14.2.3
- Prisma: 5.10.2
- Postgres: 15
- Supabase JS: 2.39.3

## Required Scripts
- `pnpm dev` - Development server on port 3000
- `pnpm build` - Production build
- `pnpm start` - Start production server
- `pnpm lint` - ESLint with max-warnings=0
- `pnpm format` - Prettier formatting
- `pnpm test` - Vitest unit tests
- `pnpm migrate` - Prisma migrate deploy

## Database Schema (Prisma)
```prisma
model users {
  id         String   @id @default(cuid())
  email      String   @unique
  created_at DateTime @default(now())
  shifts     shifts[]
  paychecks  paychecks[]
}

model shifts {
  id           String    @id @default(cuid())
  user_id      String
  date         DateTime
  start_time   DateTime?
  end_time     DateTime?
  hours        Decimal?  @db.Decimal(5,2)
  wage_rate    Decimal   @default(0) @db.Decimal(6,2)
  tips_cashout Decimal   @default(0) @db.Decimal(8,2)
  shift_type   ShiftType
  user         users     @relation(fields: [user_id], references: [id])
}

model paychecks {
  id           String   @id @default(cuid())
  user_id      String
  period_start DateTime
  period_end   DateTime
  wages_paid   Decimal  @db.Decimal(10,2)
  tips_paid    Decimal  @db.Decimal(10,2)
  received_at  DateTime
  user         users    @relation(fields: [user_id], references: [id])
}

enum ShiftType {
  HOURLY_PLUS_TIPS
  TIPS_ONLY
}
```

## Required Environment Variables
- `DATABASE_URL` (Railway Postgres)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Directory Structure
```
/
├── app/
│   ├── (auth)/
│   └── (dashboard)/
├── prisma/
├── public/icons/
├── scripts/
├── tests/
│   ├── unit/
│   └── e2e/
└── docs/
```

## Essential Files
- `.eslintrc.cjs`
- `tailwind.config.ts`
- `next.config.mjs`
- `next-pwa.mjs`
- `manifest.json`
- `Dockerfile`
- `dev.Dockerfile`

## PWA Manifest Requirements
```json
{
  "name": "WageHound",
  "short_name": "WageHound",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#F8E8FA",
  "background_color": "#FFFFFF",
  "icons": [
    { "src": "/icons/money-paw-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/money-paw-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## Styling Guidelines
- **Colors**:
  - Primary: #F8E8FA (pastel pink)
  - Secondary: #B0E0FF (pastel blue)
  - Accent: #FFE0B3 (pastel yellow)
  - Paid Green: #8ED99E
  - Alert Red: #FF8A8A
- **Font**: Google Font 'Quicksand' (rounded, friendly)
- **Effects**: CSS blend-mode overlay for crayon effect
- **Icon**: 🦴 paw-print next to WageHound logo only

## Core Features Requirements
1. **Calendar View**: Month view with week-click for shift details
2. **Shift Entry**: Date picker, shift type selector, dynamic forms
3. **Paycheck Entry**: Date, wages, tips, auto-match to unpaid weeks
4. **Difference Detection**: Flag discrepancies >1¢ with red badge
5. **Reports**: Bar charts of wages vs tips, filters, CSV export

## Development Tasks (Sequential)
1. Scaffold Next.js + Tailwind project
2. Enable next-pwa with manifest & icons
3. Create Postgres schema & migrations
4. Wire Supabase magic-link auth
5. Implement shift CRUD + calendar view
6. Add paycheck entry modal & reconciliation
7. Build charts dashboard
8. Write tests & documentation

## Testing Requirements
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright
- **Flow**: User signs up → adds shifts → marks paycheck → dashboard updates

## Coding Standards
- ESLint: @recommended + react + @typescript-eslint
- Prettier formatting
- Conventional Commits + Husky pre-commit hook
- TypeScript strict mode
- Max ESLint warnings: 0

## CI/CD Requirements
- GitHub Actions workflows for lint, test, build
- Prisma migrate checks
- Railway deployment on merge to main

## License
MIT License - Copyright Daniel Park