import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/session-provider";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PumpIt - Cross-Promotion Platform",
  description: "The ultimate cross-promotion platform for indie makers",
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
          defaultTheme="system"
          storageKey="pumpit-ui-theme"
        >
          <Providers>
            <ConditionalNavbar />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}