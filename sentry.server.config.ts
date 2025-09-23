import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://4e4b08bcc3654e4d415a95c407f2943c@o4509586652200960.ingest.de.sentry.io/4510068826439760",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    integrations: [
        // Send console.log, console.warn, and console.error calls as logs to Sentry
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],

    _experiments: {
        enableLogs: true,
    },
});
