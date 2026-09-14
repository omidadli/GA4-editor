import request from 'supertest';
import type { Express } from 'express';

export const MCP_HEADERS = { Accept: 'application/json, text/event-stream' };

export function parseMcpResponse(text: string, contentType?: string): any {
  if (contentType?.includes('text/event-stream')) {
    const line = text.split('\n').find((l) => l.startsWith('data:'));
    return JSON.parse(line!.slice(5).trim());
  }
  return JSON.parse(text);
}

export async function initializeSession(app: Express) {
  const res = await request(app)
    .post('/mcp')
    .set(MCP_HEADERS)
    .send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    });
  const body = parseMcpResponse(res.text, res.headers['content-type']);
  const sessionId = res.headers['mcp-session-id'] as string;
  if (sessionId) {
    await request(app)
      .post('/mcp')
      .set({ ...MCP_HEADERS, 'mcp-session-id': sessionId })
      .send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  }
  return { res, body, sessionId };
}
