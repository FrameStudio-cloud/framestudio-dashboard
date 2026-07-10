# FrameStudio Dashboard — Agent Context

## Project Overview

Admin dashboard for a web dev/design agency (FrameStudio). Built as a full-featured shell with mock data, wired to Supabase auth + CRUD.

## Stack

- React 19 + Vite 8 + Tailwind CSS v4
- react-router-dom v7 (lazy-loaded routes)
- recharts (charts)
- react-icons (icons)
- cite-ui (ToastProvider, Alert, Icon, Spinner, Tooltip)
- @supabase/supabase-js (auth + database)
- @tanstack/react-query (configured but not heavily used yet)

## Key Architecture

- **`src/data/mock.js`** — All mock/seed data shapes. Single source of truth for demo data.
- **`src/context/DataContext.jsx`** — Central CRUD layer. Calls Supabase on every mutation and falls back to `useState` + mock data when Supabase env vars are missing. Applies `toCamelCase()` on reads (snake_case DB → camelCase components) and `toSnakeCase()` on writes (camelCase forms → snake_case DB).
- **`src/context/AuthContext.jsx`** — Supabase auth. Falls back gracefully if env vars missing (`supabase === null`). When supabase is null, app skips login and shows dashboard directly. Exposes `login`, `signUp`, `resetPassword`, `logout`.
- **`src/lib/supabase.js`** — Creates Supabase client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- **`src/lib/supabaseKeel.js`** — Separate Supabase client for Keel project (`VITE_KEEL_SUPABASE_URL` / `VITE_KEEL_SUPABASE_ANON_KEY`). Used for keel shops, approvals, and activity log. Auth is disabled (`persistSession: false`) — all queries use the anon key without a user session.

## Environment

- `.env` file at root with:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- If missing, app runs entirely offline with mock data (no login).

## Routes (all lazy-loaded)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | KPIs, charts, activity feed, deadlines, quick-actions |
| `/clients` | Clients | Directory + expandable profiles, stage pipeline, invoices, notes |
| `/links` | Links Hub | Categorized links, favourites, search, tags, copy URL |
| `/finances` | Finances | Income, expenses, invoices, profit overview, CSV export |
| `/keel` | Keel Pulse | Shop monitoring, approval queue, activity log |
| `/focus` | Focus Board | Kanban (To Do / In Progress / Done), priority filter, sort, due dates, drag |
| `/timeline` | Timeline | Aggregated due dates from tasks + invoices, grouped by month |
| `/analytics` | Analytics | All-time stats, service type breakdown, MoM growth |
| `/reports` | Reports | Monthly, per-client, outstanding — PDF/CSV export |
| `/login` | Login | Sign in / Sign up / Forgot password with Supabase auth |

## Complete Features

- **Dashboard**: 4 KPI cards, revenue chart (week/month toggle), client status pipeline, activity feed, deadlines, quick-actions, recent transactions, focus widget
- **Clients**: Directory with search/status filter, compact pipeline bar (5-dot progress + stage label) on collapsed card, expandable profile with full stage pipeline (clickable to update), invoice history, payment history, notes log, one-click links (WhatsApp/site/repo/Supabase/Vercel)
- **Links**: Table/card views, categories (client-sites/products/internal), favourites, search, tags, copy-to-clipboard, add/edit/delete
- **Finances**: 4 tabs (Income/Expenses/Invoices/Profit). Income ledger + charts, expense log by category, invoice CRUD with status dropdown, profit overview with service type pie, CSV export
- **KeelPulse**: 3 tabs (Overview/Announcements/Activity). Shop table with mobile card fallback, **subscription expiry system** — each shop has a `subscriptionExpiresAt`, auto-closed daily by pg_cron, expired shops marked red with Renew button (7/14/30 day options), expiring-soon amber warning within 7 days. Approvals tab removed. Announcements CRUD with variants (info/warning/alert/sale/maintenance), scheduling, dismissals tracking. Delete shop with Supabase cascade. `deleteShop` in DataContext deletes from `keel_shops` + sets `shops.scheduled_deletion_at` for cron cleanup.
- **Focus**: 3-column kanban with drag-to-change-status, priority filter (high/med/low), sort (newest/priority/due date/name), priority (high/med/low with flags), due dates with overdue highlighting, add/edit via form
- **Analytics**: Revenue trend, client acquisition, service type breakdown (pie), MoM growth (green/red bars), best/worst month, stats grid
- **Reports**: 3 report types — monthly revenue (PDF), per-client (CSV per client), outstanding invoices (PDF). All data derived from mock arrays.
- **Timeline**: Aggregated view of all upcoming due dates from focus tasks and invoices, grouped by month, color-coded urgency (overdue/today/soon), accessed via sidebar or `/timeline`
- **Global search**: Ctrl+K search overlay — searches clients, tasks, links, payments with grouped results
- **Notifications**: Bell icon with unread badge, dropdown, mark-all-read, click-to-navigate
- **Dark mode**: Persistent toggle in sidebar, persisted to localStorage
- **Mobile responsive**: Collapsible sidebar, card-based mobile fallbacks for all tables, `overflow-x-auto` on table wrappers, delete buttons visible on touch devices (`max-md:opacity-100`)

