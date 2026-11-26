import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gift,
  Sparkles,
} from 'lucide-react';
import type { HeroCtaTarget, HeroSlide } from '../types/store';

interface HeroProps {
  slides: HeroSlide[];
  onNavigateTarget: (target: HeroCtaTarget) => void;
}

const DEFAULT_FALLBACK_SLIDE: HeroSlide = {
  id: 'default-slide',
  kicker: 'CRAFTED FOR MOMENTS',
  headline: 'Scents that leave a lasting impression.',
  subtitle:
    'Artisanal pure attars and architectural perfumes, thoughtfully crafted with the finest botanical ingredients from around the world.',
  ctaText: 'EXPLORE COLLECTIONS',
  ctaTarget: 'collection',
};

const SlideArtwork: React.FC<{ index: number }> = ({ index }) => {
  const variant = index % 3;

  if (variant === 1) {
    // Cut-crystal Attar Flacon & Saffron/Oud botanicals
    return (
      <svg
        viewBox="0 0 420 340"
        className="w-full max-w-[460px] lg:max-w-[520px] h-auto"
        role="img"
        aria-label="KHUSHBOO Pure Attar Crystal Flacon"
      >
        <defs>
          <radialGradient id="heroAttarGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#DDD2C2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="heroAttarOil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A66D28" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#46290C" stopOpacity="0.96" />
          </linearGradient>
        </defs>
        <circle cx="215" cy="160" r="145" fill="url(#heroAttarGlow)" />
        <polygon points="88,284 352,284 372,296 72,296" fill="#E6DCCB" />
        <rect x="72" y="296" width="300" height="16" fill="#CFC1AC" />
        <ellipse cx="222" cy="314" rx="154" ry="6" fill="#141414" fillOpacity="0.12" />

        {/* Gold Dipper Attar Flacon */}
        <g transform="translate(152, 38)">
          <path d="M70 4 L77 20 L63 20 Z" fill="#C5A059" />
          <rect x="57" y="20" width="26" height="24" rx="2" fill="#C5A059" />
          <rect x="52" y="44" width="36" height="10" fill="#141414" />
          <polygon
            points="28,62 112,62 134,94 134,218 112,240 28,240 6,218 6,94"
            fill="#FAF8F4"
            fillOpacity="0.72"
            stroke="#C5B9A5"
            strokeWidth="1.5"
          />
          <polygon
            points="16,104 124,104 124,212 106,230 34,230 16,212"
            fill="url(#heroAttarOil)"
          />
          <rect x="34" y="128" width="72" height="58" fill="#F9F7F4" stroke="#D2C8B6" strokeWidth="1" />
          <text
            x="70"
            y="153"
            textAnchor="middle"
            fill="#141414"
            fontSize="10"
            fontFamily="Playfair Display, serif"
            letterSpacing="2"
          >
            KHUSHBOO
          </text>
          <line x1="48" y1="161" x2="92" y2="161" stroke="#C5A059" strokeWidth="0.9" />
          <text
            x="70"
            y="174"
            textAnchor="middle"
            fill="#5C564E"
            fontSize="6"
            fontFamily="Plus Jakarta Sans, sans-serif"
            letterSpacing="1.3"
          >
            PURE ATTAR
          </text>
        </g>
      </svg>
    );
  }

  if (variant === 2) {
    // Trio Custom Combo Vessels on Dark Coffret Pedestal
    return (
      <svg
        viewBox="0 0 420 340"
        className="w-full max-w-[460px] lg:max-w-[520px] h-auto"
        role="img"
        aria-label="KHUSHBOO Custom Fragrance Trio"
      >
        <defs>
          <radialGradient id="heroTrioGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#DDD2C2" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="215" cy="155" r="145" fill="url(#heroTrioGlow)" />
        <polygon points="62,278 368,278 386,292 48,292" fill="#2A2825" />
        <rect x="48" y="292" width="338" height="18" fill="#141414" />
        <ellipse cx="217" cy="312" rx="170" ry="6" fill="#141414" fillOpacity="0.16" />

        {/* Left Attar */}
        <g transform="translate(76, 98)">
          <rect x="26" y="0" width="24" height="20" fill="#141414" />
          <rect x="30" y="20" width="16" height="6" fill="#C5A059" />
          <rect x="10" y="26" width="56" height="150" rx="2" fill="#FAF8F4" fillOpacity="0.78" stroke="#C5B9A5" strokeWidth="1.2" />
          <rect x="15" y="42" width="46" height="122" fill="#8C5E2A" fillOpacity="0.9" />
          <rect x="21" y="72" width="34" height="42" fill="#F9F7F4" />
          <text x="38" y="96" textAnchor="middle" fill="#141414" fontSize="5.5" fontFamily="Playfair Display, serif" letterSpacing="1">
            KHUSHBOO
          </text>
        </g>

        {/* Center Parfum */}
        <g transform="translate(166, 54)">
          <rect x="31" y="0" width="36" height="26" fill="#141414" />
          <rect x="37" y="26" width="24" height="8" fill="#C5A059" />
          <rect x="8" y="34" width="82" height="186" rx="3" fill="#FAF8F4" fillOpacity="0.72" stroke="#C5B9A5" strokeWidth="1.4" />
          <rect x="15" y="50" width="68" height="156" fill="#B8823B" fillOpacity="0.9" />
          <rect x="24" y="88" width="50" height="58" fill="#F9F7F4" stroke="#D2C8B6" strokeWidth="0.8" />
          <text x="49" y="116" textAnchor="middle" fill="#141414" fontSize="7.5" fontFamily="Playfair Display, serif" letterSpacing="1.4">
            KHUSHBOO
          </text>
          <text x="49" y="131" textAnchor="middle" fill="#5C564E" fontSize="5" fontFamily="Plus Jakarta Sans, sans-serif">
            COMBO TRIO
          </text>
        </g>

        {/* Right Parfum */}
        <g transform="translate(278, 92)">
          <rect x="24" y="0" width="28" height="22" fill="#141414" />
          <rect x="29" y="22" width="18" height="6" fill="#C5A059" />
          <rect x="8" y="28" width="60" height="154" rx="2" fill="#FAF8F4" fillOpacity="0.74" stroke="#C5B9A5" strokeWidth="1.2" />
          <rect x="14" y="44" width="48" height="126" fill="#9E5461" fillOpacity="0.78" />
          <rect x="21" y="76" width="34" height="44" fill="#F9F7F4" />
          <text x="38" y="100" textAnchor="middle" fill="#141414" fontSize="5.5" fontFamily="Playfair Display, serif" letterSpacing="1">
            KHUSHBOO
          </text>
        </g>
      </svg>
    );
  }

  // Default Slide 0: Amber Eau de Parfum on Travertine Plinth
  return (
    <svg
      viewBox="0 0 420 340"
      className="w-full max-w-[460px] lg:max-w-[520px] h-auto"
      role="img"
      aria-label="KHUSHBOO Signature Eau de Parfum Flacon"
    >
      <defs>
        <radialGradient id="heroWarmGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#DDD2C2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heroAmberJuice" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D7A75E" stopOpacity="0.88" />
          <stop offset="55%" stopColor="#B8823B" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#855821" stopOpacity="0.96" />
        </linearGradient>
        <linearGradient id="heroTravertine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E6DCCB" />
          <stop offset="55%" stopColor="#EFE8DA" />
          <stop offset="100%" stopColor="#D6C8B4" />
        </linearGradient>
        <linearGradient id="heroGoldNeck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9C7A3C" />
          <stop offset="50%" stopColor="#E1C688" />
          <stop offset="100%" stopColor="#8C6A2E" />
        </linearGradient>
      </defs>

      <circle cx="220" cy="155" r="145" fill="url(#heroWarmGlow)" />

      {/* Travertine Stone Plinth */}
      <polygon points="88,284 358,284 378,296 72,296" fill="url(#heroTravertine)" />
      <rect x="72" y="296" width="306" height="18" fill="#CFC1AC" />
      <ellipse cx="225" cy="316" rx="158" ry="6" fill="#141414" fillOpacity="0.12" />

      {/* White Botanical Jasmine Blossoms */}
      <g transform="translate(115, 244)">
        <circle cx="0" cy="0" r="12" fill="#FAF8F4" stroke="#E0D8C8" strokeWidth="0.8" />
        <ellipse cx="-14" cy="-6" rx="11" ry="6" transform="rotate(-25 -14 -6)" fill="#FAF8F4" />
        <ellipse cx="14" cy="-8" rx="11" ry="6" transform="rotate(28 14 -8)" fill="#F5F1E8" />
        <ellipse cx="-10" cy="11" rx="10" ry="5.5" transform="rotate(35 -10 11)" fill="#F5F1E8" />
        <circle cx="0" cy="0" r="3.5" fill="#C5A059" />
      </g>
      <g transform="translate(88, 266) scale(0.82)">
        <ellipse cx="-12" cy="-5" rx="11" ry="6" transform="rotate(-18 -12 -5)" fill="#FAF8F4" />
        <ellipse cx="12" cy="-5" rx="11" ry="6" transform="rotate(22 12 -5)" fill="#F5F1E8" />
        <ellipse cx="0" cy="10" rx="10" ry="6" fill="#FAF8F4" />
        <circle cx="0" cy="0" r="3.5" fill="#C5A059" />
      </g>

      {/* Raw Amber Resin Crystal */}
      <polygon
        points="296,284 316,258 344,264 352,286 312,292"
        fill="#9E5718"
        fillOpacity="0.88"
        stroke="#C98A42"
        strokeWidth="0.8"
      />
      <polygon points="316,258 326,274 344,264" fill="#D48D3B" fillOpacity="0.7" />

      {/* Vanilla Pods */}
      <path d="M98,288 Q155,296 202,284" fill="none" stroke="#2D241C" strokeWidth="4" strokeLinecap="round" />
      <path d="M110,293 Q162,299 208,290" fill="none" stroke="#3D3127" strokeWidth="3.2" strokeLinecap="round" />

      {/* Main Signature Glass Bottle */}
      <g transform="translate(152, 34)">
        <rect x="47" y="6" width="52" height="38" rx="2" fill="#141414" />
        <rect x="52" y="10" width="6" height="30" fill="#2A2825" />
        <rect x="58" y="44" width="30" height="12" fill="url(#heroGoldNeck)" />
        <rect
          x="12"
          y="56"
          width="122"
          height="194"
          rx="6"
          fill="#FAF8F4"
          fillOpacity="0.58"
          stroke="#C9BFA9"
          strokeWidth="1.5"
        />
        <rect x="18" y="226" width="110" height="18" rx="2" fill="#E8DFCE" fillOpacity="0.6" />
        <rect x="20" y="72" width="106" height="154" rx="3" fill="url(#heroAmberJuice)" />
        <rect x="23" y="64" width="5" height="174" fill="#FFFFFF" fillOpacity="0.45" />
        <rect x="120" y="64" width="3" height="174" fill="#FFFFFF" fillOpacity="0.3" />
        <rect x="34" y="96" width="78" height="84" fill="#F9F7F4" stroke="#D2C8B6" strokeWidth="1" />
        <text
          x="73"
          y="128"
          textAnchor="middle"
          fill="#141414"
          fontSize="10.5"
          fontFamily="Playfair Display, serif"
          letterSpacing="2.2"
        >
          KHUSHBOO
        </text>
        <line x1="52" y1="138" x2="94" y2="138" stroke="#C5A059" strokeWidth="0.9" />
        <text
          x="73"
          y="153"
          textAnchor="middle"
          fill="#5C564E"
          fontSize="6.5"
          fontFamily="Plus Jakarta Sans, sans-serif"
          letterSpacing="1.4"
        >
          EAU DE PARFUM
        </text>
      </g>
    </svg>
  );
};

