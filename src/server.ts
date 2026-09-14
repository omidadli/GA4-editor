import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`remote-ga4-mcp listening on :${config.port} (mock=${config.ga4Mock})`);
});
