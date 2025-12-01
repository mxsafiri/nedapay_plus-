'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-600/10 animate-pulse" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-900 dark:text-white">
        {/* Glowing effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-black/5 dark:bg-white/10 rounded-full px-6 py-2 border border-black/10 dark:border-white/20 mb-8">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="text-sm text-slate-700 dark:text-gray-200">Start earning revenue today</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to be part of the biggest
            <br />
            <span className="slide-up-text text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400">
              Digital payment infrastructure.
            </span>
          </h2>

          <p className="text-xl text-slate-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Join Tanzania&apos;s leading banks and PSPs on NEDAplus. Get started in minutes, no integration complexity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://nedapayplus.xyz/auth/login">
              <button className="group backdrop-blur-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold px-10 py-5 rounded-xl border border-blue-500/40 dark:border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50">
                <span className="flex items-center justify-center gap-2 text-lg">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>

            <Link href="https://regulator.ntzs.co.tz/auth/signin">
              <button className="group backdrop-blur-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-semibold px-10 py-5 rounded-xl border border-black/10 dark:border-white/20 shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="flex items-center justify-center gap-2 text-lg">
                  Regulator
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap gap-4 justify-center items-center text-sm text-slate-600 dark:text-gray-400">
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 dark:border-white/10 dark:bg-white/5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>BoT Licensed</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 dark:border-white/10 dark:bg-white/5">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 dark:border-white/10 dark:bg-white/5">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>AML/KYC Compliant</span>
            </div>
            <Link
              href="/docs"
              className="flex items-center gap-2 rounded-full border border-emerald-500/70 bg-emerald-500/10 px-4 py-2 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100 transition"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>View Docs</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Local slide-up text animation for hero tagline */}
      <style jsx>{`
        .slide-up-text {
          opacity: 0;
          transform: translateY(12px);
          animation: slide-up-fade 0.9s ease-out forwards;
          animation-delay: 0.2s;
        }

        @keyframes slide-up-fade {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
