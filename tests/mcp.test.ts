import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { MockGa4Client } from '../src/google/client.js';
import { initializeSession, parseMcpResponse, MCP_HEADERS } from './helpers.js';

const app = createApp({ ga4: new MockGa4Client() });

describe('MCP initialize', () => {
  it('initializes a session and returns server info', async () => {
    const { res, body, sessionId } = await initializeSession(app);
    expect(res.status).toBe(200);
    expect(sessionId).toBeTruthy();
    expect(body.result.serverInfo.name).toBe('remote-ga4-mcp');
    expect(body.result.capabilities.tools).toBeDefined();
  });

  it('rejects non-initialize POST without session id', async () => {
    const res = await request(app)
      .post('/mcp')
      .set(MCP_HEADERS)
      .send({ jsonrpc: '2.0', id: 9, method: 'tools/list' });
    expect(res.status).toBe(400);
  });

  it('rejects GET /mcp without a session id', async () => {
    const res = await request(app).get('/mcp').set(MCP_HEADERS);
    expect(res.status).toBe(400);
  });

  it('rejects DELETE /mcp without a session id', async () => {
    const res = await request(app).delete('/mcp').set(MCP_HEADERS);
    expect(res.status).toBe(400);
  });
});

describe('MCP tools', () => {
  it('lists the five GA4 tools', async () => {
    const { sessionId } = await initializeSession(app);
    const res = await request(app)
      .post('/mcp')
      .set({ ...MCP_HEADERS, 'mcp-session-id': sessionId })
      .send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const body = parseMcpResponse(res.text, res.headers['content-type']);
    const names = body.result.tools.map((t: any) => t.name).sort();
    expect(names).toEqual([
      'ga4_admin_catalog',
      'ga4_admin_confirm',
      'ga4_admin_plan',
      'ga4_list_properties',
      'ga4_run_report'
    ]);
  });

  it('calls ga4_list_properties and returns mock data', async () => {
    const { sessionId } = await initializeSession(app);
    const res = await request(app)
      .post('/mcp')
      .set({ ...MCP_HEADERS, 'mcp-session-id': sessionId })
      .send({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'ga4_list_properties', arguments: {} }
      });
    const body = parseMcpResponse(res.text, res.headers['content-type']);
    const payload = JSON.parse(body.result.content[0].text);
    expect(payload.mock).toBe(true);
    expect(payload.properties.length).toBeGreaterThan(0);
  });
});
