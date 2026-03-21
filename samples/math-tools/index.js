import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

function createServer() {
  const server = new McpServer({
    name: "math-tools",
    version: "1.0.0",
  });

  server.tool("add", "Add two numbers together", {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }, async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  }));

  server.tool("multiply", "Multiply two numbers", {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }, async ({ a, b }) => ({
    content: [{ type: "text", text: String(a * b) }],
  }));

  return server;
}

const app = express();
app.use(express.json());

const sessions = new Map();

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.all("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];

  if (req.method === "GET" || req.method === "DELETE") {
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }
    const session = sessions.get(sessionId);
    if (req.method === "DELETE") {
      await session.transport.handleRequest(req, res);
      sessions.delete(sessionId);
      return;
    }
    await session.transport.handleRequest(req, res);
    return;
  }

  if (req.method === "POST") {
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      await session.transport.handleRequest(req, res, req.body);
      return;
    }

    // New session — create a fresh server + transport
    const transport = new StreamableHTTPServerTransport({
      sessionId: crypto.randomUUID(),
    });
    const server = createServer();
    await server.connect(transport);

    sessions.set(transport.sessionId, { server, transport });
    transport.onclose = () => sessions.delete(transport.sessionId);
    await transport.handleRequest(req, res, req.body);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`math-tools MCP server on port ${port}`));
