import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Ga4Client } from '../google/client.js';
import { PlanStore } from './planStore.js';

const json = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }]
});

export const adminChangeSchema = z.object({
  action: z.enum(['create', 'update', 'archive']),
  resource: z.string().min(1),
  propertyId: z.string().min(1),
  payload: z.record(z.unknown()).optional()
});

export function registerTools(server: McpServer, ga4: Ga4Client, plans = new PlanStore()): void {
  server.registerTool(
    'ga4_list_properties',
    {
      title: 'List GA4 properties',
      description: 'List GA4 properties accessible to the connected account (mock data for now).',
      inputSchema: { accountId: z.string().optional() }
    },
    async ({ accountId }) => json({ mock: ga4.mock, properties: await ga4.listProperties(accountId) })
  );

  server.registerTool(
    'ga4_admin_catalog',
    {
      title: 'GA4 dimension/metric catalog',
      description: 'Return available dimensions and metrics for a property (mock data for now).',
      inputSchema: { propertyId: z.string().min(1) }
    },
    async ({ propertyId }) =>
      json({ mock: ga4.mock, propertyId, catalog: await ga4.getCatalog(propertyId) })
  );

  server.registerTool(
    'ga4_run_report',
    {
      title: 'Run GA4 report',
      description: 'Run a GA4 Data API report (mock data for now).',
      inputSchema: {
        propertyId: z.string().min(1),
        startDate: z.string().default('28daysAgo'),
        endDate: z.string().default('yesterday'),
        dimensions: z.array(z.string()).default(['date']),
        metrics: z.array(z.string()).min(1).default(['activeUsers']),
        limit: z.number().int().min(1).max(1000).default(10)
      }
    },
    async (args) => json(await ga4.runReport(args))
  );

  server.registerTool(
    'ga4_admin_plan',
    {
      title: 'Plan GA4 admin changes',
      description: 'Create a dry-run plan of GA4 Admin API changes. Nothing is applied.',
      inputSchema: { changes: z.array(adminChangeSchema).min(1) }
    },
    async ({ changes }) => {
      const plan = plans.create(changes);
      return json({ mock: ga4.mock, dryRun: true, plan });
    }
  );

  server.registerTool(
    'ga4_admin_confirm',
    {
      title: 'Confirm GA4 admin plan',
      description: 'Confirm a previously created plan. In mock mode nothing is applied to Google.',
      inputSchema: { planId: z.string().min(1), confirm: z.boolean().default(false) }
    },
    async ({ planId, confirm }) => {
      const existing = plans.get(planId);
      if (!existing) {
        return { isError: true, content: [{ type: 'text' as const, text: `Unknown planId: ${planId}` }] };
      }
      if (!confirm) {
        return json({ applied: false, reason: 'confirm=false', plan: existing });
      }
      const plan = plans.confirm(planId)!;
      return json({ mock: ga4.mock, applied: false, note: 'Mock mode: no Google API call performed.', plan });
    }
  );
}
