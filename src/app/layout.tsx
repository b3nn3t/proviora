import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Proviora | Premium Wellness & Skincare",
  description: "Инновационные БАДы и уходовая косметика премиум-класса",
};

import ToastContainer from "@/components/ui/ToastContainer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} antialiased bg-[#243A5E] text-white`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
