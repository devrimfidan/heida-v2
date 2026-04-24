import { NextApiRequest, NextApiResponse } from "next";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { mcpServer, transports } from "@/lib/mcp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  console.log("[MCP] New SSE Connection Request");
  
  // Using native Node crypto or web crypto
  const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(7);
  
  const transport = new SSEServerTransport(
    `/api/mcp/messages?sessionId=${sessionId}`, 
    res
  );
  
  transports.set(sessionId, transport);

  req.on("close", () => {
    console.log(`[MCP] SSE Connection closed for session ${sessionId}`);
    transports.delete(sessionId);
  });

  await mcpServer.connect(transport);
}
