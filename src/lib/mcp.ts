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
      
      // Fetch years for all these entries
      const allData = await Promise.all(entries.map(async (entry) => {
        const years = await db.select().from(dataEntryYears).where(eq(dataEntryYears.dataEntryId, entry.id));
        
        let deptName = entry.departmentDesc || "Unknown Unit";
        if (entry.departmentId) {
          const [d] = await db.select({ name: departments.name }).from(departments).where(eq(departments.id, entry.departmentId));
          if (d) deptName = d.name;
        }

        return {
          department: deptName,
          periodType: entry.periodType,
          visibility: entry.visibility,
          data: years.map(y => ({ year: y.year, value: y.value }))
        };
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(allData, null, 2) }],
      };
    }
  );
}