## What's NOT Built (Needs Real Backend)

- Data persistence (everything is `useState` in DataContext — resets on refresh)
- Supabase realtime subscriptions
- File uploads
- Email sending (invoices, notifications, password reset emails rely on Supabase)
- M-Pesa integration
- Role-based access / multi-user
- Approvals workflow in KeelPulse (table exists but no approve/reject UI)

## Known Gotchas

- **snake_case ↔ camelCase**: DataContext.jsx handles mapping via `toCamelCase()` (DB → UI) and `toSnakeCase()` (UI → DB). If you see `Cannot read properties of undefined (reading 'toLocaleString')`, it's likely a missing mapping. Wrap Supabase results with `toCamelCase()` and form data with `toSnakeCase()`.
- **formatKES**: Always use `(amount || 0).toLocaleString()` — never assume the value is a number.
- **Auth UUID**: `lewisirungu489@gmail.com` → `3c758dfd-8bb0-4654-8d30-3ca8225a0381`. Use this for seed data and manual queries.
- **keel_activity_log ordering**: Keel project uses `timestamp` column (not `created_at`). DataContext.jsx handles this with a conditional: `t.table === "keel_activity_log" ? "timestamp" : "created_at"`.
- **cite-ui peer deps**: cite-ui targets React 18; install with `--legacy-peer-deps` on React 19. `react-is` may need reinstallation after cite-ui install (recharts peer dep).
- **All CRUD toasts**: Every page imports `useToast` from `cite-ui`. Use `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`. Never use `alert()`.
- **Forgot password**: `AuthContext.resetPassword(email)` calls `supabase.auth.resetPasswordForEmail()` with redirect to `/login`. Only functional when Supabase env vars are set.

## Commands

```sh
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Styling Conventions

- Tailwind CSS v4 (no custom CSS files)
- Dark mode via `class` strategy on `<html>`
- Dark class: `dark:bg-[#0f172a]` (slate-900), `dark:border-white/10`
- Accent: amber-600 (brand)
- Cards: `rounded-2xl`, `shadow-sm`, `border border-gray-100 dark:border-white/10`
- Charts: Recharts with amber palette (`#d97706`, `#f59e0b`, `#fbbf24`, `#fcd34d`)
- All components are functional components
- No TypeScript

## Auth Flow

1. If `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set → Supabase client created, login page shown
2. If env vars missing → `supabase === null`, `ProtectedRoute` renders children directly (skips auth), app shows dashboard with mock data
3. Login page has Sign In / Sign Up toggle
4. By default, Supabase requires email confirmation — disable in Supabase dashboard → Authentication → Settings → uncheck "Confirm email" for instant sign-in after sign-up

## Supabase Backends

### FrameStudio Dashboard (Main)

- **Project ref**: `sjhwllnhuozxeplpygnc`
- **CLI linked**: yes (PAT: `sbp_8d8bbdf3cbc6fb15fcc297234075ef9a19e95772`)
- **Tables**: 10 — `clients`, `links`, `income`, `expenses`, `invoices`, `focus_items`, `notifications`, `keel_shops`, `keel_approvals`, `keel_activity_log`
- **RLS**: Enabled on all tables — per-user policies for user-owned tables, authenticated-role for keel tables
- **Data API**: `authenticated` role granted access

### Keel POS (Separate Project)

- **Project ref**: `hmcowpwfefeeossztuem`
- **URL**: `https://hmcowpwfefeeossztuem.supabase.co`
- **Env vars**: `VITE_KEEL_SUPABASE_URL` / `VITE_KEEL_SUPABASE_ANON_KEY`
- **Key tables**: `keel_shops` (dashboard-managed), `shops` (mobile app signups), `keel_approvals`, `keel_activity_log`, `users`, `products`, `sales`, `expenses`, `store_settings`
- **RLS**: Disabled on all tables (anon key has full access)
- **Subscription expiry**: `subscription_expires_at` column on both `keel_shops` and `shops`. Auto-closed daily at midnight by pg_cron job running `auto_close_expired_subscriptions()` SQL function.
- **Delete shop**: `deleteShop` in DataContext deletes from `keel_shops` immediately and sets `shops.scheduled_deletion_at = NOW()` (cron picks it up for full cleanup).
- **Edge Function**: `check-expired-subscriptions` (deployed but not cron-scheduled — the pg_cron SQL function is the primary mechanism)

Run `supabase db query --file <file.sql>` to execute SQL directly via CLI.

## Obsidian Vault

- **Vault path**: `C:\Users\Administrator\Documents\Dev notes`
- **MCP server**: `@bitbonsai/mcpvault@latest` (configured in `~/.config/opencode/opencode.json`)
- **Dashboard docs**: `Framestudio/` folder — `Framestudio Dashboard.md`, `Framestudio Architecture.md`, `Supabase.md`, `Troubleshoot and Incidents.md`
- All notes linked from `05-framestudio.md`

## Hooks

- `src/hooks/useSettings.js` was removed (unused). No custom hooks remain.
