import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://4e4b08bcc3654e4d415a95c407f2943c@o4509586652200960.ingest.de.sentry.io/4510068826439760",

    // Environment configuration
    environment: process.env.NODE_ENV || 'development',

    // Adjust trace sample rate based on environment
    // Lower in production to reduce costs and performance impact
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Enable logs to be sent to Sentry (moved from _experiments)
    enableLogs: true,

    integrations: [
        // Send console.log, console.warn, and console.error calls as logs to Sentry
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],
});
