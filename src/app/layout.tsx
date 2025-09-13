import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nanamin - Compress Your Manga & Comics",
  description: "Compress your favorite manga and comic books. Save 30-70% space while keeping quality. 100% private, lightning fast, works in your browser.",
  keywords: ["CBZ", "comic", "compression", "manga", "WebP", "privacy", "space saving", "file compression"],
  authors: [{ name: "Martin" }],
  creator: "Martin",
  publisher: "Nanamin",
  robots: "index, follow",
  openGraph: {
    title: "Nanamin - Compress Your Manga & Comics",
    description: "Save space on your manga collection. 100% private compression in your browser.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nanamin - Compress Your Manga & Comics",
    description: "Save space on your manga collection. 100% private compression in your browser.",
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
          <Script
            src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
            data-name="bmc-button"
            data-slug="crispsolutions"
            data-color="#8B5CF6"
            data-emoji="☕"
            data-font="Inter"
            data-text="Buy us a coffee (or a manga)"
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