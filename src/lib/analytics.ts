import { track } from '@vercel/analytics';

// Analytics event types for better type safety
export type AnalyticsEvent =
    | 'file_dropped'
    | 'file_upload_started'
    | 'compression_started'
    | 'compression_completed'
    | 'compression_failed'
    | 'compression_cancelled'
    | 'quality_changed'
    | 'files_downloaded'
    | 'files_cleared'
    | 'compression_reset'
    | 'support_clicked'
    | 'github_clicked'
    | 'contact_clicked'
    | 'coffee_clicked'
    | 'page_loaded'
    | 'session_ended';

// Analytics properties interface
interface AnalyticsProperties {
    // File-related properties
    fileCount?: number;
    fileTypes?: string; // Changed from string[] to string (comma-separated)
    totalSize?: number;
    averageFileSize?: number;

    // Compression-related properties
    quality?: number;
    originalSize?: number;
    compressedSize?: number;
    compressionRatio?: number;
    savingsPercentage?: number;
    processingTime?: number;

    // Error-related properties
    errorType?: string;
    errorMessage?: string;

    // User behavior properties
    sessionDuration?: number;
    userAgent?: string;
    screenResolution?: string;

    // Custom properties
    [key: string]: string | number | boolean | undefined;
}

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
    return filename.toLowerCase().split('.').pop() || 'unknown';
};

// Helper function to format file size for analytics
const formatSizeForAnalytics = (bytes: number): number => {
    return Math.round(bytes / (1024 * 1024)); // Convert to MB
};

// Helper function to get user agent info
const getUserAgent = (): string => {
    if (typeof window !== 'undefined') {
        return window.navigator.userAgent;
    }
    return 'unknown';
};

// Helper function to get screen resolution
const getScreenResolution = (): string => {
    if (typeof window !== 'undefined') {
        return `${window.screen.width}x${window.screen.height}`;
    }
    return 'unknown';
};

// Main analytics tracking function
export const trackEvent = (event: AnalyticsEvent, properties?: AnalyticsProperties) => {
    try {
        // Add common properties to all events
        const commonProperties = {
            userAgent: getUserAgent(),
            screenResolution: getScreenResolution(),
            timestamp: new Date().toISOString(),
            ...properties
        };

        // Track the event with Vercel Analytics
        track(event, commonProperties);

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Analytics Event:', event, commonProperties);
        }
    } catch (error) {
        // Silently fail - don't break the app if analytics fails
        console.warn('Analytics tracking failed:', error);
    }
};

// Specific tracking functions for common events
export const trackFilesDrop = (files: File[]) => {
    const fileTypes = files.map(file => getFileExtension(file.name));
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const averageFileSize = totalSize / files.length;

    trackEvent('file_dropped', {
        fileCount: files.length,
        fileTypes: [...new Set(fileTypes)].join(','), // Convert array to comma-separated string
        totalSize: formatSizeForAnalytics(totalSize),
        averageFileSize: formatSizeForAnalytics(averageFileSize)
    });
};

export const trackCompressionStart = (files: File[], quality: number) => {
    const fileTypes = files.map(file => getFileExtension(file.name));
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    trackEvent('compression_started', {
        fileCount: files.length,
        fileTypes: [...new Set(fileTypes)].join(','), // Convert array to comma-separated string
        totalSize: formatSizeForAnalytics(totalSize),
        quality
    });
};

export const trackCompressionComplete = (
    originalSize: number,
    compressedSize: number,
    fileCount: number,
    quality: number,
    processingTime: number
) => {
    const compressionRatio = compressedSize / originalSize;
    const savingsPercentage = ((originalSize - compressedSize) / originalSize) * 100;

    trackEvent('compression_completed', {
        fileCount,
        quality,
        originalSize: formatSizeForAnalytics(originalSize),
        compressedSize: formatSizeForAnalytics(compressedSize),
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        savingsPercentage: Math.round(savingsPercentage * 100) / 100,
        processingTime: Math.round(processingTime / 1000) // Convert to seconds
    });
};

export const trackCompressionError = (error: Error, fileCount: number, quality: number) => {
    trackEvent('compression_failed', {
        fileCount,
        quality,
        errorType: error.name,
        errorMessage: error.message.substring(0, 100) // Limit error message length
    });
};

export const trackQualityChange = (oldQuality: number, newQuality: number) => {
    trackEvent('quality_changed', {
        oldQuality,
        newQuality,
        qualityDifference: newQuality - oldQuality
    });
};

export const trackFilesDownload = (fileCount: number, totalSize: number) => {
    trackEvent('files_downloaded', {
        fileCount,
        totalSize: formatSizeForAnalytics(totalSize)
    });
};

export const trackSupportAction = (action: 'coffee' | 'github' | 'contact') => {
    const eventMap = {
        coffee: 'coffee_clicked',
        github: 'github_clicked',
        contact: 'contact_clicked'
    } as const;

    trackEvent(eventMap[action]);
};

export const trackPageLoad = () => {
    trackEvent('page_loaded', {
        sessionStart: new Date().toISOString()
    });
};

// Session tracking
let sessionStartTime: number | null = null;

export const startSession = () => {
    sessionStartTime = Date.now();
    trackPageLoad();
};

export const getSessionDuration = (): number => {
    if (!sessionStartTime) return 0;
    return Date.now() - sessionStartTime;
};

export const trackSessionEnd = () => {
    if (sessionStartTime) {
        trackEvent('session_ended', {
            sessionDuration: Math.round(getSessionDuration() / 1000) // Convert to seconds
        });
    }
};
