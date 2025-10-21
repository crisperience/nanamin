import * as Sentry from "@sentry/nextjs";

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("./sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        await import("./sentry.edge.config");
    }
}

// Use Sentry's built-in captureRequestError for Next.js 15+
// This properly handles nested React Server Component errors
export const onRequestError = Sentry.captureRequestError;
