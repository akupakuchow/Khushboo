import React, { useState } from 'react';
import { ArrowRight, Check, Plus, X } from 'lucide-react';
import type { CuratedCombo, Product, SplitPromoBanners } from '../types/store';
import { formatBDT } from '../utils/currency';
import { FlaconArt } from './FlaconArt';

export type CategoryFilter = 'all' | 'attar' | 'perfume' | 'combos';
export type GenderFilter = 'all' | 'male' | 'female';

const DEFAULT_PROMO_BANNERS: SplitPromoBanners = {
  left: {
    eyebrow: 'CUSTOM BUNDLE STUDIO',
    heading: 'Build Your Own Combo',
    description:
      'Mix any Attars and Perfumes. Unlock 10% off 2 bottles or 15% off 3+ bottles automatically.',
    buttonLabel: 'BUILD YOUR COMBO',
  },
  right: {
    eyebrow: 'THE ART OF GIFTING',
    heading: 'Curated Combos',
    description:
      'Beautifully paired Attar and Eau de Parfum coffrets offered at exclusive seasonal savings.',
    buttonLabel: 'SHOP CURATED COMBOS',
  },
};

interface CatalogSectionProps {
  products: Product[];
  curatedCombos: CuratedCombo[];
  promoBanners?: SplitPromoBanners;
  categoryFilter: CategoryFilter;
  genderFilter: GenderFilter;
  searchQuery: string;
  onChangeCategory: (cat: CategoryFilter) => void;
  onChangeGender: (gender: GenderFilter) => void;
  onAddSingle: (product: Product, volume: string) => void;
  onAddCuratedCombo: (combo: CuratedCombo) => void;
  onJumpToBuilder: () => void;
  onJumpToCurated: () => void;
}

function summarizeNotes(product: Product): string {
  const firstTop = product.notes.top.split(',')[0]?.trim() || '';
  const firstMid = product.notes.middle.split(',')[0]?.trim() || '';
  const firstBase = product.notes.base.split(',')[0]?.trim() || '';
  return [firstTop, firstMid, firstBase].filter(Boolean).join(' • ');
}

