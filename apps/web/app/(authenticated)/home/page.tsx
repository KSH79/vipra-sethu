"use client";

import Link from "next/link";
import { Search, Shield, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PageViewTracker } from "@/hooks/usePageView";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");
  const quickChips = t.raw("quickChips") as string[];
  const ritualChips = t.raw("ritualChips") as string[];
  const trustPillars = [
    { title: t("pillars.verified.title"), description: t("pillars.verified.desc"), icon: Shield, color: "text-green-600 bg-green-50" },
    { title: t("pillars.community.title"), description: t("pillars.community.desc"), icon: Heart, color: "text-saffron-600 bg-saffron-50" },
    { title: t("pillars.quality.title"), description: t("pillars.quality.desc"), icon: Sparkles, color: "text-gold-600 bg-gold-50" },
  ];

  return (
    <div className="min-h-screen">
      <PageViewTracker />
      {/* Hero Section - Enhanced */}
      <section className="py-12 md:py-20">
        <div className="container-custom text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            {t("hero.title")}
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">{t("hero.subtitle")}</p>

          {/* Enhanced Search Input - 56px height */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 
                               group-focus-within:text-saffron-500 transition-colors" />
              <input
                className="w-full h-14 pl-14 pr-6 rounded-full border-2 border-transparent bg-white
                         text-base placeholder:text-gray-400 
                         shadow-lg hover:shadow-xl
                         focus:outline-none focus:border-saffron-500 focus:shadow-2xl
                         focus:scale-[1.02]
                         transition-all duration-300"
                placeholder={t("search.placeholder")}
                aria-label={t("search.aria")}
              />
            </div>
          </div>

          {/* Enhanced Quick Chips - 44px height */}
          <div className="flex flex-wrap justify-center gap-3">
            {quickChips.map((chip) => (
              <Chip
                key={chip}
                active={false}
                className="h-11 px-5 text-sm font-medium
                         hover:scale-105 hover:shadow-md
                         transition-all duration-200"
              >
                {chip}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Why Vipra Sethu - Enhanced */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("why.title")}</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">{t("why.subtitle")}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {trustPillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={index} 
                  className="text-center space-y-4 p-6 rounded-2xl hover:bg-gray-50 
                           transition-all duration-300 group cursor-default"
                >
                  <div className={`h-16 w-16 rounded-2xl ${pillar.color} flex items-center justify-center mx-auto
                                 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{pillar.title}</h3>
                  <p className="text-base text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse by Ritual - Enhanced */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("browse.title")}</h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">{t("browse.subtitle")}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {ritualChips.map((ritual) => (
              <Link key={ritual} href={`/providers?ritual=${ritual.toLowerCase()}`}>
                <Chip
                  active={false}
                  className="h-11 px-5 text-sm font-medium
                           hover:scale-105 hover:shadow-md hover:border-saffron-500 hover:bg-saffron-50
                           transition-all duration-200"
                >
                  {ritual}
                </Chip>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-saffron-50 via-ivory-100 to-gold-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center p-8 md:p-12 rounded-3xl space-y-4 md:space-y-6
                       bg-white/80 backdrop-blur-sm shadow-xl border border-saffron-100">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{t("cta.title")}</h3>
            <p className="text-base md:text-lg text-slate-600 mb-1 md:mb-2">
              {t.rich("cta.subtitle", {
                strong: (chunks) => <span className="font-semibold text-saffron-600">{chunks}</span>
              })}
            </p>
            <Link href="/onboard" className="inline-block mt-1 md:mt-2">
              <Button className="h-12 px-8 text-base font-semibold rounded-xl
                               hover:scale-105 hover:shadow-xl
                               transition-all duration-200">
                {t("cta.button")}
              </Button>
            </Link>
            <p className="text-sm text-slate-500 mt-2">{t("cta.note")}</p>
          </div>
        </div>
      </section>

    </div>
  );
}
