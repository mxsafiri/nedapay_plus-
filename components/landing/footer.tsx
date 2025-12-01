'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-slate-50 text-slate-800 border-t border-slate-200 dark:bg-black dark:text-white dark:border-white/10">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">
              NEDAplus<span className="text-blue-500">+</span>
            </h3>
            <p className="text-slate-600 dark:text-gray-400 mb-4 max-w-md">
              Africa&apos;s leading B2B payment infrastructure for cross-border settlements. 
              Regulated by the Central Bank of Tanzania.
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Dar es Salaam, Tanzania</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:info@nedaplus.com" className="hover:text-white transition-colors">
                  info@nedaplus.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+255 744 277 496</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
              <li>
                <Link href="https://nedapayplus.xyz/auth/login" className="hover:text-black dark:hover:text-white transition-colors">
                  NEDAplus+ Cross-Border
                </Link>
              </li>
              <li>
                <Link href="https://app.ntzs.co.tz/" className="hover:text-black dark:hover:text-white transition-colors">
                  Tanzania nTZS Stablecoin
                </Link>
              </li>
              <li>
                <Link href="https://nedapayplus.xyz/auth/login" className="hover:text-white transition-colors">
                  BaaS API Platform
                </Link>
              </li>
              <li>
                <Link href="https://nedapayplus.xyz/auth/login" className="hover:text-white transition-colors">
                  White-Label Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
              <li>
                <Link href="https://nedapayplus.xyz/auth/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="https://app.ntzs.co.tz/" className="hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-gray-400">
              © 2025 NEDAplus. All rights reserved. Licensed by Bank of Tanzania.
            </p>
            <div className="flex gap-6 text-sm text-slate-600 dark:text-gray-400">
              <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Compliance
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
