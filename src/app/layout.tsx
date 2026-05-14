import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdForge",
  description: "AI Creative Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-black text-lg tracking-tight">
            Ad<span className="text-lime-400">Forge</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/generate" className="text-sm text-zinc-400 hover:text-white transition-all px-3">Generate</Link>
<Link href="/brands" className="text-sm text-zinc-400 hover:text-white transition-all px-3">Brands</Link>
<Link href="/history" className="text-sm text-zinc-400 hover:text-white transition-all px-3">History</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}