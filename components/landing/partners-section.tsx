'use client';

import Image from 'next/image';

const partners = [
  { name: 'USDC', logo: '/usdc-logo.svg', type: 'crypto' },
  { name: 'USDT', logo: '/usdt-coin.svg', type: 'crypto' },
  { name: 'EURC', logo: '/eurc-coin.png', type: 'crypto' },
  { name: 'CADC', logo: '/cadc-coin.png', type: 'crypto' },
  { name: 'BRL', logo: '/brl-coin.png', type: 'crypto' },
  { name: 'CNGN', logo: '/cngn-icon.jpeg', type: 'crypto' },
  { name: 'ZARP', logo: '/zarp-coin.png', type: 'crypto' },
  { name: 'TRYB', logo: '/tryb-icon.png', type: 'crypto' },
];

// Duplicate for infinite scroll effect
const allPartners = [...partners, ...partners, ...partners];

export default function PartnersSection() {
  return (
    <section className="relative py-16 bg-slate-50 dark:bg-black overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>
      
      {/* Gradient overlays for fade effect (only in dark mode) */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-transparent dark:from-black dark:to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-transparent to-transparent dark:from-black dark:to-transparent z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-16 text-slate-900 dark:text-white">
          <h2 className="text-4xl md:text-5xl font-medium mb-6">
            Tanzania&apos;s first regulated stablecoin powering global finance
          </h2>
          <p className="text-lg text-slate-700 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Redeemable 1:1 for TZ shilling, nTZS enables 24/7 liquidity for near-instant, low-cost global payments. 
            We are building the biggest digital asset reserve in Africa.
          </p>
        </div>
        
        {/* Featured NTZ Stable - Two Column Layout */}
        <div className="max-w-5xl mx-auto">
          <div className="relative backdrop-blur-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-gray-900/50 dark:to-gray-800/30 rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-white/20 hover:border-blue-400/30 transition-all duration-300 overflow-hidden">
            {/* Perspective Grid Background */}
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.3) 2px, transparent 2px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.3) 2px, transparent 2px)
                `,
                backgroundSize: '50px 50px',
                transform: 'perspective(600px) rotateX(60deg)',
                transformOrigin: 'center bottom',
                opacity: 0.5,
              }}
            />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left: Image */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative group">
                  <Image
                    src="/NTZ STABLE 2.png"
                    alt="NTZ Stable - Tanzania's Local Stablecoin"
                    width={380}
                    height={210}
                    className="object-contain transition-all duration-300 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
              
              {/* Right: Text Content */}
              <div className="text-left space-y-3 text-slate-900 dark:text-white">
                <h4 className="text-2xl md:text-3xl font-medium">
                  Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">nTZS Stablecoin</span>
                </h4>
                <p className="text-slate-700 dark:text-gray-300 text-base leading-relaxed">
                  nTZS stands apart as the <span className="text-blue-400 font-medium">first regulated stablecoin in Tanzania</span>. 
                  As a fully compliant digital asset, nTZS offers unparalleled trust and transparency, ensuring security 
                  for all users, institutions, and businesses.
                </p>
                <div className="pt-2">
                  <p className="text-sm text-blue-400 font-medium">Tanzania&apos;s Local Stablecoin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite scrolling logos */}
      <div className="relative">
        <div className="flex animate-scroll">
          {allPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 mx-6 backdrop-blur-xl bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 transition-all duration-300 hover:scale-110"
              style={{ width: '120px', height: '120px' }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={80}
                  height={80}
                  className="object-contain filter brightness-90 hover:brightness-110 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>


      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-120px * ${partners.length} - ${partners.length * 48}px));
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
