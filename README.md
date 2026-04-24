# HEIDA v2 (Experimental)

**Data-driven decision making for the internationalization of higher education — Powered by AI.**

HEIDA is a modern web application that helps academic institutions collect, track, and visualize internationalization indicators across faculties, colleges, and administrative units. This version is a full architectural rewrite of the original HEIDA platform, designed to be inherently AI-ready and high-performance.

> [!NOTE]
> This is an **experimental rewrite** of the HEIDA platform. It was built using a collaboration of human developer expertise and advanced AI coding assistants: **Claude Code Sonnet 4.6**, **Gemini 3.1 Pro**, and **Antigravity**.

---

## Tech stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 14 (App Router, TypeScript) |
| **Database** | PostgreSQL 16 (Neon / Docker) |
| **ORM** | Drizzle ORM |
| **Auth** | NextAuth v5 (Auth.js) |
| **AI Protocol** | Model Context Protocol (MCP) |
| **Styling** | Tailwind CSS + shadcn/ui primitives |
| **Charts** | Recharts |

---

## Key Features

- **Modern Dashboard:** Instant page transitions and real-time data updates.
- **Dynamic Reporting:** Filter, sort, and visualize indicators with interactive charts.
- **AI Integration (MCP):** Native support for the Model Context Protocol, allowing AI assistants (Claude, Cursor, etc.) to securely query institutional data.
- **Clean Architecture:** Type-safe database operations, Zod validation, and robust error handling.
- **Role-Based Access:** Multi-tier permissions (Read-Only, Member, Editor, Admin).

---

## AI Integration (MCP)

HEIDA v2 includes a built-in MCP server that exposes secure tools to AI clients. This allows you to chat with your institutional data directly in tools like Claude Desktop or Cursor.

### Available AI Tools:
- `list_strategic_goals`: Retrieves the current strategic roadmap.
- `search_indicators`: Finds indicator IDs by name or code.
- `get_historical_data`: Optimized bulk retrieval of year-value pairs for any indicator.

### Getting Connected:
Visit the **Connectors** page in the Admin dashboard to generate a 1-click JSON configuration snippet for your AI client.

---

## Getting started

### Prerequisites
- Node.js 20+
- Docker (for local development)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your database and auth secrets.

### 3. Start the database
```bash
docker compose up -d db
```

### 4. Push and Migrate the schema
```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed with real data
```bash
npm run db:seed
```
Default admin: `admin@heida.local` / `admin123`

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:seed` | Seed from original HEIDA Excel data |

---

## Project structure

```
src/
├── app/
│   ├── actions/               # Server Actions with Zod validation
│   ├── dashboard/
│   │   ├── admin/             # Admin console (MCP, Users, Goals, etc.)
│   │   ├── data/              # Data entry workflow
│   │   └── reports/           # Live charts and tables
│   └── api/mcp/               # MCP SSE & Message endpoints
├── db/
│   ├── schema/                # Indexed PostgreSQL tables
├── lib/
│   ├── mcp.ts                 # MCP Server logic & Tool definitions
│   └── constants.ts           # Shared role & permission logic
```

---

## License
Experimental rewrite based on the European Commission funded project — Koc University. Built with AI.
