# Remote GA4 MCP Server

A remote **Model Context Protocol** server for Google Analytics 4, exposed over
**Streamable HTTP** so it can be connected from Claude Web as a remote MCP connector.

> Status: phase 1 — scaffold + mock tools. **No real Google API calls yet.**
> Persian docs: [README.fa.md](./README.fa.md)

## Stack

- Node.js 22 + TypeScript (ESM)
- Express
- `@modelcontextprotocol/sdk` (StreamableHTTPServerTransport)
- Zod for input validation
- Target runtime: Render · Target persistence: Supabase Postgres (not wired yet)

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/healthz` | Liveness/readiness probe |
| POST | `/mcp` | MCP requests (initialize + JSON-RPC calls) |
| GET | `/mcp` | Server→client SSE stream for an existing session |
| DELETE | `/mcp` | Terminate an MCP session |

Session id travels in the `mcp-session-id` header.

## Tools (mock)

- `ga4_list_properties` — list accessible GA4 properties
- `ga4_admin_catalog` — available dimensions/metrics for a property
- `ga4_run_report` — run a Data API report
- `ga4_admin_plan` — build a dry-run plan of admin changes
- `ga4_admin_confirm` — confirm a plan (mock mode applies nothing)

All data comes from `MockGa4Client` in `src/google/client.ts`. That file is the seam
where the real GA4 Data/Admin API client will be plugged in.

## Scripts

```bash
npm install
npm run dev        # tsx watch
npm test           # vitest
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # emit dist/
npm start          # node dist/src/server.js
```

## Configuration

Copy `.env.example` to `.env`. `GA4_MOCK` defaults to `true`; setting it to `false`
currently throws, by design, until the real client lands.
No secrets are stored in the repo; `.env*` (except the example) is git-ignored.

## Docker

```bash
docker build -t remote-ga4-mcp .
docker run -p 3000:3000 remote-ga4-mcp
```

## Layout

```
src/
  app.ts            Express app + MCP HTTP transport wiring
  server.ts         process entrypoint
  config.ts         env config
  mcp.ts            McpServer factory
  google/client.ts  GA4 client interface + mock implementation
  tools/            tool registration + in-memory plan store
tests/              vitest unit tests
```

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) and [MANUAL_STEPS.md](./MANUAL_STEPS.md).
