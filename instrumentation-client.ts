import * as Sentry from "@sentry/nextjs";

// Extend Window interface for Sentry initialization flag
declare global {
  interface Window {
    __SENTRY_INITIALIZED__?: boolean;
  }
}

// Prevent multiple initialization in development
if (typeof window !== 'undefined' && !window.__SENTRY_INITIALIZED__) {
  Sentry.init({
    dsn: "https://4e4b08bcc3654e4d415a95c407f2943c@o4509586652200960.ingest.de.sentry.io/4510068826439760",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

    // Only enable debug in development
    debug: process.env.NODE_ENV === 'development',

    // Environment configuration
    environment: process.env.NODE_ENV || 'development',

    // Enable logs to be sent to Sentry (moved from _experiments)
    enableLogs: true,

    // Configure replay rates
    // Enable limited replay in development for debugging (10% of sessions)
    replaysOnErrorSampleRate: 1.0, // Always capture replay on error
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
      // Enable replay in both development and production
      Sentry.replayIntegration({
        // Additional Replay configuration goes in here, for example:
        maskAllText: true,
        blockAllMedia: true,
      }),
      // Send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],
  });

  // Mark as initialized
  if (typeof window !== 'undefined') {
    window.__SENTRY_INITIALIZED__ = true;
  }
}

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
