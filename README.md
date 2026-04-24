# HEIDA v2

**Data-driven decision making for the internationalization of higher education.**

HEIDA is a web application that helps academic institutions collect, track, and visualize internationalization indicators across faculties, colleges, and administrative units. Built as a full rewrite of the original HEIDA platform funded by the European Commission.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | PostgreSQL 16 (Docker) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5 (Google OAuth + local credentials) |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Charts | Recharts |

---

## Getting started

### Prerequisites
- Node.js 20+
- Docker (for the Postgres container)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Random secret for NextAuth (`openssl rand -base64 32`) |
| `AUTH_URL` | Public URL of the app (e.g. `http://localhost:3000`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |

### 3. Start the database

```bash
docker compose up -d db
```

This starts a Postgres 16 container on **port 5433** (to avoid conflicts with any local Postgres on 5432).

### 4. Push the schema

```bash
npm run db:push
```

### 5. Seed with real data

Imports all 489 indicators from the original HEIDA Excel file, along with groups, sub-groups, criteria, departments, and a default admin user:

```bash
npm run db:seed
```

Default admin credentials: `admin@heida.local` / `admin123`

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Google OAuth setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
4. Copy the client ID and secret into `.env.local`

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to the database |
| `npm run db:generate` | Generate a migration file from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run db:seed` | Seed the database with real HEIDA data |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page (Google + credentials)
│   ├── api/auth/[...nextauth] # NextAuth route handler
│   ├── dashboard/
│   │   ├── page.tsx           # Overview with live stats
│   │   ├── data/              # Data entry form
│   │   ├── reports/           # Reports table + per-entry charts
│   │   ├── indicators/        # Browsable indicator list (489 indicators)
│   │   ├── help/              # Step-by-step user guide
│   │   └── admin/
│   │       ├── goals/         # CRUD for strategic goals
│   │       ├── groups/        # CRUD for groups + sub-groups
│   │       ├── departments/   # CRUD for departments + sub-departments
│   │       └── users/         # User role management
│   └── actions/               # Server Actions (createDataEntry, deleteGoal, …)
├── components/
│   ├── layout/                # Sidebar + Header (server + client)
│   └── ui/                    # Button, Input, Table, Badge, etc.
├── db/
│   ├── index.ts               # Drizzle db instance
│   └── schema/                # Table definitions + relations
├── lib/
│   ├── auth.ts                # NextAuth config (full, with DB adapter)
│   └── auth.config.ts         # Edge-compatible NextAuth config (middleware)
├── middleware.ts               # Route protection
└── types/
    └── next-auth.d.ts         # Session type extensions (id, role)
scripts/
└── seed.ts                    # Seeds DB from the HEIDA Excel file
docs/
└── HEIDA database final EN.xlsx   # Source of truth for all indicators
```

---

## Database schema (key tables)

```
users                    — id, name, email, password, role (1–4)
goals                    — id, status, name
groups                   — id, name
sub_groups               — id, name, group_id
indicators               — id, code, name, value_type, visibility, sub_group_id
indicator_goal_scores    — indicator_id, goal_id, score (0–3)
departments              — id, name
sub_departments          — id, name, department_id
user_departments         — user_id, department_id  (many-to-many)
criteria                 — id, name, multiple
answers                  — id, name, value, criteria_id
data_entries             — id, indicator_id, department_id, period_type, visibility, created_by
data_entry_years         — id, data_entry_id, year, value
data_entry_criteria      — id, data_entry_id, criteria_id, free_text
data_entry_criteria_answers — data_entry_criteria_id, answer_id
```

---

## Docker

The `docker-compose.yml` runs two services:

| Service | Port | Description |
|---|---|---|
| `db` | 5433 | Postgres 16 (data persisted in a named volume) |
| `app` | 3000 | Next.js standalone build |

To run the full stack in Docker:

```bash
# Build and start everything
docker compose up --build

# Database only (for local dev)
docker compose up -d db
```

The app container reads environment variables from your shell environment or a `.env` file at the project root (not `.env.local`).

---

## User roles

| Role | Level | Capabilities |
|---|---|---|
| Read-only | 1 | Browse indicators and public reports |
| Member | 2 | Same as read-only |
| Editor | 3 | Submit and manage data entries |
| Admin | 4 | Full access including all admin pages |

---

## License

European Commission funded project — Koc University.
