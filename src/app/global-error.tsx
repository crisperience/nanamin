'use client'

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to Sentry
        Sentry.captureException(error)
    }, [error])

    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    fontFamily: 'system-ui, sans-serif',
                    background: '#1e1e2e',
                    color: 'white'
                }}>
                    <h2 style={{ marginBottom: '20px', color: '#ef4444' }}>Something went wrong!</h2>
                    <p style={{ marginBottom: '20px', textAlign: 'center', color: '#9ca3af' }}>
                        An unexpected error occurred. The error has been reported and we&apos;ll look into it.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
