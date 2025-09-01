import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/session-provider";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { ConditionalFooter } from "@/components/conditional-footer";
import { ConditionalMain } from "@/components/conditional-main";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PumpIt - Cross-Promotion Platform",
  description: "The ultimate cross-promotion platform for indie makers",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          defaultTheme="light"
          storageKey="pumpit-ui-theme"
        >
          <Providers>
            <div className="flex flex-col min-h-screen">
              <ConditionalNavbar />
              <ConditionalMain>
                {children}
              </ConditionalMain>
              <ConditionalFooter />
            </div>
          </Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}