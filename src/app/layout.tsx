import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL('https://nanamin.vercel.app'),
  title: {
    default: "Nanamin - Compress Your Manga & Comics",
    template: "%s | Nanamin"
  },
  description: "Compress your favorite manga and comic books. Save 30-70% space while keeping quality. 100% private, lightning fast, works in your browser.",
  keywords: ["CBZ", "CBR", "comic", "compression", "manga", "WebP", "privacy", "space saving", "file compression", "browser compression", "comic book compression"],
  authors: [{ name: "Martin", url: "https://crisp.hr" }],
  creator: "Martin",
  publisher: "Nanamin",
  category: "Technology",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Nanamin - Compress Your Manga & Comics",
    description: "Save space on your digital collection. 30-70% compression with 100% privacy. Works entirely in your browser.",
    type: "website",
    locale: "en_US",
    url: "https://nanamin.vercel.app",
    siteName: "Nanamin",
    images: [
      {
        url: "/og-image.png",
        width: 512,
        height: 512,
        alt: "Nanamin - Comic & Manga Compressor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nanamin - Compress Your Manga & Comics",
    description: "Save space on your digital collection. 30-70% compression with 100% privacy.",
    images: ["/og-image.png"],
    creator: "@crispsolutions",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://nanamin.vercel.app",
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: 'MonoLisa, JetBrains Mono, Fira Code, monospace',
  headings: {
    fontFamily: 'MonoLisa, JetBrains Mono, Fira Code, monospace',
  },
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications />
          {children}
          <Analytics />
          <Script
            src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
            data-name="bmc-button"
            data-slug="crispsolutions"
            data-color="#8B5CF6"
            data-emoji=""
            data-font="Inter"
            data-text="Buy us instant ramen"
            data-outline-color="#1F2937"
            data-font-color="#FFFFFF"
            data-coffee-color="#8B5CF6"
            strategy="lazyOnload"
          />
        </MantineProvider>
      </body>
    </html>
  );
}