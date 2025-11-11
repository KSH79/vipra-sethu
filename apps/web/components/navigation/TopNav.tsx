"use client";

import { cn } from "@/lib/utils";
import { Menu, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LanguageSelector } from "@/components/LanguageSelector";

/**
 * Top navigation bar with logo, search, and links
 */
export function TopNav({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/providers", label: tNav("providers") },
    { href: "/about", label: tNav("about") },
    { href: "/admin", label: tNav("admin") },
  ];

  const isProvidersPage = pathname === "/providers";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-ivory/90 backdrop-blur border-b transition-all",
        isScrolled ? "border-sandstone/20 shadow-soft" : "border-sandstone/20"
      )}
    >
      <div className="container-custom">
        <div className="flex h-14 items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-saffron to-gold flex items-center justify-center">
              <span className="text-white font-bold text-xs">VS</span>
            </div>
            <span className="font-display font-semibold tracking-tight text-slate-900">
              {tNav("brand")}
            </span>
          </Link>

          {/* Center search (desktop only) - hidden to avoid duplicate with page hero search */}
          {false && isProvidersPage && (
            <div className="hidden md:flex flex-1 max-w-xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sandstone/70" />
                <input
                  className="w-full h-11 rounded-xl border border-sandstone/30 bg-white pl-10 pr-10 text-sm
                         placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-saffron/50
                         shadow-sm"
                  placeholder="Find purohits, cooks, essentials…"
                  aria-label="Search"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden sm:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm hover:text-saffron transition-colors",
                  pathname === link.href
                    ? "text-saffron font-medium"
                    : "text-slate-600"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/onboard"
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-saffron text-white hover:opacity-90 transition-opacity"
            >
              {tNav("addListing")}
            </Link>
            {isAuthenticated && (
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-sm text-slate-600 hover:text-saffron transition-colors"
                >
                  {tNav("logout")}
                </button>
              </form>
            )}
            <LanguageSelector />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-auto p-2 text-slate-600 hover:text-saffron transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={tCommon("toggleMenu", { default: "Toggle menu" })}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-sandstone/20">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-saffron/10 text-saffron"
                      : "text-slate-600 hover:bg-sandstone/10"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/onboard"
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full bg-saffron text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {tNav("addListing")}
              </Link>
              {isAuthenticated && (
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-sandstone/10 text-left"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tNav("logout")}
                  </button>
                </form>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}