# HEIDA v2 (Experimental)

![Overview](docs/OverView_screenshot.png)

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

## Visual Overview

### Indicators & Data Management
![Indicators](docs/Indicator_screenshot.png)
*Browse and manage all 489 internationalization indicators.*

### Efficient Data Entry
![Data Entry](docs/Data_Entry_Screenshot.png)
*Streamlined workflow for submitting unit-level data.*

### Dynamic Reports & Analytics
![Reports](docs/Reports_Screenshot.png)
*Visualize trends with real-time charts and exportable tables.*

---

## Workflows in Action

### User Experience & Navigation
![User Workflow](docs/Users_screenrecord_2026.gif)

### Administrative Role Management
![Admin Workflow](docs/Admin_users_screenrecord_2026.gif)

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

## Contributors

| Contributor | Role |
|---|---|
| [Emin Devrim Fidan](https://github.com/devrimfidan) | Lead developer, architecture, domain design |
| [Claude Sonnet 4.6](https://claude.ai) | AI pair programmer — code review, security hardening, MCP integration |

---

## License
Experimental rewrite based on the European Commission funded project — Koç University. Built with AI.

---

<details>
<summary><strong>About the HEIDA Project (click to expand)</strong></summary>

> [!NOTE]
> The original project tool was published at [https://github.com/kocun/heida](https://github.com/kocun/heida) and is now archived. Not all information below may be up to date.

## HEIDA Project

**HEIDA** refers to **"Data driven decision making for internationalization of higher education: Bridging the gap between faculty and admin using effective communication platforms"**

It is a 2 year **Erasmus+ Key Action 2 funded project (2015–2016)** led by [Koç University (Istanbul, Türkiye)](https://web.archive.org/web/20240626163625/http://www.ku.edu.tr/) and project partners: [Universidad Autonoma de Barcelona (Barcelona, Spain)](https://web.archive.org/web/20240626163625/http://www.uab.cat/web/universitat-autonoma-de-barcelona-1345467954774.html) and [International School for Social and Business Studies (Celje, Slovenia)](https://web.archive.org/web/20240626163625/http://mfdps.si/en).

The aims of the project are to address three specific needs that were identified in European Higher Education Institutions:

- A data collection and sharing tool for measuring and monitoring internationalisation activities
- Bridging gaps in communication and efforts between faculty, staff, senior management and students in internationalisation activities
- A better understanding of the demands for effective management of international activities

---

### Why this project?

HEIDA is a 2 year project led by [Koç University](https://web.archive.org/web/20240708153256/http://www.ku.edu.tr/) (Türkiye) in collaboration with [Universidad Autonoma de Barcelona](https://web.archive.org/web/20240708153256/http://www.uab.cat/) (Spain) and [International School for Social and Business Studies](https://web.archive.org/web/20240708153256/http://mfdps.si/) (Slovenia).

The project responds to two specific needs:

- The need for a data collection and sharing tool or platform for the internationalisation activities of higher education institutions
- The need to bridge the gap in communication and joint work that often exists between HEI faculty, staff, senior management and students in internationalisation efforts and activities

The new tool and the stakeholder involvement process will promote the development of a more complete institutional understanding of the international dimensions and engagement of universities across Europe.

---

### How we will do this?

The project consists of three phases:

- **First phase – DESIGN:** A data tool/platform system for internationalisation of HEIs and a training module in consultation with project partners and other local and national stakeholders.
- **Second phase – TESTING:** Feasibility of the tool/platform system on a sample of HEIs in Europe.
- **Third phase – DISSEMINATION:** Promote the review of the results of the tool/platform system and the training module amongst HEIs and other stakeholders.

---

### What we expect to achieve?

- Increased **awareness of the value of data and data sharing** for the development and implementation of internationalization strategies in HEIs
- **Increased partnership and collaborative working** between administrative and academic units at each partner organisation
- **Increased capacity** of relevant staff in data collection, analysis and sharing

---

### Who should follow this project?

- Senior Managers at European HEIs (Presidents/Rectors/Vice Presidents or Vice-Provosts), Directors of Administrative Units
- Senior Faculty with international research, teaching and cooperation coordination responsibilities
- Office of International Activities/Relations staff
- International Higher Education research organisations, associations and networks
- Businesses with expertise and interest in data management services for education institutions

---

### Project Team

**Project Coordinator (Koç University):**
- Melissa Abache, Global Engagement Coordinator
- Adil Atilgan, Software Development Management
- Nilüfer Akpınar, Coordinator International Special Projects
- Meline Koruk
- Meltem Işanlar, Grants Financial Manager
- Çağan Üçtuğ, Global Recruitment Team

**Project Partners:**
- Marta Vilalta, Director, International Relations Office, Universidad Autonoma de Barcelona (UAB)
- Xavier Barnes, Projects, International Relations Office, Universidad Autonoma de Barcelona (UAB)
- Dr. Georgeta Ion, Senior expert, EDO group, Universidad Autonoma de Barcelona (UAB)
- Dr. Nada Trunk, Advisor to Dean, International School for Social and Business Studies (ISSBS)
- Dr. Valentina Jost Leser, Researcher, International School for Social and Business Studies (ISSBS)
- Aleš Trunk, M.Sc., Young Researcher, International School for Social and Business Studies (ISSBS)
- Marko Smrkolj, International Relation and Project Office, International School for Social and Business Studies (ISSBS)

---

### Expert Panel

The project's Expert Panel contributes feedback either virtually or during selected project meetings on: qualitative and quantitative analysis, tool design, reports, final project evaluation: visualization tool, data sharing tool proposal, training module.

**Dr. Joaquín Gairín**, Director, EDO – The Organizational Development Group, Universidad Autonoma de Barcelona, Barcelona, Spain. [Full professional profile](https://web.archive.org/web/20240708153256/http://edo.uab.cat/en/content/edos-group)

- Professor of Didactics and of Didactics and Educational Management, with broad know-how on social and educational development, organisational development, educational change processes, leadership, evaluation of programmes and institutions, ICT in training and impact evaluation.

**Dr. Valerij Dermol**, Assistant Professor and Associate Dean, International School for Social and Business Studies, Celje, Slovenia. [Full professional profile](https://web.archive.org/web/20240708153256/http://mfdps.si/sites/default/files/valerij_dermol.pdf)

- Economics, business training and consulting, marketing and communications, research topics related to learning in enterprises.

---

### Advisory Board

The project's Advisory Board is responsible for monitoring delivery of project activities and achievement of results and advising on corrective measures if needed.

- **Dr. Andrej Koren**, Associate Professor, International School for Social and Business Studies, Celje, Slovenia
- **Dr. Bilgen Bilgin**, Dean of Students, Koç University, Istanbul, Türkiye
- **Prof. Lluís Quintana Trías**, Vice-rector for International Relations, Universidad Autònoma de Barcelona

---

### Related Resources

For measuring or evaluating internationalisation in HE, a selection of relevant projects and tools:

- [NUFFIC – Existing tools for measuring internationalisation](https://web.archive.org/web/20240708173712/https://www.nuffic.nl/en/library/existing-tools-for-measuring-internationalisation.pdf)
- [IMPI Project](https://web.archive.org/web/20240708173712/http://www.impi-project.eu/home)
- [DELECA Project](https://web.archive.org/web/20240708173712/http://www.deleca.org/)
- [Mapping Internationalization (MINT)](https://web.archive.org/web/20240708173712/https://www.nuffic.nl/en/expertise/quality-assurance-and-internationalisation/mapping-internationalisation-mint/)
- [The U-Map project](https://web.archive.org/web/20240708173712/http://www.u-map.eu/)
- [International Association of Universities – Internationalization Resource Center](https://web.archive.org/web/20240708173712/https://iau-aiu.net/)
- [CeQuInt Project](https://web.archive.org/web/20240708173712/http://ecahe.eu/home/about/projects/cequint/)
- [eQuatic Project](https://web.archive.org/web/20240708173712/http://www.equatic.eu/)
- [Higher Education Data and Information Improvement Programme (HEDIIP)](https://web.archive.org/web/20240708173712/https://www.hediip.ac.uk/)
- [Responsible use of student data in HE – Stanford CAROL and Ithaka S+R](https://web.archive.org/web/20240708173712/http://gsd.su.domains/)
- [Free online resources on data management skills in HE](https://web.archive.org/web/20240708173712/https://heida.ku.edu.tr/wp-content/uploads/2018/08/3-4-HEIDA-Additional-free-online-resources-on-data-management-skills-in-HE-EN.pdf)

</details>
