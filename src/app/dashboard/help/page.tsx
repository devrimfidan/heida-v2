"use client";

import { useState } from "react";
import { BookOpen, Lightbulb, AlertCircle, Info, Shield } from "lucide-react";
import { TableOfContents, type TocItem } from "@/components/help/table-of-contents";

/* ─── Table of Contents items ─────────────────────────────────────── */
const userTocItems: TocItem[] = [
  { id: "getting-started", label: "Getting started", depth: 2 },
  { id: "step-1-select-unit", label: "Select your unit", depth: 3 },
  { id: "step-2-choose-goals", label: "Choose goals", depth: 3 },
  { id: "step-3-select-group", label: "Select group & sub-group", depth: 3 },
  { id: "step-4-enter-data", label: "Enter data", depth: 3 },
  { id: "step-5-data-management", label: "Data management criteria", depth: 3 },
  { id: "step-6-reports", label: "View & manage reports", depth: 3 },
  { id: "indicator-types", label: "Indicator value types", depth: 2 },
];

const adminTocItems: TocItem[] = [
  { id: "admin-guide", label: "Administrator Guide", depth: 2 },
  { id: "admin-goals", label: "Goals & Groups", depth: 3 },
  { id: "admin-departments", label: "Departments", depth: 3 },
  { id: "admin-users", label: "User Roles", depth: 3 },
  { id: "admin-mcp", label: "MCP Connectors & AI", depth: 3 },
  { id: "admin-api", label: "API Endpoints", depth: 3 },
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");

  return (
    <div className="flex gap-10 max-w-[1200px]">
      <article className="flex-1 min-w-0 pb-16">
        <header className="mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary mb-3">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Documentation
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
            HEIDA Documentation
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Select the guide below that matches your role to learn how to interact with the platform, manage data, and configure system integrations.
          </p>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setActiveTab("user")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              User Guide
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <Shield className="w-4 h-4" />
              Administrator Guide
            </button>
          </div>
        </header>

        {activeTab === "user" ? (
          <>
            <section className="docs-section">
              <h2 id="getting-started" className="docs-h2">Getting started</h2>
              <p className="docs-p">
                The data-entry workflow consists of six simple steps. Our new uniform Grid Layout makes filtering fast and consistent across both the Indicators and Data Entry pages.
              </p>

              <h3 id="step-1-select-unit" className="docs-h3"><StepBadge n="01" /> Select your unit</h3>
              <p className="docs-p">
                Before entering data, identify the type of unit you represent. Units can be <strong>Academic</strong>, <strong>Administrative</strong>, or <strong>Research</strong>.
              </p>
              <ul className="docs-list">
                <li><strong>Academic units:</strong> Colleges, Faculties, Graduate Schools, and Departments</li>
                <li><strong>Administrative units:</strong> International Office, HR, Finance, IT, Library, Registrar, etc.</li>
                <li><strong>Research units:</strong> Research Centres, Institutes, Laboratories, and project teams</li>
              </ul>
              <Callout type="tip">
                Write the exact official name of your unit in the free-text field — this makes reporting clearer.
              </Callout>

              <h3 id="step-2-choose-goals" className="docs-h3"><StepBadge n="02" /> Choose your internationalization goal(s)</h3>
              <p className="docs-p">
                Select one or more of the five strategic internationalization goals that apply to your unit. If your unit has no defined goal yet, choose the last option to browse all available indicators.
              </p>
              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th className="w-20">Code</th>
                      <th>Goal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="font-mono text-primary font-medium">G-01</td><td>Enhance the quality of education</td></tr>
                    <tr><td className="font-mono text-primary font-medium">G-02</td><td>Enhance the quality of research</td></tr>
                    <tr><td className="font-mono text-primary font-medium">G-03</td><td>Prepare students for intercultural / global life and work</td></tr>
                    <tr><td className="font-mono text-primary font-medium">G-04</td><td>Enhance international reputation and visibility</td></tr>
                    <tr><td className="font-mono text-primary font-medium">G-05</td><td>Provide service to society and community</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 id="step-3-select-group" className="docs-h3"><StepBadge n="03" /> Select a group and sub-group</h3>
              <p className="docs-p">
                Indicators are organised into <strong>9 Groups</strong> and <strong>22 Sub-groups</strong>. Use the top filter bar (now perfectly aligned!) to drill down into the area most relevant to your unit.
              </p>
              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Group</th>
                      <th>Sub-groups</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="font-medium">Students</td><td>Study Abroad · International Students · General Student Data</td></tr>
                    <tr><td className="font-medium">Staff</td><td>Academic Staff · Non-Academic Staff · Outgoing Staff · Staff from Abroad</td></tr>
                    <tr><td className="font-medium">Administration</td><td>Administration</td></tr>
                    <tr><td className="font-medium">Research</td><td>Profiles · Visiting Researchers · Activity · Publications · Patents</td></tr>
                    <tr><td className="font-medium">Funding &amp; Finance</td><td>Funding and Finance</td></tr>
                    <tr><td className="font-medium">Curricula &amp; Academic Services</td><td>Curricular and Academic Services</td></tr>
                    <tr><td className="font-medium">Promotion &amp; Marketing</td><td>Promotion and Marketing</td></tr>
                    <tr><td className="font-medium">Non-Academic Services</td><td>Services to International / Study-Abroad Students, Staff</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 id="step-4-enter-data" className="docs-h3"><StepBadge n="04" /> Pick indicators and enter data</h3>
              <p className="docs-p">
                From the filtered indicator list, click any row to expand the data entry form. Each indicator requires a time period, year/value pairs, and optional unit information.
              </p>
              <ul className="docs-list">
                <li>Select the time period type: <strong>Calendar Year</strong> (e.g. 2024) or <strong>Academic Year</strong> (e.g. 2023–2024)</li>
                <li>Enter one or more year/value pairs — click <code className="docs-code">+ Add Year</code> to add more rows</li>
                <li>Optionally select a department and sub-department from the dropdowns</li>
                <li>Set visibility: <strong>Public</strong>, <strong>Staff Only</strong>, or <strong>Not Sure</strong></li>
                <li>Click <code className="docs-code">Save Entry</code> to submit — you will be redirected to the Reports page</li>
              </ul>
              <Callout type="info">
                You can add data for multiple years in a single submission — no need to save one year at a time.
              </Callout>

              <h3 id="step-5-data-management" className="docs-h3"><StepBadge n="05" /> Data management criteria <span className="text-xs font-normal text-muted-foreground">(optional)</span></h3>
              <p className="docs-p">
                For each indicator, 8 optional criteria questions help your institution understand how data is managed. These answers improve reporting quality but are not required to save an entry.
              </p>
              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th className="w-14">#</th>
                      <th>Question</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="font-mono text-xs text-muted-foreground">9.1</td><td>Do we have the data for this indicator? (Yes / No / Partially)</td></tr>
                    <tr><td className="font-mono text-xs text-muted-foreground">9.2</td><td>Is collecting this indicator optional or compulsory in your country?</td></tr>
                    <tr><td className="font-mono text-xs text-muted-foreground">9.3</td><td>How frequently is this data collected? (Monthly / Semester / Yearly / Other)</td></tr>
                    <tr><td className="font-mono text-xs text-muted-foreground">9.4</td><td>Who is responsible for collecting the raw data?</td></tr>
                    <tr><td className="font-mono text-xs text-muted-foreground">9.5</td><td>How is this indicator used in your unit?</td></tr>
                    <tr><td className="font-mono text-xs text-muted-foreground">9.6</td><td>Does your unit have accuracy procedures? (Yes / No / Not sure)</td></tr>
                    <tr><td className="font-mono text-xs text-muted-foreground">9.7</td><td>In what format is the data collected?</td></tr>
                    <tr><td className="font-mono text-xs text-muted-foreground">9.8</td><td>In what format is this indicator shared externally?</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 id="step-6-reports" className="docs-h3"><StepBadge n="06" /> View & manage reports</h3>
              <p className="docs-p">
                The Reports page shows all submitted data entries. Click the chart icon on any row to see a year-by-year bar chart. We have massively upgraded this page:
              </p>
              <ul className="docs-list">
                <li><strong>Dynamic Sorting:</strong> Click any column header (Code, Indicator, Unit, etc.) to instantly sort the data ascending or descending.</li>
                <li><strong>Column Visibility:</strong> Use the "Columns" dropdown menu on the top right to hide or show columns (like Unit, Period, or Visibility) to focus on the exact data you need.</li>
                <li><strong>Editing:</strong> Click the pencil icon to edit existing historical data without having to delete and recreate it.</li>
                <li><strong>Delete:</strong> Removes the entry and all associated data permanently.</li>
              </ul>
              <Callout type="warning">
                Deleting an entry is permanent — all year/value data will be removed and cannot be recovered.
              </Callout>
            </section>

            <hr className="docs-hr" />

            <section className="docs-section">
              <h2 id="indicator-types" className="docs-h2">Indicator value types</h2>
              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead><tr><th>Type</th><th>Description</th><th>Example</th></tr></thead>
                  <tbody>
                    <tr>
                      <td className="font-medium whitespace-nowrap">Yes / No</td>
                      <td>Binary answer indicating whether something exists or is done.</td>
                      <td className="italic text-muted-foreground">Does the unit advise students on study abroad?</td>
                    </tr>
                    <tr>
                      <td className="font-medium whitespace-nowrap">Numeric</td>
                      <td>An absolute count, ratio, or other numerical value.</td>
                      <td className="italic text-muted-foreground">Number of incoming exchange students: 42</td>
                    </tr>
                    <tr>
                      <td className="font-medium whitespace-nowrap">Percentage</td>
                      <td>A proportion expressed as 0–100.</td>
                      <td className="italic text-muted-foreground">Proportion of students studying abroad: 12.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="docs-section">
              <h2 id="admin-guide" className="docs-h2">Administrator Guide</h2>
              <p className="docs-p">
                Admin users <span className="text-xs text-muted-foreground">(role 4)</span> have access to configuration pages under the <strong>Admin</strong> section of the sidebar.
              </p>

              <h3 id="admin-goals" className="docs-h3">Goals & Groups</h3>
              <p className="docs-p">Add, rename, or reorder the five strategic internationalization goals. Manage the 9 indicator groups and 22 sub-groups. Deleting a group also removes its sub-groups.</p>

              <h3 id="admin-departments" className="docs-h3">Departments</h3>
              <p className="docs-p">Manage faculties, colleges, graduate schools and administrative units. Sub-departments (e.g. individual degree programmes) can be nested under each department.</p>

              <h3 id="admin-users" className="docs-h3">User Roles</h3>
              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium whitespace-nowrap">Read-only (1)</td>
                      <td>Can browse indicators and view public reports. Cannot submit or edit data.</td>
                    </tr>
                    <tr>
                      <td className="font-medium whitespace-nowrap">Member (2)</td>
                      <td>Same as Read-only. Cannot submit data entries.</td>
                    </tr>
                    <tr>
                      <td className="font-medium whitespace-nowrap">Editor (3)</td>
                      <td>Can submit and edit data entries. Cannot access admin configuration pages.</td>
                    </tr>
                    <tr>
                      <td className="font-medium whitespace-nowrap">Admin (4)</td>
                      <td>Full access — data entry, reports, and all admin configuration pages.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 id="admin-mcp" className="docs-h3 flex items-center gap-2">
                MCP Connectors & AI
              </h3>
              <p className="docs-p">
                HEIDA now supports the <strong>Model Context Protocol (MCP)</strong>. This allows AI assistants like Claude Desktop, Cursor, and eventually ChatGPT to securely connect to the database and answer natural language queries based on your live strategic data.
              </p>
              <Callout type="info">
                To connect an AI assistant, visit the <strong>Connectors</strong> page under the Admin sidebar. There you will find your unique SSE endpoint and a ready-to-copy JSON configuration snippet.
              </Callout>

              <h3 id="admin-api" className="docs-h3">API Endpoints</h3>
              <p className="docs-p">
                Internally, HEIDA uses secure Next.js Server Actions for all standard dashboard operations, meaning there are no traditional REST API endpoints exposed to the public for those features.
              </p>
              <p className="docs-p mt-4">
                However, for the MCP Integration, we specifically expose the following API endpoints:
              </p>
              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Method</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono text-sm text-primary">/api/mcp/sse</td>
                      <td>GET</td>
                      <td>Initializes a Server-Sent Events stream for AI clients to connect to the MCP server.</td>
                    </tr>
                    <tr>
                      <td className="font-mono text-sm text-primary">/api/mcp/messages</td>
                      <td>POST</td>
                      <td>Receives JSON-RPC commands from AI clients (e.g., executing the <code>get_historical_data</code> tool) and routes the response through the active SSE stream.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <footer className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            HEIDA was developed as part of a European Commission-funded project on data-driven decision making.
          </p>
        </footer>
      </article>

      <aside className="hidden xl:block w-56 shrink-0">
        <div className="sticky top-6">
          <TableOfContents items={activeTab === "user" ? userTocItems : adminTocItems} />
        </div>
      </aside>
    </div>
  );
}

function StepBadge({ n }: { n: string }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold mr-1.5 align-text-bottom">
      {n}
    </span>
  );
}

function Callout({
  type,
  children,
}: {
  type: "tip" | "info" | "warning";
  children: React.ReactNode;
}) {
  const styles = {
    tip: {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      icon: <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
      label: "Tip",
    },
    info: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      text: "text-blue-800",
      icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
      label: "Info",
    },
    warning: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-800",
      icon: <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
      label: "Warning",
    },
  };
  const s = styles[type];

  return (
    <div className={`rounded-lg border ${s.border} ${s.bg} px-4 py-3 my-5`}>
      <div className="flex items-start gap-2.5">
        {s.icon}
        <div className={`text-sm leading-relaxed ${s.text}`}>
          <span className="font-semibold">{s.label}: </span>
          {children}
        </div>
      </div>
    </div>
  );
}
