'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Globe, Zap, Shield } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/BG.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Content - Left Aligned */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="max-w-3xl">
          {/* Logo */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 backdrop-blur-xl bg-white/10 rounded-xl px-5 py-3 border border-white/20 shadow-lg">
              <Image 
                src="/logo.svg" 
                alt="NEDAplus Logo" 
                width={40} 
                height={40}
                className="w-10 h-10"
              />
              <h1 className="text-xl md:text-2xl font-bold text-white">
                NEDAplus<span className="text-blue-500">+</span>
              </h1>
            </div>
          </div>

          {/* Main Content with Glassmorphism Background */}
          <div className="backdrop-blur-xl bg-black/20 rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl mb-12">
            {/* Main Tagline - Left Aligned like Portal */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Pay anywhere,</span>
              <br />
              <span className="text-blue-500">
                Settle everywhere
              </span>
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed">
              Omnichannel layer for interoperability and money movement across borders.
              <br />
              Regulated by the Central Bank of Tanzania.
            </p>
          </div>

          {/* CTA Buttons - Clean, Portal-style Layout */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Primary CTA - NEDAplus+ */}
            <Link href="https://nedapayplus.xyz/auth/login">
              <button className="group relative backdrop-blur-xl bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl border border-white/20 shadow-lg transition-all duration-300 hover:shadow-blue-500/30">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>NEDAplus+ Cross-Border</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="text-xs text-blue-100 mt-1">
                  130+ countries instantly
                </div>
              </button>
            </Link>

            {/* Secondary CTA - nTZS */}
            <Link href="https://app.ntzs.co.tz/">
              <button className="group relative backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl border border-white/20 shadow-lg transition-all duration-300">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Tanzania nTZS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="text-xs text-gray-300 mt-1">
                  Strategic Digital Reserve
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
