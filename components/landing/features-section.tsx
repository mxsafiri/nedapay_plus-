'use client';

import { Shield, Zap, Globe } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    title: 'Stablecoin Off-Ramp',
    description: 'Convert USDC/USDT to local fiat in 1-2 minutes. 9 currencies, automated settlement, API-first.',
    highlight: 'NOW AVAILABLE',
    image: '/partner logos/NEDApay lOGO.jpg',
  },
  {
    title: 'For Banks & PSPs',
    description: 'Enable instant fiat withdrawals for your users. Automate payouts to bank accounts across 130+ countries worldwide.',
    highlight: 'Web3 Ready',
    images: ['/partner logos/crdb.png', '/partner logos/Absa_Logo.svg', '/partner logos/TCB.png'],
  },
  {
    title: 'API-First Platform',
    description: 'Simple REST API. Webhooks for status updates. Test mode for development. Production-ready in minutes.',
    highlight: 'Integration',
    image: '/partner logos/THUNES.png',
  },
  {
    title: 'Fully Regulated',
    description: 'Licensed by Central Bank of Tanzania under the FinTech regulatory Sandbox with full AML/KYC compliance.',
    highlight: 'Compliance',
    image: '/partner logos/BOT.png',
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(96, 165, 250) 2px, transparent 0)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-white">
          <h2 className="text-4xl md:text-5xl font-medium mb-3">
            Unlocking Africa&apos;s Largest
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400"> Digital Assets Economy</span>
          </h2>
          <p className="text-xl text-slate-700 dark:text-gray-300 mb-2 font-light">
            Infrastructure that powers growth
          </p>
          <p className="text-base text-slate-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
            Enterprise-grade payment infrastructure for Africa&apos;s digital economy
          </p>
        </div>

        {/* Animated Features - Horizontal Scroll */}
        <div className="relative w-full">
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-slate-50 via-slate-100/95 via-slate-100/60 to-transparent dark:from-black dark:via-gray-900/95 dark:via-gray-900/60 z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-slate-50 via-slate-100/95 via-slate-100/60 to-transparent dark:from-black dark:via-gray-900/95 dark:via-gray-900/60 z-10 pointer-events-none" />
          
          <div className="overflow-x-auto scrollbar-hide scroll-smooth">
            <div className="flex animate-scroll-loop">
            {[...features, ...features, ...features].map((feature, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-4 group relative backdrop-blur-2xl bg-gradient-to-br from-white to-slate-100 hover:from-white hover:to-slate-50 dark:from-white/10 dark:to-white/5 dark:hover:from-white/15 dark:hover:to-white/10 rounded-3xl p-8 border border-slate-200 dark:border-white/20 hover:border-blue-400/40 transition-all duration-300 shadow-2xl"
                style={{ width: '420px' }}
              >
                {/* Image(s) at top */}
                <div className="mb-6 flex items-center justify-center h-24">
                  <div className="relative w-full h-full flex items-center justify-center gap-4">
                    {feature.images ? (
                      // Multiple images for "For Banks"
                      feature.images.map((img, imgIndex) => (
                        <Image
                          key={imgIndex}
                          src={img}
                          alt={`${feature.title} ${imgIndex + 1}`}
                          width={80}
                          height={50}
                          className="object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      ))
                    ) : (
                      // Single image for other cards
                      <Image
                        src={feature.image!}
                        alt={feature.title}
                        width={120}
                        height={60}
                        className="object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    )}
                  </div>
                </div>

                {/* Content with lighter typography */}
                <div className="space-y-3">
                  {/* Small highlight badge */}
                  <div className="inline-block">
                    <span className="text-blue-400 text-xs font-medium tracking-wider uppercase px-3 py-1 bg-blue-500/10 rounded-full border border-blue-400/20">
                      {feature.highlight}
                    </span>
                  </div>
                  
                  {/* Title - Medium weight, not bold */}
                  <h3 className="text-2xl font-medium text-slate-900 dark:text-white leading-snug">
                    {feature.title}
                  </h3>
                  
                  {/* Description - Smaller and lighter */}
                  <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>

                {/* Glossy overlay effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
          {/* Regulation Badge */}
          <div className="backdrop-blur-xl bg-black/5 dark:bg-white/10 rounded-xl px-6 py-3 border border-slate-200 dark:border-white/20">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-slate-800 dark:text-gray-200">BoT Regulated</span>
            </div>
          </div>

          {/* API Badge */}
          <div className="backdrop-blur-xl bg-black/5 dark:bg-white/10 rounded-xl px-6 py-3 border border-slate-200 dark:border-white/20">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-slate-800 dark:text-gray-200">BaaS API Platform</span>
            </div>
          </div>

          {/* Coverage Badge */}
          <div className="backdrop-blur-xl bg-black/5 dark:bg-white/10 rounded-xl px-6 py-3 border border-slate-200 dark:border-white/20">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-slate-800 dark:text-gray-200">130+ Countries</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* CSS Animations for scrolling */}
      <style jsx>{`
        @keyframes scroll-loop {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-452px * 4));
          }
        }

        .animate-scroll-loop {
          animation: scroll-loop 20s linear infinite;
        }

        .animate-scroll-loop:hover {
          animation-play-state: paused;
        }

        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
