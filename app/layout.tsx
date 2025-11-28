import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import GlobalHeader from "./components/GlobalHeader";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockApp - Inventory Management",
  description: "Track your inventory with precision. Know what you have, what you need, and never miss a critical part again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#000' }}>
      <head>
        <link rel="preload" href="/background.png" as="image" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="vignette" />
        <AuthProvider>
          <div className="flex relative z-10">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <GlobalHeader />
              <div className="flex-1">
                {children}
              </div>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
