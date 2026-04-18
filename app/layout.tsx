import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Mukta, Geist_Mono } from "next/font/google";
import "./globals.css";

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autodesk IPL 2026 Fun Fantasy League",
  description:
    "Real-time performance analytics and team statistics for the Autodesk IPL 2026 fantasy league.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${mukta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
