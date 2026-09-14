import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from './tools/index.js';
import type { Ga4Client } from './google/client.js';

export function createMcpServer(ga4: Ga4Client): McpServer {
  const server = new McpServer(
    { name: 'remote-ga4-mcp', version: '0.1.0' },
    { capabilities: { tools: {}, logging: {} } }
  );
  registerTools(server, ga4);
  return server;
}
