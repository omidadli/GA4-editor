export interface AppConfig {
  port: number;
  nodeEnv: string;
  ga4Mock: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.PORT ?? 3000),
    nodeEnv: env.NODE_ENV ?? 'development',
    // Real Google calls are not implemented yet; mock is the default.
    ga4Mock: env.GA4_MOCK !== 'false'
  };
}
