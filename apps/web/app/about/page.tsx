
"use client";

import Link from "next/link";
import { Shield, Users, CheckCircle, Mail } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-saffron-50 via-ivory to-gold-50">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              About Vipra Sethu
            </h1>
            <p className="text-base md:text-lg text-slate-600">
              Building a trusted, values-aligned community directory connecting people with
              verified purohits, cooks, and essential service providers.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-8 md:py-12">
        <div className="container-custom">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Our Team</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {["Sethu", "Lakshmi", "Arjun"].map((name, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="h-12 w-12 rounded-xl bg-saffron/10 flex items-center justify-center mb-3">
                  <span className="text-saffron font-semibold">{name.charAt(0)}</span>
                </div>
                <h3 className="font-semibold text-slate-900">{name}</h3>
                <p className="text-sm text-slate-600">Product & Community</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-8 md:py-12">
        <div className="container-custom max-w-3xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Accordion
              items={[
                {
                  title: "How does verification work?",
                  defaultOpen: true,
                  children: (
                    <p>
                      We verify identity and service details before publishing. Additional proofs may be requested.
                    </p>
                  ),
                },
                {
                  title: "Is listing free?",
                  children: (
                    <p>
                      Yes, listing is free. We may introduce premium placements in the future, clearly marked as such.
                    </p>
                  ),
                },
                {
                  title: "How long does approval take?",
                  children: (
                    <p>
                      Most profiles are reviewed within 24–48 hours. You will receive a WhatsApp notification on approval.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-8 md:py-12">
        <div className="container-custom max-w-4xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">Roadmap</h2>
          <ul className="grid md:grid-cols-3 gap-4">
            <li className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-slate-900 mb-1">Now</h4>
              <p className="text-sm text-slate-600">UI polish, provider onboarding, admin review workflow.</p>
            </li>
            <li className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-slate-900 mb-1">Next</h4>
              <p className="text-sm text-slate-600">Search improvements, categories, performance optimization.</p>
            </li>
            <li className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-slate-900 mb-1">Later</h4>
              <p className="text-sm text-slate-600">Provider ratings, availability calendars, mobile app.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-10 md:py-14">
        <div className="container-custom grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Shield className="h-7 w-7 text-saffron mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Trust First</h3>
            <p className="text-sm text-slate-600">
              Every listing goes through identity and background verification before it appears
              in search results.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Users className="h-7 w-7 text-saffron mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Community-Centric</h3>
            <p className="text-sm text-slate-600">
              We prioritize traditions, language, and community needs to enable the right match
              for every requirement.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <CheckCircle className="h-7 w-7 text-saffron mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Quality Listings</h3>
            <p className="text-sm text-slate-600">
              Clear profiles with languages, traditions, experience and response time to make
              informed choices.
            </p>
          </div>
        </div>
      </section>

      {/* How trust works */}
      <section className="py-8 md:py-10">
        <div className="container-custom max-w-4xl">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">How trust and verification work</h2>
          <ol className="list-decimal pl-5 space-y-2 text-slate-700">
            <li>Providers complete onboarding with identity and service details</li>
            <li>Our team verifies information and may request additional proofs</li>
            <li>Approved profiles are published with a Verified badge</li>
            <li>Community feedback helps keep listings high-quality</li>
          </ol>
        </div>
      </section>

      {/* Policies & Contact */}
      <section className="py-8 md:py-12">
        <div className="container-custom grid md:grid-cols-2 gap-6">
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
      </section>
    </div>
  );
}
