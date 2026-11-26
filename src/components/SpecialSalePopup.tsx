import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { HeroCtaTarget, SpecialSaleAd } from '../types/store';

interface SpecialSalePopupProps {
  ad: SpecialSaleAd;
  onDismiss: () => void;
  onNavigateTarget: (target: HeroCtaTarget) => void;
}

function isSafeExternalUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('https://') || url.startsWith('http://');
}

export const SpecialSalePopup: React.FC<SpecialSalePopupProps> = ({
  ad,
  onDismiss,
  onNavigateTarget,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (!ad.active) return null;

  const hasImage = Boolean(ad.imageUrl) && !imgFailed;

  const handleCtaClick = () => {
    const custom = ad.customUrl?.trim();
    if (custom) {
      if (custom.startsWith('#')) {
        const el = document.getElementById(custom.slice(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        onDismiss();
        return;
      }
      if (custom.startsWith('/') && !custom.startsWith('//')) {
        window.history.pushState({}, '', custom);
        window.dispatchEvent(new PopStateEvent('popstate'));
        onDismiss();
        return;
      }
    }
    onNavigateTarget(ad.ctaTarget);
    onDismiss();
  };

  return (
    <aside
      role="dialog"
      aria-label={ad.title}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[390px] bg-[#1C1B1A] text-[#F9F7F4] border border-[#34312C] shadow-2xl overflow-hidden"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close special offer"
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-[#141414]/80 text-[#F9F7F4] border border-[#F9F7F4]/20 hover:bg-[#F9F7F4] hover:text-[#141414] flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Optional Promotional Banner Image */}
      {hasImage && (
        <div className="w-full aspect-[16/9] bg-[#141414] border-b border-[#2E2C27] overflow-hidden">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#C5A059] font-medium pr-8">
          {ad.eyebrow}
        </p>

        <h3 className="font-display text-2xl font-normal leading-snug text-[#F9F7F4]">
          {ad.title}
        </h3>

        <p className="text-xs text-[#C7C1B8] leading-relaxed">{ad.offerText}</p>

        <div className="pt-2">
          {isSafeExternalUrl(ad.customUrl) ? (
            <a
              href={ad.customUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onDismiss}
              className="w-full py-3 px-5 bg-[#F9F7F4] text-[#141414] text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-[#E6DFD5] transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>{ad.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={handleCtaClick}
              className="w-full py-3 px-5 bg-[#F9F7F4] text-[#141414] text-[11px] font-semibold uppercase tracking-[0.18em] hover:bg-[#E6DFD5] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{ad.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
