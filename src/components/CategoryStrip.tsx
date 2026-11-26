import React from 'react';
import type { CategoryFilter, GenderFilter } from './CatalogSection';

interface CategoryStripProps {
  onSelectCategory: (
    sectionId: string,
    filterPreset?: { category?: CategoryFilter; gender?: GenderFilter }
  ) => void;
}

export const CategoryStrip: React.FC<CategoryStripProps> = ({ onSelectCategory }) => {
  const items: Array<{
    label: string;
    sectionId: string;
    filterPreset?: { category?: CategoryFilter; gender?: GenderFilter };
    icon: React.ReactNode;
  }> = [
    {
      label: 'ATTAR',
      sectionId: 'collection',
      filterPreset: { category: 'attar' },
      icon: (
        <svg viewBox="0 0 36 36" className="w-8 h-8 stroke-[#141414]" fill="none" strokeWidth="1.2">
          <rect x="15" y="4" width="6" height="6" />
          <path d="M13 10h10l3 5v15a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V15l3-5Z" />
          <rect x="13" y="18" width="10" height="8" />
        </svg>
      ),
    },
    {
      label: "MEN'S PERFUME",
      sectionId: 'collection',
      filterPreset: { category: 'perfume', gender: 'male' },
      icon: (
        <svg viewBox="0 0 36 36" className="w-8 h-8 stroke-[#141414]" fill="none" strokeWidth="1.2">
          <rect x="13" y="4" width="10" height="6" />
          <rect x="8" y="10" width="20" height="22" rx="1" />
          <rect x="12" y="16" width="12" height="9" />
        </svg>
      ),
    },
    {
      label: "WOMEN'S PERFUME",
      sectionId: 'collection',
      filterPreset: { category: 'perfume', gender: 'female' },
      icon: (
        <svg viewBox="0 0 36 36" className="w-8 h-8 stroke-[#141414]" fill="none" strokeWidth="1.2">
          <rect x="14" y="4" width="8" height="6" rx="1" />
          <path d="M12 10h12l2 20a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2l2-20Z" />
          <rect x="13" y="17" width="10" height="7" />
        </svg>
      ),
    },
    {
      label: 'CURATED COMBOS',
      sectionId: 'curated-combos',
      icon: (
        <svg viewBox="0 0 36 36" className="w-8 h-8 stroke-[#141414]" fill="none" strokeWidth="1.2">
          <rect x="6" y="13" width="24" height="18" />
          <path d="M5 13h26v-4H5v4Z" />
          <line x1="18" y1="9" x2="18" y2="31" />
          <path d="M18 9c-2.5-3-6-2-6 0s3.5 0 6 0Zm0 0c2.5-3 6-2 6 0s-3.5 0-6 0Z" />
        </svg>
      ),
    },
    {
      label: 'BUILD YOUR COMBO',
      sectionId: 'combo-builder',
      icon: (
        <svg viewBox="0 0 36 36" className="w-8 h-8 stroke-[#141414]" fill="none" strokeWidth="1.2">
          <rect x="5" y="12" width="7" height="19" rx="1" />
          <rect x="14.5" y="9" width="7" height="22" rx="1" />
          <rect x="24" y="12" width="7" height="19" rx="1" />
          <line x1="7" y1="9" x2="10" y2="9" />
          <line x1="16.5" y1="6" x2="19.5" y2="6" />
          <line x1="26" y1="9" x2="29" y2="9" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-[#FAF8F4] border-b border-[#E5E0D8]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E0D8] border-x border-[#E5E0D8]">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectCategory(item.sectionId, item.filterPreset)}
              className="py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-[#EFECE6]/70 transition-colors cursor-pointer group"
            >
              <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
                {item.icon}
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-medium text-[#141414] text-center">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
