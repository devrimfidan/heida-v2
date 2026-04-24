import { NextApiRequest, NextApiResponse } from "next";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { mcpServer, transports } from "@/lib/mcp";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET! });
  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }

  const sessionId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(7);

  const transport = new SSEServerTransport(
    `/api/mcp/messages?sessionId=${sessionId}`,
    res
  );

  transports.set(sessionId, transport);

  req.on("close", () => {
    transports.delete(sessionId);
  });

  await mcpServer.connect(transport);
}
