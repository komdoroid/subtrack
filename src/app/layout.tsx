import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
  openGraph: {
    title: "SubTrack - サブスクリプション管理アプリ",
    description: "サブスクをスマートに整理して、無駄な支出を防ごう。",
    type: "website",
  },
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
