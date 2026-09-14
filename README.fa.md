# سرور MCP ریموت برای Google Analytics 4

یک سرور **Model Context Protocol** ریموت برای Google Analytics 4 که روی
**Streamable HTTP** اجرا می‌شود تا بتوان آن را به‌عنوان connector ریموت در Claude Web وصل کرد.

> وضعیت: فاز ۱ — اسکلت پروژه و ابزارهای mock. **هیچ فراخوانی واقعی به Google انجام نمی‌شود.**

## پشتهٔ فناوری

- Node.js 22 و TypeScript (ESM)
- Express
- `@modelcontextprotocol/sdk` با `StreamableHTTPServerTransport`
- Zod برای اعتبارسنجی ورودی‌ها
- اجرا روی Render · ذخیره‌سازی روی Supabase Postgres (هنوز متصل نشده)

## Endpointها

| متد | مسیر | توضیح |
| --- | --- | --- |
| GET | `/healthz` | بررسی سلامت سرویس |
| POST | `/mcp` | درخواست‌های MCP (شامل initialize) |
| GET | `/mcp` | استریم SSE از سرور به کلاینت برای session موجود |
| DELETE | `/mcp` | پایان دادن به session |

شناسهٔ session در هدر `mcp-session-id` منتقل می‌شود.

## ابزارها (فعلاً mock)

- `ga4_list_properties` — فهرست propertyهای GA4
- `ga4_admin_catalog` — فهرست dimension و metricهای یک property
- `ga4_run_report` — اجرای گزارش Data API
- `ga4_admin_plan` — ساخت پلن dry-run برای تغییرات ادمین
- `ga4_admin_confirm` — تأیید پلن (در حالت mock هیچ تغییری اعمال نمی‌شود)

همهٔ داده‌ها از `MockGa4Client` در `src/google/client.ts` می‌آید. همین فایل نقطهٔ اتصال
کلاینت واقعی GA4 در مراحل بعدی است.

## دستورها

```bash
npm install
npm run dev        # اجرای حالت توسعه
npm test           # تست‌ها
npm run lint       # بررسی lint
npm run typecheck  # بررسی تایپ‌ها
npm run build      # ساخت خروجی dist
npm start          # اجرای نسخهٔ build شده
```

## پیکربندی

فایل `.env.example` را به `.env` کپی کنید. مقدار پیش‌فرض `GA4_MOCK` برابر `true` است؛
اگر آن را `false` کنید، عمداً خطا می‌دهد تا زمانی که کلاینت واقعی اضافه شود.
هیچ secretای در مخزن ذخیره نشده و همهٔ فایل‌های `.env*` (به‌جز نمونه) در `.gitignore` هستند.

## Docker

```bash
docker build -t remote-ga4-mcp .
docker run -p 3000:3000 remote-ga4-mcp
```

برای جزئیات بیشتر: [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) و [MANUAL_STEPS.md](./MANUAL_STEPS.md)
