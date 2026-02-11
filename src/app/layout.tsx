import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";

export const metadata: Metadata = {
  title: "ApplyFlow",
  description: "Offline-first job application tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ApplyFlow",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { BottomNav } from "@/components/nav/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-black dark:bg-black dark:text-white pb-24`}
      >
        <ServiceWorkerRegister />
        <OfflineIndicator />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
