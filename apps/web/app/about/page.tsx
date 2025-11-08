
"use client";

import Link from "next/link";
import { Shield, Users, CheckCircle, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-saffron-50 via-ivory to-gold-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              About Vipra Sethu
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Your trusted community platform connecting you with verified service providers who understand and respect your cultural traditions. We bridge the gap between quality service and cultural authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600">Everything you need to know about Vipra Sethu</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <Accordion type="single" defaultValue="item-0" className="w-full">
              <AccordionItem value="item-0" className="border-b border-slate-100">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-left">How does verification work?</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-slate-600 leading-relaxed">
                    We verify identity and service details before publishing. Additional proofs may be requested.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-1" className="border-b border-slate-100">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-left">Is listing free?</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-slate-600 leading-relaxed">
                    Yes, listing is free. We may introduce premium placements in the future, clearly marked as such.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-left">How long does approval take?</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-slate-600 leading-relaxed">
                    Most profiles are reviewed within 24–48 hours. You will receive a WhatsApp notification on approval.
                  </p>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-slate-600">The principles that guide everything we do</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Trust First</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every listing goes through identity and background verification before it appears in search results.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Community-Centric</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We prioritize traditions, language, and community needs to enable the right match for every requirement.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Quality Listings</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clear profiles with languages, traditions, experience and response time to make informed choices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How trust works */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">How Trust & Verification Work</h2>
            <p className="text-base md:text-lg text-slate-600">Our rigorous process ensures quality and authenticity</p>
          </div>
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-md border border-gray-200">
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Provider Onboarding</h4>
                  <p className="text-slate-600">Providers complete onboarding with identity and service details</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Verification Process</h4>
                  <p className="text-slate-600">Our team verifies information and may request additional proofs</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Profile Publication</h4>
                  <p className="text-slate-600">Approved profiles are published with a Verified badge</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Ongoing Quality</h4>
                  <p className="text-slate-600">Community feedback helps keep listings high-quality</p>
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
            <h3 className="font-semibold text-slate-900 mb-2">Policies</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>
                <Link href="/conduct" className="text-saffron hover:underline">Code of Conduct</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-saffron hover:underline">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-saffron hover:underline">Terms of Service</Link>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-slate-900 mb-2">Contact</h3>
            <p className="text-sm text-slate-700 mb-2">
              For questions, feedback, or support, reach out to us.
            </p>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="h-4 w-4" />
              <a href="mailto:support@viprasethu.example" className="text-saffron hover:underline">
                support@viprasethu.example
              </a>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
