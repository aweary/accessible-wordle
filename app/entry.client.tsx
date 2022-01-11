import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";
import * as Sentry from '@sentry/react'
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://0a3a1c01a0eb419480ab77b4653d05eb@o510894.ingest.sentry.io/6144199",
  integrations: [new Integrations.BrowserTracing()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});


hydrate(<RemixBrowser />, document);
