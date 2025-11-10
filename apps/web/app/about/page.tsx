
"use client";

import Link from "next/link";
import { Shield, Users, CheckCircle, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";
import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-saffron-50 via-ivory to-gold-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">{t("title")}</h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">{t("subtitle")}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("faq.title")}</h2>
            <p className="text-slate-600">{t("faq.subtitle")}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <Accordion type="single" defaultValue="item-0" className="w-full">
              <AccordionItem value="item-0" className="border-b border-slate-100">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-left">{t("faq.q1")}</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-slate-600 leading-relaxed">{t("faq.a1")}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-1" className="border-b border-slate-100">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-left">{t("faq.q2")}</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-slate-600 leading-relaxed">{t("faq.a2")}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-left">{t("faq.q3")}</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-slate-600 leading-relaxed">{t("faq.a3")}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Mission & Values - Compact 3-column cards */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("values.title")}</h2>
            <p className="text-slate-600">{t("values.subtitle")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("values.trust.title")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t("values.trust.desc")}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("values.community.title")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t("values.community.desc")}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("values.quality.title")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t("values.quality.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How trust works */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{t("how.title")}</h2>
            <p className="text-base md:text-lg text-slate-600">{t("how.subtitle")}</p>
          </div>
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-md border border-gray-200">
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("how.steps.0.title")}</h4>
                  <p className="text-slate-600">{t("how.steps.0.desc")}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("how.steps.1.title")}</h4>
                  <p className="text-slate-600">{t("how.steps.1.desc")}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("how.steps.2.title")}</h4>
                  <p className="text-slate-600">{t("how.steps.2.desc")}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("how.steps.3.title")}</h4>
                  <p className="text-slate-600">{t("how.steps.3.desc")}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Policies & Contact */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-slate-900 mb-2">{t("policies.title")}</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>
                <Link href="/conduct" className="text-saffron hover:underline">{t("policies.conduct")}</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-saffron hover:underline">{t("policies.privacy")}</Link>
              </li>
              <li>
                <Link href="/terms" className="text-saffron hover:underline">{t("policies.terms")}</Link>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-slate-900 mb-2">{t("contact.title")}</h3>
            <p className="text-sm text-slate-700 mb-2">{t("contact.subtitle")}</p>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${t("contact.email")}`} className="text-saffron hover:underline">
                {t("contact.email")}
              </a>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
