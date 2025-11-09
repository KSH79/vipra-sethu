
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { TopNav } from "@/components/navigation/TopNav";
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { PostHogAnalyticsProvider } from "@/lib/analytics";
import { Analytics } from '@vercel/analytics/react';

// Import Sentry configurations
import '@/sentry.client.config'
import '@/sentry.server.config'
import '@/sentry.edge.config'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vipra Sethu - Trusted Community Directory",
  description: "Connect with verified purohits, cooks, and essential service providers in your community. Building trust through verification and traditional values.",
  keywords: ["purohit", "cook", "community services", "traditional ceremonies", "verified providers"],
  authors: [{ name: "Vipra Sethu" }],
  openGraph: {
    title: "Vipra Sethu - Trusted Community Directory",
    description: "Connect with verified purohits, cooks, and essential service providers in your community.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vipra Sethu - Trusted Community Directory",
    description: "Connect with verified purohits, cooks, and essential service providers.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Disable analytics during development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // In a server component render, we cannot set cookies; middleware handles refresh
        setAll() {},
      },
    }
  )
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session?.user
  
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {!isDevelopment && <PostHogAnalyticsProvider>
          {/* Skip link for accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="min-h-screen bg-ivory flex flex-col">
            <TopNav isAuthenticated={isAuthenticated} />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            {/* Global Footer - visible on all pages */}
            <footer className="border-t border-gray-200 bg-white py-12">
              <div className="container-custom">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-saffron-500 to-gold-500 
                                  flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-base">VS</span>
                    </div>
                    <div>
                      <span className="font-display font-bold text-lg text-slate-900 block">
                        Vipra Sethu
                      </span>
                      <span className="text-xs text-slate-500">
                        Building community through trust
                      </span>
                    </div>
                  </div>
                  
                  <nav className="flex flex-wrap justify-center gap-6 text-sm">
                    <Link href="/onboard" 
                          className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                      List your service
                    </Link>
                    <Link href="/about" 
                          className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                      About
                    </Link>
                    <Link href="/conduct" 
                          className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                      Code of Conduct
                    </Link>
                    <Link href="/privacy" 
                          className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                      Privacy
                    </Link>
                    <Link href="/contact" 
                          className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                      Contact
                    </Link>
                  </nav>
                </div>
                
                <div className="pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-slate-600">
                    © 2025 Vipra Sethu. Building community through trust and tradition.
                  </p>
                </div>
              </div>
            </footer>
          </div>
          {!isDevelopment && <Analytics />}
        </PostHogAnalyticsProvider>}
        
        {/* Development mode - no analytics */}
        {isDevelopment && (
          <>
            {/* Skip link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <div className="min-h-screen bg-ivory flex flex-col">
              <TopNav isAuthenticated={isAuthenticated} />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              {/* Global Footer - visible on all pages */}
              <footer className="border-t border-gray-200 bg-white py-12">
                <div className="container-custom">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-saffron-500 to-gold-500 
                                    flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-base">VS</span>
                      </div>
                      <div>
                        <span className="font-display font-bold text-lg text-slate-900 block">
                          Vipra Sethu
                        </span>
                        <span className="text-xs text-slate-500">
                          Building community through trust
                        </span>
                      </div>
                    </div>
                    
                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                      <Link href="/onboard" 
                            className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                        List your service
                      </Link>
                      <Link href="/about" 
                            className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                        About
                      </Link>
                      <Link href="/conduct" 
                            className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                        Code of Conduct
                      </Link>
                      <Link href="/privacy" 
                            className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                        Privacy
                      </Link>
                      <Link href="/contact" 
                            className="text-slate-600 hover:text-saffron-600 font-medium transition-colors">
                        Contact
                      </Link>
                    </nav>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-slate-600">
                      © 2025 Vipra Sethu. Building community through trust and tradition.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </>
        )}
      </body>
    </html>
  );
}
