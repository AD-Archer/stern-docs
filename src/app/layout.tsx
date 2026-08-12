import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
} from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Insight } from "@/components/insight";
import { BOOT_SCRIPT } from "@/lib/boot-script";
import { AUTHOR_NAME, AUTHOR_URL, SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * IBM Plex, in three voices. Plex was drawn for machines and their manuals, and
 * this whole site is a manual for machines people run themselves  the
 * condensed cut does the silkscreened panel labels, the mono does readouts and
 * code, and the sans carries the prose. One family keeps a program's docs
 * coherent no matter which brand color the artwork hands it.
 */
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const condensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-condensed",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Program docs", template: "%s" },
  description: "Documentation for Hack Club program participants.",
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${condensed.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Insight />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
