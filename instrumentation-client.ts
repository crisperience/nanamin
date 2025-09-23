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

    // Configure replay rates for production
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
      // Only enable replay in production to avoid multiple instances in development
      ...(process.env.NODE_ENV === 'production' ? [
        Sentry.replayIntegration({
          // Additional Replay configuration goes in here, for example:
          maskAllText: true,
          blockAllMedia: true,
        })
      ] : []),
      // Send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],

    _experiments: {
      enableLogs: true,
    },
  });

  // Mark as initialized
  if (typeof window !== 'undefined') {
    window.__SENTRY_INITIALIZED__ = true;
  }
}

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
