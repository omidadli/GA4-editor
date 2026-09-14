# Manual Steps (to be done by a human, later)

None of the steps below were performed by the agent. **Do not paste secrets into chat.**

## 1. Google Cloud / OAuth

1. Create (or pick) a Google Cloud project.
2. Enable **Google Analytics Data API** and **Google Analytics Admin API**.
3. Configure the OAuth consent screen (External), add the scopes:
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `https://www.googleapis.com/auth/analytics.edit` (only if admin writes are needed)
4. Create an **OAuth client ID → Web application**, with redirect URI:
   `https://<your-render-service>.onrender.com/oauth/callback`
5. Keep the client id/secret in your password manager only.

## 2. Supabase

1. Create a Supabase project; copy the **connection pooler** Postgres URL.
2. Tables to create when persistence lands: `oauth_tokens`, `mcp_sessions`, `admin_plans`.
3. Keep `DATABASE_URL` out of the repo.

## 3. Encryption key

Generate a 32-byte key locally, e.g. `openssl rand -base64 32`, and store it as
`ENCRYPTION_KEY`. Never commit it or share it in chat.

## 4. Render deployment

1. New → **Web Service**, connect this GitHub repo, pick this branch.
2. Runtime: Docker (repo Dockerfile) — or Node with
   Build `npm ci && npm run build`, Start `npm start`.
3. Health check path: `/healthz`.
4. Environment variables (dashboard only): `NODE_ENV=production`, `GA4_MOCK=true`
   for now, plus `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_OAUTH_REDIRECT_URI`, `DATABASE_URL`, `ENCRYPTION_KEY` once implemented.

## 5. Claude Web connector

Settings → Connectors → Add custom connector → URL
`https://<your-render-service>.onrender.com/mcp`. Verify `initialize` succeeds and
the five `ga4_*` tools appear.

## 6. Before going live

- Add authentication to `/mcp` (OAuth or bearer) — the endpoint is currently unauthenticated.
- Enable a secret scanner (GitHub secret scanning / gitleaks) on the repo.
- Set `GA4_MOCK=false` only after the real client is implemented.

## 7. Local run

```bash
cp .env.example .env
npm install
npm run dev
curl http://localhost:3000/healthz
```
