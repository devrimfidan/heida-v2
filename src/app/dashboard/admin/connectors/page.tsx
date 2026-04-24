import { headers } from "next/headers";
import { Plug, Terminal, Sparkles, AlertCircle, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ConnectorsPage() {
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const mcpEndpoint = `${protocol}://${host}/api/mcp/sse`;

  const claudeConfig = {
    mcpServers: {
      "heida-analytics": {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-sse", mcpEndpoint],
        env: {},
      },
    },
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plug className="w-6 h-6 text-primary" />
            AI Connectors (MCP)
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Model Context Protocol (MCP) allows AI assistants like Claude, Cursor, and ChatGPT to securely connect directly to your HEIDA database. This enables you to chat naturally with your strategic data.
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          Beta Feature
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Endpoints & Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Connection Endpoint
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm">
                This is your unique Server-Sent Events (SSE) endpoint. AI clients will use this to stream real-time data from your dashboard.
              </p>
              <div className="p-3 bg-muted rounded-md font-mono text-sm border border-border text-foreground flex items-center justify-between">
                <span>{mcpEndpoint}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Claude Desktop & Cursor Configuration
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm">
                To connect Claude Desktop or Cursor, copy the JSON configuration below and paste it into your client's MCP settings file.
              </p>
              <pre className="p-4 bg-muted rounded-md font-mono text-sm border border-border text-foreground overflow-x-auto">
                <code>{JSON.stringify(claudeConfig, null, 2)}</code>
              </pre>
              <div className="flex items-start gap-2 mt-4 p-3 bg-amber-500/10 text-amber-700 dark:text-amber-500 rounded-md border border-amber-500/20 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>Note:</strong> Ensure you have Node.js and <code>npx</code> installed on the machine running the AI client, as it uses the official SSE adapter to bridge the connection.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              Available AI Tools
            </h3>
            <p className="text-sm text-muted-foreground">
              Once connected, the AI will automatically have access to the following live tools:
            </p>
            <ul className="space-y-3 mt-4">
              <li className="text-sm bg-background border border-border rounded-md p-3">
                <strong className="block text-foreground mb-1">list_strategic_goals</strong>
                <span className="text-muted-foreground text-xs">Pulls the list of institutional goals.</span>
              </li>
              <li className="text-sm bg-background border border-border rounded-md p-3">
                <strong className="block text-foreground mb-1">search_indicators</strong>
                <span className="text-muted-foreground text-xs">Finds performance indicators by code.</span>
              </li>
              <li className="text-sm bg-background border border-border rounded-md p-3">
                <strong className="block text-foreground mb-1">get_historical_data</strong>
                <span className="text-muted-foreground text-xs">Retrieves 5-year data entries for analysis.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-sm">ChatGPT Integration</h3>
            <p className="text-sm text-muted-foreground">
              Native MCP support for ChatGPT is still rolling out. Currently, to connect ChatGPT, your HEIDA dashboard must be deployed to a public HTTPS domain. Once deployed, you can create a "Custom GPT" using an OpenAPI schema that points to your endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
