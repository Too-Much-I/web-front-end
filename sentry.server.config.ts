// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import {
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "./src/lib/sentry-privacy";

Sentry.init({
  dsn: "https://fb11fca3da462c6407d338123ad1d0a1@o4511885627228160.ingest.us.sentry.io/4511889724604416",
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
  beforeBreadcrumb: scrubSentryBreadcrumb,
});
