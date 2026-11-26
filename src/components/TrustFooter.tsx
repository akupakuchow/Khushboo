import React, { useState } from 'react';
import { Banknote, Layers, ShieldCheck, Truck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { CategoryFilter, GenderFilter } from './CatalogSection';

interface TrustFooterProps {
  isAdminRoute: boolean;
  onNavigateSection: (
    sectionId: string,
    filterPreset?: { category?: CategoryFilter; gender?: GenderFilter }
  ) => void;
  onOpenAdmin: () => void;
  onExitAdmin: () => void;
}

export const TrustFooter: React.FC<TrustFooterProps> = ({
  isAdminRoute,
  onNavigateSection,
  onOpenAdmin,
  onExitAdmin,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleLink = (
    sectionId: string,
    filterPreset?: { category?: CategoryFilter; gender?: GenderFilter }
  ) => {
    if (isAdminRoute) {
      onExitAdmin();
      setTimeout(() => onNavigateSection(sectionId, filterPreset), 60);
      return;
    }
    onNavigateSection(sectionId, filterPreset);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <>
      {/* 4-Column Trust & Service Strip Above Footer */}
      <section className="bg-[#FAF8F4] border-t border-b border-[#E5E0D8]">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E0D8]">
            {(
              [
                {
                  icon: Banknote,
                  title: 'CASH ON DELIVERY',
                  desc: 'Pay in cash upon arrival',
                },
                {
                  icon: ShieldCheck,
                  title: 'AUTHENTIC ATTAR & PERFUME',
                  desc: 'Pure botanical distillation',
                },
                {
                  icon: Layers,
                  title: 'CUSTOM COMBO SAVINGS',
                  desc: '10% to 15% off bundles',
                },
                {
                  icon: Truck,
                  title: 'NATIONWIDE DELIVERY',
                  desc: 'Complimentary over ৳5,000',
                },
              ] as const
            ).map(({ icon: Icon, title, desc }) => (
              <div key={title} className="py-7 px-6 flex items-center gap-4">
                <Icon className="w-6 h-6 text-[#141414] stroke-[1.3] shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#141414]">
                    {title}
                  </p>
                  <p className="text-xs text-[#6E685F] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Luxury Footer (#121212) */}
      <footer className="bg-[#121212] text-[#F9F7F4]">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Left Column: STAY IN THE KNOW Newsletter */}
            <div className="lg:col-span-4 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#A39E93] font-medium">
                STAY IN THE KNOW
              </p>
              <h3 className="font-display text-2xl font-normal leading-snug text-[#F9F7F4] max-w-xs">
                Be the first to discover new scents and exclusive offers.
              </h3>

              {subscribed ? (
                <p className="text-xs text-[#C5A059] py-2">
                  Thank you for subscribing to KHUSHBOO updates.
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm pt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-label="Email address"
                    className="flex-1 min-w-0 px-3.5 py-2.5 bg-[#1B1A19] border border-[#32302B] text-xs text-[#F9F7F4] placeholder:text-[#7D776D] focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#121212] border border-l-0 border-[#32302B] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F9F7F4] hover:bg-[#F9F7F4] hover:text-[#121212] transition-colors shrink-0 cursor-pointer"
                  >
                    SUBSCRIBE
                  </button>
                </form>
              )}
            </div>

            {/* Middle Columns: SHOP, CATEGORIES, HELP */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-6 text-xs">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A39E93] font-semibold">
                  SHOP
                </p>
                <ul className="space-y-2 text-[#D6D1C7]">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLink('collection', { category: 'all' })}
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      All Fragrances
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLink('collection', { category: 'attar' })}
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      Attar
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        handleLink('collection', { category: 'perfume', gender: 'male' })
                      }
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      Men&apos;s Perfume
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        handleLink('collection', { category: 'perfume', gender: 'female' })
                      }
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      Women&apos;s Perfume
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A39E93] font-semibold">
                  CATEGORIES
                </p>
                <ul className="space-y-2 text-[#D6D1C7]">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLink('curated-combos')}
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      Curated Combos
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLink('combo-builder')}
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      Build Your Combo
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLink('collection', { category: 'attar' })}
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      Pure Oils
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A39E93] font-semibold">
                  HELP
                </p>
                <ul className="space-y-2 text-[#D6D1C7]">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLink('combo-builder')}
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      Combo Savings
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleLink('collection', { category: 'all' })}
                      className="hover:text-[#F9F7F4] cursor-pointer text-left"
                    >
                      Cash on Delivery
                    </button>
                  </li>
                  <li>
                    <a
                      href="/admin"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenAdmin();
                      }}
                      className="hover:text-[#F9F7F4] text-[#C5A059]"
                    >
                      Admin Portal
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Large Standalone KHUSHBOO Logo (NO extra tagline) */}
            <div className="lg:col-span-3 flex flex-col items-start lg:items-end justify-between gap-6">
              <BrandLogo
                id="brand-logo-footer"
                className="h-[58px] md:h-[64px] w-auto text-[#F9F7F4]"
              />

              <div className="flex flex-col items-start lg:items-end gap-4">
                {/* Minimal Social Outline Icons */}
                <div className="flex items-center gap-4 text-[#D6D1C7]">
                  <a
                    href="#collection"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLink('collection', { category: 'all' });
                    }}
                    aria-label="Instagram"
                    className="hover:text-[#F9F7F4]"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                  <a
                    href="#collection"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLink('collection', { category: 'all' });
                    }}
                    aria-label="Facebook"
                    className="hover:text-[#F9F7F4]"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.5">
                      <path d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3V3Z" />
                    </svg>
                  </a>
                </div>

                <p className="text-[11px] text-[#8C877C] lg:text-right">
                  © 2026 KHUSHBOO. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
