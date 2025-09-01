"use client";

import Link from "next/link";
import { useTheme } from "./theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  const { theme, setTheme } = useTheme();
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-semibold text-lg">
              PumpIt
            </Link>
            <span className="text-sm text-muted-foreground">
              © 2024 PumpIt. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link 
                href="/blog" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link 
                href="/refund" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Refund
              </Link>
            </nav>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-8 w-8 p-0"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}