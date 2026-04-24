import { NextApiRequest, NextApiResponse } from "next";
import { transports } from "@/lib/mcp";

// We need to disable Next.js default body parser for this route
// because SSEServerTransport expects to parse the raw body itself
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).send("Missing sessionId");
    return;
  }

  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).send("Session not found or disconnected");
    return;
  }

  // The SDK handles reading the body and sending the response
  await transport.handlePostMessage(req, res);
}
