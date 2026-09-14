import { describe, it, expect } from 'vitest';
import { MockGa4Client, createGa4Client } from '../src/google/client.js';
import { PlanStore } from '../src/tools/planStore.js';

describe('MockGa4Client', () => {
  const client = new MockGa4Client();

  it('returns catalog entries', async () => {
    const catalog = await client.getCatalog('000000001');
    expect(catalog.some((c) => c.type === 'metric')).toBe(true);
    expect(catalog.some((c) => c.type === 'dimension')).toBe(true);
  });

  it('runs a mock report respecting limit', async () => {
    const r = await client.runReport({
      propertyId: '1',
      startDate: '28daysAgo',
      endDate: 'yesterday',
      dimensions: ['date'],
      metrics: ['activeUsers'],
      limit: 1
    });
    expect(r.rowCount).toBe(1);
    expect(r.mock).toBe(true);
  });

  it('refuses to build a real client', () => {
    expect(() => createGa4Client(false)).toThrow(/not implemented/i);
  });
});

describe('PlanStore', () => {
  it('creates and confirms plans', () => {
    const store = new PlanStore();
    const plan = store.create([{ action: 'create', resource: 'customDimension', propertyId: '1' }]);
    expect(plan.status).toBe('pending');
    expect(store.confirm(plan.planId)?.status).toBe('confirmed');
    expect(store.get('missing')).toBeUndefined();
  });
});
