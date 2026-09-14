/**
 * GA4 client abstraction.
 *
 * No real network call to Google is made in this phase. The interface below is
 * the seam where a real Data API / Admin API client will be plugged in later.
 */

export interface Ga4Property {
  propertyId: string;
  displayName: string;
  account: string;
  timeZone: string;
  currencyCode: string;
}

export interface Ga4CatalogEntry {
  apiName: string;
  uiName: string;
  category: string;
  type: 'dimension' | 'metric';
}

export interface Ga4ReportRequest {
  propertyId: string;
  startDate: string;
  endDate: string;
  dimensions: string[];
  metrics: string[];
  limit: number;
}

export interface Ga4ReportResult {
  propertyId: string;
  dimensionHeaders: string[];
  metricHeaders: string[];
  rows: Array<{ dimensionValues: string[]; metricValues: string[] }>;
  rowCount: number;
  mock: boolean;
}

export interface Ga4Client {
  readonly mock: boolean;
  listProperties(accountId?: string): Promise<Ga4Property[]>;
  getCatalog(propertyId: string): Promise<Ga4CatalogEntry[]>;
  runReport(req: Ga4ReportRequest): Promise<Ga4ReportResult>;
}

export class MockGa4Client implements Ga4Client {
  readonly mock = true;

  async listProperties(accountId?: string): Promise<Ga4Property[]> {
    const props: Ga4Property[] = [
      {
        propertyId: '000000001',
        displayName: 'Demo Web Property',
        account: 'accounts/111111',
        timeZone: 'UTC',
        currencyCode: 'USD'
      },
      {
        propertyId: '000000002',
        displayName: 'Demo App Property',
        account: 'accounts/222222',
        timeZone: 'Asia/Tehran',
        currencyCode: 'EUR'
      }
    ];
    return accountId ? props.filter((p) => p.account.endsWith(accountId)) : props;
  }

  async getCatalog(_propertyId: string): Promise<Ga4CatalogEntry[]> {
    return [
      { apiName: 'date', uiName: 'Date', category: 'Time', type: 'dimension' },
      { apiName: 'country', uiName: 'Country', category: 'Geography', type: 'dimension' },
      { apiName: 'sessionSource', uiName: 'Session source', category: 'Traffic', type: 'dimension' },
      { apiName: 'activeUsers', uiName: 'Active users', category: 'User', type: 'metric' },
      { apiName: 'sessions', uiName: 'Sessions', category: 'Session', type: 'metric' },
      { apiName: 'screenPageViews', uiName: 'Views', category: 'Page', type: 'metric' }
    ];
  }

  async runReport(req: Ga4ReportRequest): Promise<Ga4ReportResult> {
    const rows = Array.from({ length: Math.min(req.limit, 3) }, (_, i) => ({
      dimensionValues: req.dimensions.map((d) => `${d}-value-${i + 1}`),
      metricValues: req.metrics.map((_m, j) => String((i + 1) * 100 + j))
    }));
    return {
      propertyId: req.propertyId,
      dimensionHeaders: req.dimensions,
      metricHeaders: req.metrics,
      rows,
      rowCount: rows.length,
      mock: true
    };
  }
}

export function createGa4Client(mock = true): Ga4Client {
  if (!mock) {
    throw new Error('Real Google GA4 client is not implemented yet. Set GA4_MOCK=true.');
  }
  return new MockGa4Client();
}
