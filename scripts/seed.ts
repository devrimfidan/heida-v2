import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/db/schema";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import path from "path";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// ── Relevance string → score 0-3 ─────────────────────────────────────────
function scoreFromRelevance(val: string): number {
  const v = (val ?? "").toLowerCase();
  if (v.includes("highly")) return 3;
  if (v.includes("moderately")) return 2;
  if (v.includes("low")) return 1;
  return 0;
}

// ── Data type → enum value ─────────────────────────────────────────────────
function mapValueType(val: string): "yes_no" | "numeric" | "percentage" {
  const v = (val ?? "").toLowerCase();
  if (v.includes("yes") || v.includes("no")) return "yes_no";
  if (v.includes("percent")) return "percentage";
  return "numeric"; // absolute number, ratio, other → numeric
}

async function seed() {
  console.log("🌱 Seeding from Excel...\n");

  // ── Load Excel ────────────────────────────────────────────────────────────
  const filePath = path.resolve("docs/HEIDA database final EN.xlsx");
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets["Sheet1"];
  const rawRows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
  // rows 0 = column headers, 1 = type descriptions, 2+ = data
  const dataRows = rawRows.slice(2).filter((r) => r[2]); // must have indicator code
  console.log(`  Loaded ${dataRows.length} indicators from Excel`);

  // ── Truncate existing data (order matters for FKs) ────────────────────────
  console.log("\n→ Clearing existing data");
  await client`TRUNCATE data_entry_criteria_answers, data_entry_criteria, data_entry_years, data_entries, indicator_goal_scores, indicators, sub_groups, groups, sub_departments, user_departments, departments, answers, criteria, sessions, accounts, users, goals RESTART IDENTITY CASCADE`;

  // ── Goals ─────────────────────────────────────────────────────────────────
  console.log("→ Goals");
  const goalRows = await db.insert(schema.goals).values([
    { status: 1, name: "Enhance the quality of education" },
    { status: 2, name: "Enhance the quality of research" },
    { status: 3, name: "Prepare students for intercultural/global life and work" },
    { status: 4, name: "Enhance international reputation and visibility" },
    { status: 5, name: "Provide service to society and community" },
  ]).returning();
  console.log(`   ${goalRows.length} goals`);

  // ── Groups ────────────────────────────────────────────────────────────────
  console.log("→ Groups");
  const uniqueGroups = Array.from(new Set(dataRows.map((r) => r[0] as string)));
  const groupMap = new Map<string, string>(); // name → id

  for (const name of uniqueGroups) {
    const [g] = await db.insert(schema.groups).values({ name }).returning();
    groupMap.set(name, g.id);
  }
  console.log(`   ${groupMap.size} groups`);

  // ── Sub-groups ────────────────────────────────────────────────────────────
  console.log("→ Sub-groups");
  const uniqueSubs = Array.from(new Set(dataRows.map((r) => `${r[0]}|${r[1]}`)));
  const subGroupMap = new Map<string, string>(); // "group|sub" → id

  for (const key of uniqueSubs) {
    const [groupName, subName] = key.split("|");
    const groupId = groupMap.get(groupName)!;
    const [sg] = await db.insert(schema.subGroups).values({ name: subName, groupId }).returning();
    subGroupMap.set(key, sg.id);
  }
  console.log(`   ${subGroupMap.size} sub-groups`);

  // ── Indicators + goal scores ──────────────────────────────────────────────
  console.log("→ Indicators (489 rows, batched)");

  const BATCH = 50;
  let indicatorCount = 0;
  let scoreCount = 0;

  for (let i = 0; i < dataRows.length; i += BATCH) {
    const batch = dataRows.slice(i, i + BATCH);

    const indValues = batch.map((r) => ({
      code: r[2] as string,
      name: r[3] as string,
      valueType: mapValueType(r[9] as string),
      visibility: "public" as const,
      subGroupId: subGroupMap.get(`${r[0]}|${r[1]}`)!,
    }));

    const inserted = await db.insert(schema.indicators).values(indValues).returning();
    indicatorCount += inserted.length;

    // goal scores for each indicator
    const scores = inserted.flatMap((ind, idx) => {
      const r = batch[idx];
      return goalRows.map((goal, gi) => ({
        indicatorId: ind.id,
        goalId: goal.id,
        score: scoreFromRelevance(r[4 + gi] as string),
      })).filter((s) => s.score > 0); // only store non-zero
    });

    if (scores.length > 0) {
      await db.insert(schema.indicatorGoalScores).values(scores);
      scoreCount += scores.length;
    }
  }
  console.log(`   ${indicatorCount} indicators, ${scoreCount} goal scores`);

  // ── Criteria + answers ────────────────────────────────────────────────────
  console.log("→ Criteria & Answers");

  const criteriaData = [
    {
      name: "Do we have the data for this indicator?",
      multiple: false,
      answers: ["Yes", "No", "Partially"],
    },
    {
      name: "Collecting and reporting this indicator is optional or compulsory in our country?",
      multiple: false,
      answers: ["Optional", "Compulsory", "Not sure"],
    },
    {
      name: "How frequently do we collect the data for this indicator?",
      multiple: false,
      answers: [
        "Once per year",
        "Once per semester/trimester/term",
        "Once a month",
        "Other",
      ],
    },
    {
      name: "Who is responsible for collecting the raw data for this indicator?",
      multiple: true,
      answers: [
        "Academic departments/units",
        "Research departments/units",
        "International Office",
        "Human Resources department",
        "Quality assurance/accreditation department/unit/team",
        "Information Technology department/unit",
        "Finance department/unit",
        "Institutional research or Strategic planning department/unit",
        "Library department",
        "Registrar's Office/unit",
        "Admissions Office/unit",
        "Communications department/unit",
        "Facilities or Campus Operations department/unit",
        "Other",
      ],
    },
    {
      name: "How is this indicator used in our unit?",
      multiple: true,
      answers: [
        "For educational or academic planning",
        "For accreditation",
        "For membership records",
        "For funding and budgeting",
        "For reporting to national or regional authorities",
        "For marketing and promotional activities",
        "For annual reports",
        "For benchmarking",
        "For planning service improvements",
        "For evaluating the performance of staff and/or teams",
        "Other",
      ],
    },
    {
      name: "Does our unit have procedures to make sure the data and this indicator is accurate?",
      multiple: false,
      answers: ["Yes", "No", "Not sure"],
    },
    {
      name: "In what format do we collect the data for this indicator?",
      multiple: true,
      answers: [
        "Paper records/files",
        "Word processing documents",
        "Excel database",
        "Own institution's data management software",
        "Commercial data management software",
        "Open source/free software (e.g. Google Docs)",
        "Other",
      ],
    },
    {
      name: "In what format is this indicator available to others outside our unit?",
      multiple: true,
      answers: [
        "Annual reports",
        "Our intranet / shared folders",
        "Our unit's website",
        "Our institution's website",
        "Commercial data management software",
        "Open source/free software (e.g. Google Docs, Google Sheets)",
        "Other",
      ],
    },
  ];

  for (const c of criteriaData) {
    const [crit] = await db.insert(schema.criteria).values({ name: c.name, multiple: c.multiple }).returning();
    await db.insert(schema.answers).values(
      c.answers.map((a, i) => ({ name: a, value: a.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 40), criteriaId: crit.id }))
    );
  }
  console.log(`   ${criteriaData.length} criteria, ${criteriaData.reduce((s, c) => s + c.answers.length, 0)} answers`);

  // ── Departments ───────────────────────────────────────────────────────────
  console.log("→ Departments");
  const deptData = [
    {
      name: "Faculty of Engineering",
      subs: ["Computer Engineering", "Electrical & Electronics Engineering", "Mechanical Engineering", "Industrial Engineering", "Chemical Engineering"],
    },
    {
      name: "Faculty of Science and Letters",
      subs: ["Physics", "Chemistry", "Mathematics", "Molecular Biology and Genetics", "Psychology"],
    },
    {
      name: "College of Administrative Sciences and Economics",
      subs: ["Business Administration", "Economics", "International Relations"],
    },
    {
      name: "School of Medicine",
      subs: ["Basic Medical Sciences", "Internal Medicine Sciences", "Surgical Medical Sciences"],
    },
    {
      name: "School of Law",
      subs: ["Public Law", "Private Law"],
    },
    {
      name: "International Office",
      subs: ["Student Mobility", "Staff Mobility", "Partnerships"],
    },
  ];

  for (const dept of deptData) {
    const [d] = await db.insert(schema.departments).values({ name: dept.name }).returning();
    if (dept.subs.length) {
      await db.insert(schema.subDepartments).values(dept.subs.map((s) => ({ name: s, departmentId: d.id })));
    }
  }
  console.log(`   ${deptData.length} departments, ${deptData.reduce((s, d) => s + d.subs.length, 0)} sub-departments`);

  // ── Admin user ────────────────────────────────────────────────────────────
  console.log("→ Admin user");
  const hash = await bcrypt.hash("admin123", 10);
  await db.insert(schema.users).values({
    name: "Admin User",
    email: "admin@heida.local",
    password: hash,
    role: 4,
  });
  console.log("   admin@heida.local / admin123");

  console.log("\n✅ Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
