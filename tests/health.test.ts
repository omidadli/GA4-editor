import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { MockGa4Client } from '../src/google/client.js';

describe('GET /healthz', () => {
  const app = createApp({ ga4: new MockGa4Client() });

  it('returns ok status', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('remote-ga4-mcp');
    expect(res.body.mock).toBe(true);
  });
});