export const Hero: React.FC<HeroProps> = ({ slides, onNavigateTarget }) => {
  const effectiveSlides = slides.length > 0 ? slides : [DEFAULT_FALLBACK_SLIDE];
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const safeIdx = activeIdx >= effectiveSlides.length ? 0 : activeIdx;
  const activeSlide = effectiveSlides[safeIdx];

  useEffect(() => {
    if (effectiveSlides.length <= 1 || paused) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % effectiveSlides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [effectiveSlides.length, paused]);

  const goPrev = () => {
    setActiveIdx((prev) => (prev - 1 + effectiveSlides.length) % effectiveSlides.length);
  };

  const goNext = () => {
    setActiveIdx((prev) => (prev + 1) % effectiveSlides.length);
  };

  const showCustomImage =
    Boolean(activeSlide.imageUrl) && !failedImages[`${activeSlide.id}:${activeSlide.imageUrl}`];

  return (
    <section
      className={`relative w-full min-h-[600px] lg:min-h-[700px] overflow-hidden border-b border-[#E5E0D8] flex flex-col justify-between ${
        showCustomImage
          ? 'bg-[#141414]'
          : 'bg-gradient-to-br from-[#EBE4D8] via-[#F2ECE2] to-[#DDD2C2]'
      }`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="KHUSHBOO Featured Highlights"
    >
      {/* Full-Bleed Edge-to-Edge Background Layer */}
      <div key={`bg-${activeSlide.id}`} className="absolute inset-0 w-full h-full">
        {showCustomImage ? (
          <>
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.headline}
              referrerPolicy="no-referrer"
              onError={() =>
                setFailedImages((prev) => ({
                  ...prev,
                  [`${activeSlide.id}:${activeSlide.imageUrl}`]: true,
                }))
              }
              className="w-full h-full object-cover object-center transition-opacity duration-500"
            />
            {/* Editorial contrast scrims: left & right edges softened for crisp legibility while center showcase stays clear */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-[#141414]/35 to-[#141414]/65 lg:via-[#141414]/15 lg:to-[#141414]/60"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#141414]/55 via-transparent to-transparent"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center lg:pl-44 pointer-events-none opacity-95">
            <SlideArtwork index={safeIdx} />
            <div
              aria-hidden="true"
              className="lg:hidden absolute inset-0 bg-gradient-to-r from-[#EBE4D8]/92 via-[#EBE4D8]/70 to-[#EBE4D8]/45"
            />
          </div>
        )}
      </div>

      {/* Overlaid Hero Content */}
      <div className="relative z-10 flex-1 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 pb-8 lg:pt-20 lg:pb-10 flex flex-col justify-between min-h-[600px] lg:min-h-[700px]">
        <div
          key={activeSlide.id}
          className="my-auto flex flex-col lg:flex-row lg:items-center justify-between gap-10 transition-opacity duration-300"
        >
          {/* Left Editorial Headline & CTA */}
          <div className="max-w-xl">
            <p
              className={`text-[11px] uppercase tracking-[0.22em] font-medium mb-4 ${
                showCustomImage ? 'text-[#E5D7BF]' : 'text-[#4E483F]'
              }`}
            >
              {activeSlide.kicker}
            </p>
            <h1
              className={`font-display text-[clamp(2.55rem,4.5vw,4.35rem)] leading-[1.06] font-normal text-balance mb-5 ${
                showCustomImage ? 'text-[#F9F7F4]' : 'text-[#141414]'
              }`}
            >
              {activeSlide.headline}
            </h1>
            <p
              className={`text-[15px] leading-relaxed max-w-md mb-8 ${
                showCustomImage ? 'text-[#EAE4DA]' : 'text-[#4A443C]'
              }`}
            >
              {activeSlide.subtitle}
            </p>

            <button
              type="button"
              onClick={() => onNavigateTarget(activeSlide.ctaTarget)}
              className={`inline-flex items-center gap-3 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showCustomImage
                  ? 'bg-[#F9F7F4] text-[#141414] hover:bg-[#E6DFD5]'
                  : 'bg-[#141414] text-[#F9F7F4] hover:bg-[#2A2825]'
              }`}
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Vertical Stack of 4 Minimal Outline Trust Badges */}
          <div className="flex flex-row lg:flex-col flex-wrap justify-start lg:justify-center gap-5 lg:gap-6 shrink-0">
            {(
              [
                { icon: Sparkles, label: 'FINEST\nINGREDIENTS' },
                { icon: Clock, label: 'LONG LASTING\nSCENTS' },
                { icon: Gift, label: 'ELEGANT\nPACKAGING' },
                { icon: CheckCircle2, label: 'PURE &\nAUTHENTIC' },
              ] as const
            ).map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                    showCustomImage
                      ? 'border-[#F9F7F4]/55 text-[#F9F7F4]'
                      : 'border-[#141414]/45 text-[#141414]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[1.35]" />
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.14em] leading-tight font-medium whitespace-pre-line ${
                    showCustomImage ? 'text-[#F9F7F4]' : 'text-[#2B2823]'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Overlay Controls: Pagination Dots (bottom-left) & Arrows (bottom-right) */}
        {effectiveSlides.length > 1 && (
          <div className="pt-8 flex items-center justify-between">
            <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
              {effectiveSlides.map((slide, idx) => {
                const isActive = idx === safeIdx;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide ${idx + 1}: ${slide.headline}`}
                    onClick={() => setActiveIdx(idx)}
                    className="py-2 px-0.5 cursor-pointer"
                  >
                    <span
                      className={`block h-1.5 transition-all ${
                        isActive
                          ? showCustomImage
                            ? 'w-7 bg-[#F9F7F4]'
                            : 'w-7 bg-[#141414]'
                          : showCustomImage
                            ? 'w-2.5 bg-[#F9F7F4]/40 hover:bg-[#F9F7F4]/70'
                            : 'w-2.5 bg-[#141414]/25 hover:bg-[#141414]/50'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className={`w-10 h-10 border flex items-center justify-center transition-colors cursor-pointer ${
                  showCustomImage
                    ? 'border-[#F9F7F4]/35 bg-[#141414]/45 text-[#F9F7F4] hover:bg-[#F9F7F4] hover:text-[#141414]'
                    : 'border-[#141414]/25 bg-[#F9F7F4]/65 text-[#141414] hover:bg-[#141414] hover:text-[#F9F7F4]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className={`w-10 h-10 border flex items-center justify-center transition-colors cursor-pointer ${
                  showCustomImage
                    ? 'border-[#F9F7F4]/35 bg-[#141414]/45 text-[#F9F7F4] hover:bg-[#F9F7F4] hover:text-[#141414]'
                    : 'border-[#141414]/25 bg-[#F9F7F4]/65 text-[#141414] hover:bg-[#141414] hover:text-[#F9F7F4]'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
