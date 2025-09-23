import * as Sentry from "@sentry/nextjs";

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("./sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        await import("./sentry.edge.config");
    }
}

export async function onRequestError(
    err: unknown,
    request: {
        path: string;
    },
    context: {
        routerKind: string;
        routePath: string;
        routeType: string;
    }
) {
    // Capture the error with additional context
    Sentry.captureException(err, {
        tags: {
            section: 'request_error',
            routerKind: context.routerKind,
            routeType: context.routeType,
        },
        extra: {
            requestPath: request.path,
            routePath: context.routePath,
            context,
        },
    });
}
