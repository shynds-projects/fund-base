import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fund.base — Free Startup Intelligence",
  description:
    "A free, AI-powered alternative to Crunchbase. Company profiles, funding data, founder bios, and culture insights for VC-backed startups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdf8f3] text-[#2d2416] font-[family-name:var(--font-nunito)]">
        {children}
      </body>
    </html>
  );
}
