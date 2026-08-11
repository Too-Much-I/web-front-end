import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

const FILTERED = "[Filtered]";
const SENSITIVE_KEY_PATTERN =
  /^(exam_?id|authorization|cookie|set-cookie|access_?token|refresh_?token|audio_?url)$/i;

export function redactIdentifiersInText(value: string): string {
  return value
    .replace(/((?:[?&]|\b)examId=)[^&#\s]*/gi, `$1${FILTERED}`)
    .replace(/(\/api\/v1\/exams\/)[^/?#\s]+/gi, `$1${FILTERED}`)
    .replace(/("examId"\s*:\s*")[^"]*(")/gi, `$1${FILTERED}$2`)
    .replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi, `$1${FILTERED}`);
}

function scrubValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === "string") return redactIdentifiersInText(value);
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return FILTERED;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key)
        ? FILTERED
        : scrubValue(nestedValue, seen),
    ]),
  );
}

export function scrubSentryBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  return {
    ...breadcrumb,
    message:
      typeof breadcrumb.message === "string"
        ? redactIdentifiersInText(breadcrumb.message)
        : breadcrumb.message,
    data: breadcrumb.data
      ? (scrubValue(breadcrumb.data) as Record<string, unknown>)
      : breadcrumb.data,
  };
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent | null {
  const request = event.request
    ? {
        ...event.request,
        url:
          typeof event.request.url === "string"
            ? redactIdentifiersInText(event.request.url)
            : event.request.url,
        headers: undefined,
        cookies: undefined,
        data: undefined,
      }
    : undefined;

  return {
    ...event,
    message:
      typeof event.message === "string"
        ? redactIdentifiersInText(event.message)
        : event.message,
    transaction:
      typeof event.transaction === "string"
        ? redactIdentifiersInText(event.transaction)
        : event.transaction,
    fingerprint: event.fingerprint?.map((value) =>
      redactIdentifiersInText(value),
    ),
    tags: event.tags
      ? (scrubValue(event.tags) as ErrorEvent["tags"])
      : event.tags,
    request,
    user: undefined,
    breadcrumbs: event.breadcrumbs?.map((breadcrumb) =>
      scrubSentryBreadcrumb(breadcrumb),
    ) as Breadcrumb[] | undefined,
    contexts: event.contexts
      ? (scrubValue(event.contexts) as ErrorEvent["contexts"])
      : event.contexts,
    extra: event.extra
      ? (scrubValue(event.extra) as Record<string, unknown>)
      : event.extra,
    exception: event.exception
      ? (scrubValue(event.exception) as ErrorEvent["exception"])
      : event.exception,
  };
}
