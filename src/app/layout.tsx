import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubTrack - サブスクリプション管理アプリ",
  description: "サブスクをスマートに整理して、無駄な支出を防ごう。無料で使える家計管理アプリ SubTrack。",
  keywords: "サブスクリプション, 家計管理, 支出管理, 無料アプリ, SubTrack",
  icons: {
    icon: [
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/icons/icon-512.png',
    shortcut: '/icons/icon-512.png',
  },
  openGraph: {
    title: "SubTrack - サブスクリプション管理アプリ",
    description: "サブスクをスマートに整理して、無駄な支出を防ごう。",
    type: "website",
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'SubTrack アプリロゴ',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'SubTrack - サブスクリプション管理アプリ',
    description: 'サブスクをスマートに整理して、無駄な支出を防ごう。',
    images: ['/icons/icon-512.png'],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <LoadingProvider>
          <AuthProvider>{children}</AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
