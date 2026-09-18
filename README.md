# LexTrack — Soomro Law Services CMS

Practice management and accounting platform built for **Soomro Law Services**.

LexTrack helps law-firm teams manage clients, cases, invoices, bank statements, income-tax records (ITR), secure credentials, and reporting — all in one place.

## Tech Stack

- **Frontend / Full-stack**: TanStack Start (React 19 + TanStack Router + TanStack Query)
- **UI**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Backend / Database / Auth**: Supabase (Postgres + Auth + Storage + RLS)
- **Build tool**: Vite 7 + Bun
- **PDF / Excel**: @react-pdf/renderer, ExcelJS
- **Forms & Validation**: React Hook Form + Zod
- **Charts**: Recharts

Originally generated and iterated with [Lovable](https://lovable.dev).

## Features

### Core Modules
- **Dashboard** — overview of key metrics and recent activity
- **Clients** — full client 360° view, create / edit, associated cases & bank accounts
- **Cases** — case management + calendar view
- **Invoices** — create, view, age reports
- **Bank Tracker** — track bank accounts and statement receipt status (received Y/N + date + documents)
- **ITR Sub-Portal** — income-tax return records
- **Credentials Vault** — encrypted storage of client/service credentials (unlock with user password)
- **Reports** — cases, clients, revenue, ITR summary
- **Notifications**
- **Settings** — users (admin), fiscal years

### Roles
- **Admin** — full access including Bank Tracker, Reports, Settings, user management
- **Team** — Dashboard, Clients, Cases, Invoices, Vault, ITR (no admin-only sections)

## Getting Started

### Prerequisites
- Node.js 20+ or Bun
- A Supabase project (or use the existing one connected via environment variables)

### Environment Variables

Create a `.env` file (never commit it):

```env
# Public (safe for client)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Server-only (never expose to browser)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # required for admin server functions
```

### Local Development

```bash
# Install dependencies
bun install
# or
npm install

# Start dev server
bun run dev
# or
npm run dev
```

### Build

```bash
bun run build
```

## Deployment

This project is designed to deploy cleanly on **Vercel**.

1. Connect the GitHub repository to Vercel.
2. Set the environment variables listed above in the Vercel project settings (Production + Preview).
3. Framework preset is auto-detected (Vite / TanStack Start).
4. Deploy.

The free Vercel domain will be based on the project name (`lextrack.vercel.app` or similar).

Backend (database, auth, storage, edge functions) continues to run on Supabase / Lovable Cloud — no separate backend deployment is required on Vercel.

## Project Structure (high level)

```
src/
├── components/          # UI + domain forms
├── integrations/supabase/  # Supabase clients & types
├── lib/
│   ├── api/             # Server functions (TanStack Start)
│   └── vault/           # Client-side vault crypto
├── routes/              # File-based routes (TanStack Router)
└── ...
```

## License

Private / internal use for Soomro Law Services.
