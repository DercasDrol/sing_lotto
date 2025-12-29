import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Roboto } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Roboto for tickets (same as PDF)
const roboto = Roboto({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

const siteUrl = "https://sing-lotto.fan-side-of-mars.ovh";

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: "Sing Loto - Генератор музыкального лото | Music Bingo Generator",
    template: "%s | Sing Loto",
  },
  description: "Бесплатный генератор билетов для музыкального лото и караоке-бинго. Создайте билеты для вечеринки за секунды! Free music bingo card generator for parties and karaoke events.",
  keywords: [
    // Russian keywords
    "музыкальное лото",
    "пой лото",
    "караоке бинго",
    "музыкальный бинго",
    "генератор билетов",
    "караоке игра",
    "музыкальная игра",
    "игра для вечеринки",
    "караоке вечеринка",
    // English keywords
    "music bingo",
    "song bingo",
    "karaoke bingo",
    "music lottery",
    "bingo card generator",
    "party game",
    "music game",
    "karaoke party game",
  ],
  authors: [{ name: "DercasDrol", url: "https://github.com/DercasDrol" }],
  creator: "DercasDrol",
  publisher: "DercasDrol",
  applicationName: "Sing Loto",
  generator: "Next.js",
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Canonical and alternates
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      "ru-RU": "/",
      "en-US": "/",
    },
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "Sing Loto",
    title: "Sing Loto - Генератор музыкального лото",
    description: "Создайте билеты для музыкального лото и караоке-бинго за секунды. Бесплатно!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sing Loto - Музыкальное лото",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Sing Loto - Music Bingo Generator",
    description: "Free music bingo card generator for parties and karaoke events",
    images: ["/og-image.png"],
  },
  
  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sing Loto",
  },
  
  // Format detection
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
    shortcut: "/icon.svg",
  },
  
  // Other
  manifest: "/manifest.json",
  category: "games",
  classification: "Entertainment, Games, Music",
};

export const viewport: Viewport = {
  themeColor: "#667eea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
