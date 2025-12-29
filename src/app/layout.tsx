import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Sing Loto Generator",
  description: "Music bingo ticket generator inspired by Russian Lotto",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  themeColor: "#667eea",
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
