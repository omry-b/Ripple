import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { VercelInsights } from "@/components/shell/VercelInsights";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppClerkProvider } from "@/components/providers/AppClerkProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://ripple-omry-2596s-projects.vercel.app"
  ),
  title: "Ripple — Supply Chain Intelligence",
  description: "Global supply chain risk intelligence dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${dmMono.variable}`} data-theme="dark">
      <body>
        <AppClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AppClerkProvider>
        <VercelInsights />
      </body>
    </html>
  );
}
