import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Become a Host | Restiqa",
  description: "Earn money by hosting your space on Restiqa. Join thousands of hosts in Bangladesh.",
};

export default async function BecomeAHostPage() {
  const dict = await getDictionary();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 space-y-24">
      {/* ── Hero Section ── */}
      <section className="text-center max-w-3xl mx-auto neo-card p-8 lg:p-16 rounded-[40px] animate-in slide-in-from-bottom duration-700">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-6" style={{ color: "#1a202c", letterSpacing: "-0.03em" }}>
          {dict.becomeHost.title}
        </h1>
        <p className="text-lg text-[#718096] mb-10 font-medium leading-relaxed">
          {dict.becomeHost.subtitle}
        </p>
        <Link
          href="/dashboard/add-listing"
          className="neo-btn neo-btn-primary px-10 py-5 rounded-2xl font-extrabold text-lg inline-block transition-transform hover:-translate-y-1 active:scale-95 shadow-[0_10px_25px_-5px_rgba(108,99,255,0.4)]"
          style={{ background: "linear-gradient(135deg, #6c63ff, #ff6584)", color: "#fff" }}
        >
          {dict.becomeHost.cta}
        </Link>
      </section>

      {/* ── Benefits Section ── */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#1a202c] mb-4">{dict.becomeHost.benefitsTitle}</h2>
          <div className="w-24 h-1 bg-[#6c63ff] mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {dict.becomeHost.benefits.map((benefit: any, i: number) => (
            <div key={i} className="neo-card p-8 rounded-[32px] text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="text-5xl mb-6 mx-auto w-20 h-20 bg-white/50 backdrop-blur-md flex items-center justify-center rounded-2xl shadow-inner">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1a202c] mb-3">{benefit.title}</h3>
              <p className="text-[#718096] leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Steps Section ── */}
      <section className="neo-inset p-8 lg:p-16 rounded-[40px]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-[#1a202c] mb-4">{dict.becomeHost.stepsTitle}</h2>
          <div className="w-24 h-1 bg-[#43e97b] mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative border-l-2 md:border-l-0 md:border-t-2 border-[#d1d9e0] border-dashed pt-8 md:pt-12 pl-8 md:pl-0">
          {dict.becomeHost.steps.map((step: any, i: number) => (
            <div key={i} className="relative mt-8 md:mt-0">
              <div className="absolute -left-12 -top-14 md:-top-20 md:left-1/2 md:-translate-x-1/2 w-10 h-10 rounded-full bg-[#6c63ff] text-white flex items-center justify-center font-extrabold text-lg shadow-[0_0_15px_rgba(108,99,255,0.4)]">
                {step.step}
              </div>
              <h3 className="text-xl font-bold text-[#1a202c] mb-3 md:text-center mt-2 md:mt-0">{step.title}</h3>
              <p className="text-[#718096] md:text-center leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section>
         <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#1a202c] mb-4">{dict.becomeHost.testimonialsTitle}</h2>
          <div className="w-24 h-1 bg-[#ff6584] mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {dict.becomeHost.testimonials.map((test: any, i: number) => (
            <div key={i} className="neo-card p-10 rounded-[32px] relative">
              <div className="absolute top-6 left-6 text-6xl text-[#6c63ff] opacity-10 font-serif">"</div>
              <p className="text-[#2d3748] font-semibold text-lg italic mb-8 relative z-10 leading-relaxed">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-white font-bold text-lg">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-[#1a202c]">{test.name}</h4>
                  <p className="text-sm text-[#718096]">Host in {test.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-12">
        <Link
          href="/dashboard/add-listing"
          className="neo-btn neo-btn-primary px-10 py-5 rounded-2xl font-extrabold text-lg inline-block transition-transform hover:-translate-y-1 active:scale-95 shadow-[0_10px_25px_-5px_rgba(108,99,255,0.4)]"
          style={{ background: "linear-gradient(135deg, #6c63ff, #ff6584)", color: "#fff" }}
        >
          {dict.becomeHost.cta}
        </Link>
      </section>
    </div>
  );
}
