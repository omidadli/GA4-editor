import express, { type Express, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createMcpServer } from './mcp.js';
import { createGa4Client, type Ga4Client } from './google/client.js';
import { loadConfig } from './config.js';

export interface CreateAppOptions {
  ga4?: Ga4Client;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const config = loadConfig();
  const ga4 = options.ga4 ?? createGa4Client(config.ga4Mock);

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.get('/healthz', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'remote-ga4-mcp',
      version: '0.1.0',
      mock: ga4.mock,
      sessions: transports.size,
      uptime: process.uptime()
    });
  });

  const jsonRpcError = (res: Response, status: number, code: number, message: string) =>
    res.status(status).json({ jsonrpc: '2.0', error: { code, message }, id: null });

  app.post('/mcp', async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport = sessionId ? transports.get(sessionId) : undefined;

      if (!transport) {
        if (sessionId) {
          return jsonRpcError(res, 404, -32001, 'Session not found');
        }
        if (!isInitializeRequest(req.body)) {
          return jsonRpcError(res, 400, -32000, 'Bad Request: no valid session ID provided');
        }
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id: string) => {
            transports.set(id, transport!);
          }
        });
        transport.onclose = () => {
          if (transport?.sessionId) transports.delete(transport.sessionId);
        };
        await createMcpServer(ga4).connect(transport);
      }

      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      if (!res.headersSent) {
        jsonRpcError(res, 500, -32603, `Internal server error: ${(err as Error).message}`);
      }
    }
  });

  const sessionRequest = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    const transport = sessionId ? transports.get(sessionId) : undefined;
    if (!transport) {
      return jsonRpcError(res, 400, -32000, 'Bad Request: invalid or missing session ID');
    }
    await transport.handleRequest(req, res);
  };

  app.get('/mcp', sessionRequest);
  app.delete('/mcp', sessionRequest);

  return app;
}
