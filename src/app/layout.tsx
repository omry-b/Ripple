import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { VercelInsights } from "@/components/shell/VercelInsights";
import { ThemeProvider } from "@/context/ThemeContext";
import { FirebaseAuthProvider } from "@/context/FirebaseAuthContext";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://ripple-cs153.vercel.app"
  ),
  title: "Ripple | Supply Chain Intelligence",
  description: "Global supply chain risk intelligence dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`} data-theme="dark">
      <body>
        <FirebaseAuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </FirebaseAuthProvider>
        <VercelInsights />
      </body>
    </html>
  );
}
