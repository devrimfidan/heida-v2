import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { db } from "@/db";
import { goals, indicators, dataEntries, dataEntryYears, departments } from "@/db/schema";
import { eq, like, or } from "drizzle-orm";

const globalForMcp = globalThis as unknown as {
  mcpServer: McpServer | undefined;
  mcpTransports: Map<string, SSEServerTransport> | undefined;
};

export const mcpServer = globalForMcp.mcpServer ?? new McpServer({
  name: "heida-analytics",
  version: "1.0.0",
});

export const transports = globalForMcp.mcpTransports ?? new Map<string, SSEServerTransport>();

if (process.env.NODE_ENV !== "production") {
  globalForMcp.mcpServer = mcpServer;
  globalForMcp.mcpTransports = transports;
}

// Register actual HEIDA tools
if (!globalForMcp.mcpServer) {
  // 1. List Strategic Goals
  mcpServer.tool(
    "list_strategic_goals",
    "Get all the strategic internationalization goals of the institution",
    {},
    async () => {
      const allGoals = await db.select().from(goals);
      return {
        content: [{ type: "text", text: JSON.stringify(allGoals, null, 2) }],
      };
    }
  );

  // 2. Search Indicators
  mcpServer.tool(
    "search_indicators",
    "Search for performance indicators by name or code to find their ID for data retrieval",
    { query: z.string().max(200).optional().describe("Optional search term for indicator name or code") },
    async ({ query }) => {
      const base = db.select().from(indicators);
      const results = await (
        query
          ? base.where(or(like(indicators.name, `%${query}%`), like(indicators.code, `%${query}%`)))
          : base
      ).limit(20);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // 3. Get Historical Data
  mcpServer.tool(
    "get_historical_data",
    "Retrieve historical data entries and year-values for a specific indicator",
    { indicatorId: z.string().describe("The UUID of the indicator to pull data for") },
    async ({ indicatorId }) => {
      const entries = await db.select().from(dataEntries).where(eq(dataEntries.indicatorId, indicatorId));
      if (entries.length === 0) return { content: [{ type: "text", text: "[]" }] };

      const entryIds = entries.map((e) => e.id);
      const allYears = await db
        .select()
        .from(dataEntryYears)
        .where(sql`${dataEntryYears.dataEntryId} IN ${entryIds}`); // drizzle-orm inArray might be better but sql works

      // Get unique department IDs
      const deptIds = Array.from(new Set(entries.map((e) => e.departmentId).filter((id): id is string => !!id)));
      
      let deptMap = new Map<string, string>();
      if (deptIds.length > 0) {
        const depts = await db
          .select({ id: departments.id, name: departments.name })
          .from(departments)
          .where(sql`${departments.id} IN ${deptIds}`);
        deptMap = new Map(depts.map((d) => [d.id, d.name]));
      }

      const yearsByEntry = allYears.reduce((acc, y) => {
        if (!acc[y.dataEntryId]) acc[y.dataEntryId] = [];
        acc[y.dataEntryId].push({ year: y.year, value: y.value });
        return acc;
      }, {} as Record<string, { year: string; value: string }[]>);

      const allData = entries.map((entry) => ({
        department: (entry.departmentId ? deptMap.get(entry.departmentId) : entry.departmentDesc) || "Unknown Unit",
        periodType: entry.periodType,
        visibility: entry.visibility,
        data: yearsByEntry[entry.id] || [],
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(allData, null, 2) }],
      };
    }
  );
}
