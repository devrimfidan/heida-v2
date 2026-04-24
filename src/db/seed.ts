import { db } from "./index";
import { 
  departments, 
  goals, 
  indicators, 
  indicatorGoalScores, 
  dataEntries, 
  dataEntryYears 
} from "./schema";

async function main() {
  console.log("Seeding data...");

  // 1. Fetch existing data
  const allDepts = await db.select().from(departments);
  const allGoals = await db.select().from(goals);
  const allIndicators = await db.select().from(indicators);

  if (allDepts.length === 0 || allGoals.length === 0 || allIndicators.length === 0) {
    console.log("Please ensure you have created at least one Department, Goal, and Indicator before running this seed script.");
    process.exit(1);
  }

  // 2. Link Indicators to Goals (if not already linked)
  console.log("Linking indicators to goals...");
  for (const indicator of allIndicators) {
    // Randomly assign 1 to 3 goals to each indicator
    const shuffledGoals = [...allGoals].sort(() => 0.5 - Math.random());
    const goalsToAssign = shuffledGoals.slice(0, Math.floor(Math.random() * 3) + 1);
    
    for (const goal of goalsToAssign) {
      await db.insert(indicatorGoalScores).values({
        indicatorId: indicator.id,
        goalId: goal.id,
        score: Math.floor(Math.random() * 5) + 1, // Score 1-5
      }).onConflictDoNothing();
    }
  }

  // 3. Create 10 dummy Data Entries per Department
  console.log("Creating dummy data entries...");
  for (const dept of allDepts) {
    for (let i = 0; i < 10; i++) {
      const randomIndicator = allIndicators[Math.floor(Math.random() * allIndicators.length)];
      
      const [entry] = await db.insert(dataEntries).values({
        departmentId: dept.id,
        indicatorId: randomIndicator.id,
        periodType: Math.random() > 0.5 ? "calendar" : "academic",
        visibility: "public",
        departmentDesc: `Seed Entry ${i + 1} for ${dept.name}`,
      }).returning();

      // Add historical data for the past 5 years (2022 to 2026)
      for (let year = 2022; year <= 2026; year++) {
        // Create a realistic trend (mostly increasing)
        const baseValue = Math.floor(Math.random() * 50) + 10;
        const trend = (year - 2022) * (Math.floor(Math.random() * 10) + 2); // Upward trend
        const randomNoise = Math.floor(Math.random() * 15) - 5;
        
        await db.insert(dataEntryYears).values({
          dataEntryId: entry.id,
          year: year.toString(),
          value: Math.max(0, baseValue + trend + randomNoise).toString(),
        });
      }
    }
  }

  console.log("Seed completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