const ComboCoffretFallback: React.FC<{ title: string }> = ({ title }) => (
  <div
    className="w-full h-full flex items-center justify-center bg-[#EFECE6]"
    aria-label={`${title} coffret`}
  >
    <svg viewBox="0 0 260 200" className="w-4/5 h-4/5" aria-hidden="true">
      <rect x="26" y="34" width="208" height="136" fill="#E3DDD2" stroke="#C9BFA9" strokeWidth="1" />
      <rect x="34" y="42" width="192" height="120" fill="#FAF8F4" stroke="#DDD6C8" strokeWidth="0.8" />
      {/* Left Bottle */}
      <g transform="translate(66, 56)">
        <rect x="16" y="0" width="20" height="16" fill="#141414" />
        <rect x="19" y="16" width="14" height="5" fill="#C5A059" />
        <rect x="6" y="21" width="40" height="72" rx="2" fill="#8C5E2A" fillOpacity="0.9" stroke="#C5B9A5" />
        <rect x="12" y="38" width="28" height="32" fill="#F9F7F4" />
        <text x="26" y="57" textAnchor="middle" fill="#141414" fontSize="5" fontFamily="Playfair Display, serif" letterSpacing="0.8">
          KHUSHBOO
        </text>
      </g>
      {/* Right Bottle */}
      <g transform="translate(136, 52)">
        <rect x="18" y="0" width="22" height="18" fill="#141414" />
        <rect x="22" y="18" width="14" height="5" fill="#C5A059" />
        <rect x="6" y="23" width="46" height="76" rx="2" fill="#3A3A38" fillOpacity="0.9" stroke="#C5B9A5" />
        <rect x="13" y="42" width="32" height="34" fill="#F9F7F4" />
        <text x="29" y="61" textAnchor="middle" fill="#141414" fontSize="5" fontFamily="Playfair Display, serif" letterSpacing="0.8">
          KHUSHBOO
        </text>
      </g>
    </svg>
  </div>
);

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  curatedCombos,
  promoBanners,
  categoryFilter,
  genderFilter,
  searchQuery,
  onChangeCategory,
  onChangeGender,
  onAddSingle,
  onAddCuratedCombo,
  onJumpToBuilder,
  onJumpToCurated,
}) => {
  const [selectedVolumes, setSelectedVolumes] = useState<Record<string, string>>({});
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const leftBanner = promoBanners?.left || DEFAULT_PROMO_BANNERS.left;
  const rightBanner = promoBanners?.right || DEFAULT_PROMO_BANNERS.right;

  const getSelectedVolume = (product: Product): string => {
    const chosen = selectedVolumes[product.id];
    if (chosen && product.variants.some((v) => v.volume === chosen)) {
      return chosen;
    }
    return product.variants[1]?.volume || product.variants[0]?.volume || '';
  };

  const triggerAddedFeedback = (key: string) => {
    setAddedFeedback(key);
    setTimeout(() => {
      setAddedFeedback((curr) => (curr === key ? null : curr));
    }, 1100);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchingProducts = products.filter((p) => {
    if (categoryFilter === 'combos') return false;
    if (categoryFilter === 'attar' && p.category !== 'attar') return false;
    if (categoryFilter === 'perfume') {
      if (p.category !== 'perfume') return false;
      if (genderFilter === 'male' && p.gender !== 'male') return false;
      if (genderFilter === 'female' && p.gender !== 'female') return false;
    }
    if (normalizedQuery) {
      const hay = `${p.name} ${p.subtitle} ${p.category} ${p.gender || ''} ${p.notes.top} ${p.notes.middle} ${p.notes.base}`.toLowerCase();
      if (!hay.includes(normalizedQuery)) return false;
    }
    return true;
  });

  const isDefaultFeaturedView =
    categoryFilter === 'all' && !normalizedQuery && !showAllProducts;
  const visibleProducts = isDefaultFeaturedView
    ? matchingProducts.slice(0, 5)
    : matchingProducts;

  const productLookup = new Map(products.map((p) => [p.id, p]));

  const computeComboOriginal = (combo: CuratedCombo): number => {
    return combo.items.reduce((sum, ref) => {
      const prod = productLookup.get(ref.productId);
      const variant = prod?.variants.find((v) => v.volume === ref.volume);
      return sum + (variant ? variant.price * ref.quantity : 0);
    }, 0);
  };

  const sectionHeading =
    categoryFilter === 'attar'
      ? 'ATTAR COLLECTION'
      : categoryFilter === 'perfume'
        ? genderFilter === 'male'
          ? "MEN'S PERFUMES"
          : genderFilter === 'female'
            ? "WOMEN'S PERFUMES"
            : 'EAU DE PARFUMS'
        : showAllProducts || normalizedQuery
          ? 'ALL FRAGRANCES'
          : 'FEATURED FRAGRANCES';

  return (
    <>
      <section id="collection" className="py-12 lg:py-16 bg-[#F9F7F4]">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#141414]">
                {sectionHeading}
              </h2>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'attar', label: 'Attar' },
                    { id: 'perfume', label: 'Perfume' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onChangeCategory(tab.id);
                      if (tab.id !== 'all') setShowAllProducts(true);
                    }}
                    className={`px-3 py-1 text-[11px] uppercase tracking-[0.12em] font-medium border transition-colors cursor-pointer ${
                      categoryFilter === tab.id
                        ? 'bg-[#141414] text-[#F9F7F4] border-[#141414]'
                        : 'bg-transparent text-[#5C564E] border-[#E0DAD0] hover:border-[#141414]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                {categoryFilter === 'perfume' && (
                  <>
                    <span className="text-[#C7C0B4] mx-1">|</span>
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'male', label: 'Male' },
                        { id: 'female', label: 'Female' },
                      ] as const
                    ).map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => onChangeGender(sub.id)}
                        className={`px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] font-medium border transition-colors cursor-pointer ${
                          genderFilter === sub.id
                            ? 'bg-[#C5A059] text-[#141414] border-[#C5A059]'
                            : 'bg-transparent text-[#5C564E] border-[#E0DAD0] hover:border-[#141414]'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (categoryFilter !== 'all') {
                  onChangeCategory('all');
                  onChangeGender('all');
                  setShowAllProducts(true);
                } else {
                  setShowAllProducts((v) => !v);
                }
              }}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-medium text-[#141414] hover:opacity-65 transition-opacity whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto"
            >
              <span>
                {isDefaultFeaturedView ? 'VIEW ALL FRAGRANCES' : 'SHOW FEATURED ONLY'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4-to-5 Column Product Grid */}
          {visibleProducts.length === 0 ? (
            <div className="border border-[#E5E0D8] bg-[#FAF8F4] p-12 text-center text-sm text-[#5C564E]">
              No fragrances matched your filter. Try clearing your search or switching categories.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {visibleProducts.map((product) => {
                const activeVol = getSelectedVolume(product);
                const activeVariant =
                  product.variants.find((v) => v.volume === activeVol) || product.variants[0];
                const isAdded = addedFeedback === `${product.id}:${activeVol}`;

                const variantImgKey = `var:${product.id}:${activeVariant?.volume}:${activeVariant?.imageUrl}`;
                const mainImgKey = `prod:${product.id}:${product.imageUrl}`;
                const hasVariantImg = Boolean(activeVariant?.imageUrl) && !brokenImages[variantImgKey];
                const hasMainImg = Boolean(product.imageUrl) && !brokenImages[mainImgKey];
                const resolvedImg = hasVariantImg
                  ? activeVariant?.imageUrl
                  : hasMainImg
                    ? product.imageUrl
                    : undefined;
                const activeBrokenKey = hasVariantImg ? variantImgKey : mainImgKey;

                return (
                  <article key={product.id} className="group flex flex-col">
                    {/* Soft Neutral Image Frame */}
                    <div
                      onClick={() => setInspectedProduct(product)}
                      className="relative bg-[#EFECE6] aspect-[4/5] overflow-hidden cursor-pointer border border-[#E7E2D8]"
                    >
                      {resolvedImg ? (
                        <img
                          key={`${product.id}-${activeVariant?.volume}-${resolvedImg}`}
                          src={resolvedImg}
                          alt={`${product.name} (${activeVariant?.volume || ''})`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenImages((prev) => ({
                              ...prev,
                              [activeBrokenKey]: true,
                            }))
                          }
                          className={`w-full h-full object-cover animate-bottle-switch transition-all duration-300 group-hover:scale-[1.03] ${
                            !product.inStock ? 'opacity-50 grayscale-[20%]' : ''
                          }`}
                        />
                      ) : (
                        <div
                          key={`${product.id}-${activeVariant?.volume}-art`}
                          className={`w-full h-full animate-bottle-switch transition-all duration-300 ${
                            !product.inStock ? 'opacity-50 grayscale-[20%]' : ''
                          }`}
                        >
                          <FlaconArt
                            category={product.category}
                            gender={product.gender}
                            accentHex={product.accentHex}
                            name={product.name}
                            volume={activeVariant?.volume}
                            className="w-full h-full"
                          />
                        </div>
                      )}

                      {!product.inStock && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="px-3.5 py-1.5 bg-[#141414]/90 text-[#F9F7F4] text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F4]/20">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}

                      {/* Volume Chips at bottom of image box */}
                      <div
                        className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {product.variants.map((variant) => {
                          const selected = variant.volume === activeVariant?.volume;
                          return (
                            <button
                              key={variant.volume}
                              type="button"
                              onClick={() =>
                                setSelectedVolumes((prev) => ({
                                  ...prev,
                                  [product.id]: variant.volume,
                                }))
                              }
                              className={`px-2 py-0.5 text-[10px] font-medium tabular-nums transition-colors cursor-pointer ${
                                selected
                                  ? 'bg-[#141414] text-[#F9F7F4]'
                                  : 'bg-[#F9F7F4]/90 text-[#4E483F] hover:bg-[#F9F7F4]'
                              }`}
                            >
                              {variant.volume}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Product Info & Bottom Price + Circular Black + Quick-Add */}
                    <div className="pt-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <button
                          type="button"
                          onClick={() => setInspectedProduct(product)}
                          className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#141414] hover:opacity-70 cursor-pointer block truncate w-full"
                        >
                          {product.name}
                        </button>
                        <p className="text-[11px] text-[#6E685F] mt-1 truncate">
                          {summarizeNotes(product)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[#141414] tabular-nums">
                          {formatBDT(activeVariant?.price ?? 0)}
                        </span>

                        <button
                          type="button"
                          disabled={!product.inStock}
                          onClick={() => {
                            if (!activeVariant) return;
                            onAddSingle(product, activeVariant.volume);
                            triggerAddedFeedback(`${product.id}:${activeVariant.volume}`);
                          }}
                          aria-label={`Add ${product.name} (${activeVariant?.volume}) to bag`}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            isAdded
                              ? 'bg-[#8C6D32] text-[#F9F7F4]'
                              : 'bg-[#141414] text-[#F9F7F4] hover:bg-[#2F2C28]'
                          }`}
                        >
                          {isAdded ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Split Dual-Banner Section (Admin-Editable Full-Bleed Cards) */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Dark Charcoal #1C1B1A */}
            {(() => {
              const hasLeftImg =
                Boolean(leftBanner.imageUrl) && !brokenImages[`promo-left:${leftBanner.imageUrl}`];
              return (
                <div className="relative overflow-hidden min-h-[340px] lg:min-h-[400px] bg-[#1C1B1A] text-[#F9F7F4] flex items-center">
                  {hasLeftImg ? (
                    <>
                      <img
                        src={leftBanner.imageUrl}
                        alt={leftBanner.heading}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [`promo-left:${leftBanner.imageUrl}`]: true,
                          }))
                        }
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent"
                      />
                    </>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="hidden sm:flex absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <svg viewBox="0 0 210 170" className="w-52 h-auto">
                        <rect x="18" y="22" width="174" height="126" fill="#141414" stroke="#36332E" strokeWidth="1" />
                        <rect x="28" y="34" width="154" height="44" fill="#181715" stroke="#2D2A25" strokeWidth="0.8" />
                        <text
                          x="105"
                          y="60"
                          textAnchor="middle"
                          fill="#D4B87C"
                          fontSize="10"
                          fontFamily="Playfair Display, serif"
                          letterSpacing="2.4"
                        >
                          KHUSHBOO
                        </text>
                        {[42, 78, 114, 150].map((x, idx) => (
                          <g key={x} transform={`translate(${x}, 86)`}>
                            <rect x="4" y="0" width="10" height="8" fill="#C5A059" />
                            <rect
                              x="1"
                              y="8"
                              width="16"
                              height="44"
                              rx="1"
                              fill={idx % 2 === 0 ? '#7A5124' : '#3C4A42'}
                              stroke="#444038"
                              strokeWidth="0.8"
                            />
                            <rect x="3" y="20" width="12" height="18" fill="#F9F7F4" />
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}

                  <div className="relative z-10 p-8 sm:p-10 lg:p-12 max-w-[390px] space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-medium">
                      {leftBanner.eyebrow}
                    </p>
                    <h3 className="font-display text-3xl sm:text-4xl font-normal leading-tight text-[#F9F7F4]">
                      {leftBanner.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#E5E0D8] leading-relaxed">
                      {leftBanner.description}
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onJumpToBuilder}
                        className="inline-flex items-center gap-2.5 px-5 py-3 bg-[#F9F7F4] text-[#141414] text-[10px] font-semibold uppercase tracking-[0.18em] hover:bg-[#E6DFD5] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>{leftBanner.buttonLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Right Card: Warm Sand #E6DFD5 */}
            {(() => {
              const hasRightImg =
                Boolean(rightBanner.imageUrl) &&
                !brokenImages[`promo-right:${rightBanner.imageUrl}`];
              return (
                <div className="relative overflow-hidden min-h-[340px] lg:min-h-[400px] bg-[#E6DFD5] text-[#141414] flex items-center">
                  {hasRightImg ? (
                    <>
                      <img
                        src={rightBanner.imageUrl}
                        alt={rightBanner.heading}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [`promo-right:${rightBanner.imageUrl}`]: true,
                          }))
                        }
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-r from-[#EFECE6]/90 via-[#EFECE6]/55 to-transparent"
                      />
                    </>
                  ) : (
                    <div
                      aria-hidden="true"
                      className="hidden sm:flex absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <svg viewBox="0 0 210 170" className="w-52 h-auto">
                        <rect x="20" y="34" width="106" height="114" fill="#D5C8B8" stroke="#BFB09E" strokeWidth="1" />
                        <rect x="16" y="28" width="114" height="22" fill="#DDD2C3" stroke="#BFB09E" strokeWidth="1" />
                        <text
                          x="73"
                          y="72"
                          textAnchor="middle"
                          fill="#141414"
                          fontSize="8.5"
                          fontFamily="Playfair Display, serif"
                          letterSpacing="2"
                        >
                          KHUSHBOO
                        </text>
                        <rect x="16" y="108" width="114" height="10" fill="#141414" />
                        <path d="M73 112 C56 96, 46 112, 68 116 Z" fill="#141414" />
                        <path d="M73 112 C90 96, 100 112, 78 116 Z" fill="#141414" />
                        <rect x="142" y="54" width="24" height="16" fill="#141414" />
                        <rect x="147" y="70" width="14" height="6" fill="#C5A059" />
                        <rect x="126" y="76" width="56" height="76" rx="2" fill="#FAF8F4" stroke="#B5AA99" strokeWidth="1" />
                        <rect x="131" y="84" width="46" height="58" fill="#B8823B" fillOpacity="0.88" />
                        <rect x="137" y="96" width="34" height="32" fill="#F9F7F4" />
                        <text
                          x="154"
                          y="114"
                          textAnchor="middle"
                          fill="#141414"
                          fontSize="5"
                          fontFamily="Playfair Display, serif"
                          letterSpacing="0.8"
                        >
                          KHUSHBOO
                        </text>
                      </svg>
                    </div>
                  )}

                  <div className="relative z-10 p-8 sm:p-10 lg:p-12 max-w-[390px] space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#5C564E] font-medium">
                      {rightBanner.eyebrow}
                    </p>
                    <h3 className="font-display text-3xl sm:text-4xl font-normal leading-tight text-[#141414]">
                      {rightBanner.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#36322C] leading-relaxed">
                      {rightBanner.description}
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onJumpToCurated}
                        className="inline-flex items-center gap-2.5 px-5 py-3 bg-[#141414] text-[#F9F7F4] text-[10px] font-semibold uppercase tracking-[0.18em] hover:bg-[#2A2825] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>{rightBanner.buttonLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Curated Combos Grid with Clean Luxury Image Frames */}
          <div id="curated-combos" className="mt-16 pt-12 border-t border-[#E5E0D8]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C6D32] font-medium mb-1.5">
                  CURATED OFFERS
                </p>
                <h2 className="font-display text-3xl text-[#141414]">
                  Pre-Made Attar &amp; Perfume Combos
                </h2>
              </div>
              <p className="text-xs text-[#5C564E] max-w-md">
                Signature gift sets and layering duos crafted with promotional bundle pricing.
              </p>
            </div>

            {curatedCombos.length === 0 ? (
              <div className="border border-[#E5E0D8] bg-[#FAF8F4] p-10 text-center text-sm text-[#5C564E]">
                New curated combos are coming soon. Use Build Your Own Combo below to create a
                custom bundle.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {curatedCombos.map((combo) => {
                  const originalTotal = computeComboOriginal(combo);
                  const savings = Math.max(0, originalTotal - combo.comboPrice);
                  const savingsPct =
                    originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;
                  const isAdded = addedFeedback === `combo:${combo.id}`;
                  const hasComboImg =
                    Boolean(combo.imageUrl) && !brokenImages[`combo:${combo.id}:${combo.imageUrl}`];

                  return (
                    <article
                      key={combo.id}
                      className="group bg-[#FAF8F4] border border-[#E5E0D8] flex flex-col justify-between overflow-hidden"
                    >
                      {/* Clean Luxury Combo Image Frame */}
                      <div className="relative bg-[#EFECE6] aspect-[4/3] overflow-hidden border-b border-[#E5E0D8]">
                        {hasComboImg ? (
                          <img
                            src={combo.imageUrl}
                            alt={combo.title}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setBrokenImages((prev) => ({
                                ...prev,
                                [`combo:${combo.id}:${combo.imageUrl}`]: true,
                              }))
                            }
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <ComboCoffretFallback title={combo.title} />
                        )}
                      </div>

                      <div className="p-7 flex-1 flex flex-col justify-between gap-6">
                        <div>
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#8C6D32] pb-3.5 border-b border-[#E5E0D8]">
                            <span>{combo.tag || 'Curated Set'}</span>
                            {savingsPct > 0 && (
                              <span className="tabular-nums font-medium">Save {savingsPct}%</span>
                            )}
                          </div>

                          <h3 className="font-display text-2xl text-[#141414] mt-4">
                            {combo.title}
                          </h3>
                          <p className="text-xs text-[#6E685F] mt-1">{combo.subtitle}</p>
                          <p className="text-xs text-[#4A443C] leading-relaxed mt-3">
                            {combo.description}
                          </p>

                          <div className="mt-5 pt-4 border-t border-[#E5E0D8] space-y-2">
                            {combo.items.map((ref, idx) => {
                              const prod = productLookup.get(ref.productId);
                              const variant = prod?.variants.find((v) => v.volume === ref.volume);
                              return (
                                <div
                                  key={`${ref.productId}-${ref.volume}-${idx}`}
                                  className="flex items-center justify-between text-xs text-[#141414]"
                                >
                                  <span>
                                    {ref.quantity}× {prod?.name || ref.productId}{' '}
                                    <span className="text-[#6E685F]">({ref.volume})</span>
                                  </span>
                                  <span className="tabular-nums text-[#6E685F]">
                                    {formatBDT((variant?.price || 0) * ref.quantity)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-medium text-[#141414] tabular-nums">
                                {formatBDT(combo.comboPrice)}
                              </span>
                              {originalTotal > combo.comboPrice && (
                                <span className="text-xs text-[#8C877C] line-through tabular-nums">
                                  {formatBDT(originalTotal)}
                                </span>
                              )}
                            </div>
                            {savings > 0 && (
                              <span className="text-[11px] text-[#8C6D32] tabular-nums">
                                Save {formatBDT(savings)}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onAddCuratedCombo(combo);
                              triggerAddedFeedback(`combo:${combo.id}`);
                            }}
                            className={`px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? 'bg-[#8C6D32] text-[#F9F7F4]'
                                : 'bg-[#141414] text-[#F9F7F4] hover:bg-[#2F2C28]'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Combo</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Detail Quick Modal with Animated Variant Image Switching */}
      {inspectedProduct && (() => {
        const modalVol = getSelectedVolume(inspectedProduct);
        const modalVariant =
          inspectedProduct.variants.find((v) => v.volume === modalVol) ||
          inspectedProduct.variants[0];
        const modalVarKey = `mvar:${inspectedProduct.id}:${modalVariant?.volume}:${modalVariant?.imageUrl}`;
        const modalMainKey = `modal:${inspectedProduct.id}:${inspectedProduct.imageUrl}`;
        const hasModalVarImg = Boolean(modalVariant?.imageUrl) && !brokenImages[modalVarKey];
        const hasModalMainImg = Boolean(inspectedProduct.imageUrl) && !brokenImages[modalMainKey];
        const resolvedModalImg = hasModalVarImg
          ? modalVariant?.imageUrl
          : hasModalMainImg
            ? inspectedProduct.imageUrl
            : undefined;
        const modalBrokenKey = hasModalVarImg ? modalVarKey : modalMainKey;

        return (
          <div
            className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={inspectedProduct.name}
            onClick={() => setInspectedProduct(null)}
          >
            <div
              className="bg-[#FAF8F4] border border-[#E5E0D8] max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative min-h-[290px] bg-[#EFECE6] border-b md:border-b-0 md:border-r border-[#E5E0D8] overflow-hidden">
                {resolvedModalImg ? (
                  <img
                    key={`modal-${inspectedProduct.id}-${modalVariant?.volume}-${resolvedModalImg}`}
                    src={resolvedModalImg}
                    alt={`${inspectedProduct.name} (${modalVol})`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setBrokenImages((prev) => ({
                        ...prev,
                        [modalBrokenKey]: true,
                      }))
                    }
                    className={`w-full h-full object-cover animate-bottle-switch transition-all duration-300 ${
                      !inspectedProduct.inStock ? 'opacity-50 grayscale-[20%]' : ''
                    }`}
                  />
                ) : (
                  <div
                    key={`modal-art-${inspectedProduct.id}-${modalVol}`}
                    className={`w-full h-full animate-bottle-switch transition-all duration-300 ${
                      !inspectedProduct.inStock ? 'opacity-50 grayscale-[20%]' : ''
                    }`}
                  >
                    <FlaconArt
                      category={inspectedProduct.category}
                      gender={inspectedProduct.gender}
                      accentHex={inspectedProduct.accentHex}
                      name={inspectedProduct.name}
                      volume={modalVol}
                      className="w-full h-full"
                    />
                  </div>
                )}

                {!inspectedProduct.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="px-4 py-2 bg-[#141414]/90 text-[#F9F7F4] text-[11px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F4]/20">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>
            <div className="p-7 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] text-[#8C6D32] uppercase tracking-[0.16em]">
                      {inspectedProduct.origin}
                    </p>
                    <h3 className="font-display text-3xl text-[#141414] mt-1">
                      {inspectedProduct.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectedProduct(null)}
                    className="p-1.5 text-[#5C564E] hover:text-[#141414] cursor-pointer"
                    aria-label="Close product detail"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#6E685F] mt-1">{inspectedProduct.concentration}</p>
                <p className="text-sm text-[#3C3933] leading-relaxed mt-4">
                  {inspectedProduct.description}
                </p>

                <dl className="mt-5 pt-4 border-t border-[#E5E0D8] space-y-2 text-xs">
                  <div>
                    <dt className="text-[#8C6D32] font-medium">Top Notes</dt>
                    <dd className="text-[#141414]">{inspectedProduct.notes.top}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8C6D32] font-medium">Heart Notes</dt>
                    <dd className="text-[#141414]">{inspectedProduct.notes.middle}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8C6D32] font-medium">Base Notes</dt>
                    <dd className="text-[#141414]">{inspectedProduct.notes.base}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E5E0D8]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {inspectedProduct.variants.map((v) => {
                      const active = v.volume === getSelectedVolume(inspectedProduct);
                      return (
                        <button
                          key={v.volume}
                          type="button"
                          onClick={() =>
                            setSelectedVolumes((prev) => ({
                              ...prev,
                              [inspectedProduct.id]: v.volume,
                            }))
                          }
                          className={`px-2.5 py-1 text-xs border tabular-nums cursor-pointer ${
                            active
                              ? 'bg-[#141414] text-[#F9F7F4] border-[#141414]'
                              : 'border-[#DCD6CA] text-[#4A443C]'
                          }`}
                        >
                          {v.volume}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-lg font-semibold tabular-nums text-[#141414]">
                    {formatBDT(
                      inspectedProduct.variants.find(
                        (v) => v.volume === getSelectedVolume(inspectedProduct)
                      )?.price ?? 0
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!inspectedProduct.inStock}
                  onClick={() => {
                    const vol = getSelectedVolume(inspectedProduct);
                    onAddSingle(inspectedProduct, vol);
                    setInspectedProduct(null);
                  }}
                  className="w-full py-3 bg-[#141414] text-[#F9F7F4] text-[11px] font-medium tracking-[0.16em] uppercase hover:bg-[#2B2926] transition-colors cursor-pointer disabled:opacity-45"
                >
                  {inspectedProduct.inStock ? 'Add to Bag' : 'Out of Stock'}
                </button>
              </div>
            </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
