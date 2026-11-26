import React, { useMemo, useState } from 'react';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import type { CartCustomComboItem, Product } from '../types/store';
import { formatBDT } from '../utils/currency';
import { FlaconArt } from './FlaconArt';

interface ComboBuilderProps {
  products: Product[];
  onAddCustomCombo: (combo: Omit<CartCustomComboItem, 'cartId'>) => void;
}

type BuilderFilter = 'all' | 'attar' | 'male' | 'female';

interface DraftBundleLine {
  product: Product;
  volume: string;
  unitPrice: number;
  quantity: number;
}

function summarizeNotes(product: Product): string {
  const t = product.notes.top.split(',')[0]?.trim() || '';
  const m = product.notes.middle.split(',')[0]?.trim() || '';
  const b = product.notes.base.split(',')[0]?.trim() || '';
  return [t, m, b].filter(Boolean).join(' • ');
}

export const ComboBuilder: React.FC<ComboBuilderProps> = ({ products, onAddCustomCombo }) => {
  const [filter, setFilter] = useState<BuilderFilter>('all');
  const [selectedVolumes, setSelectedVolumes] = useState<Record<string, string>>({});
  const [bundleLines, setBundleLines] = useState<DraftBundleLine[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const availableProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filter === 'attar') return p.category === 'attar';
        if (filter === 'male') return p.category === 'perfume' && p.gender === 'male';
        if (filter === 'female') return p.category === 'perfume' && p.gender === 'female';
        return true;
      })
      .sort((a, b) => Number(b.inStock) - Number(a.inStock));
  }, [products, filter]);

  const getChosenVolume = (product: Product): string => {
    const v = selectedVolumes[product.id];
    if (v && product.variants.some((x) => x.volume === v)) return v;
    return product.variants[0]?.volume || '';
  };

  const addBottleToBundle = (product: Product) => {
    if (!product.inStock) return;
    const vol = getChosenVolume(product);
    const variant = product.variants.find((v) => v.volume === vol) || product.variants[0];
    if (!variant) return;

    setBundleLines((prev) => {
      const idx = prev.findIndex((l) => l.product.id === product.id && l.volume === variant.volume);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(20, next[idx].quantity + 1) };
        return next;
      }
      return [
        ...prev,
        {
          product,
          volume: variant.volume,
          unitPrice: variant.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateLineQuantity = (productId: string, volume: string, delta: number) => {
    setBundleLines((prev) =>
      prev
        .map((l) =>
          l.product.id === productId && l.volume === volume
            ? { ...l, quantity: l.quantity + delta }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  };

  const totalUnits = bundleLines.reduce((sum, l) => sum + l.quantity, 0);
  const originalTotal = Math.round(
    bundleLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  );
  const discountRate = totalUnits >= 3 ? 0.15 : totalUnits === 2 ? 0.1 : 0;
  const discountAmount = Math.round(originalTotal * discountRate);
  const finalPrice = Math.round(originalTotal - discountAmount);

  const handleConfirmCombo = () => {
    if (totalUnits < 2) return;
    onAddCustomCombo({
      kind: 'custom_combo',
      title: bundleName.trim() || `Custom Combo (${totalUnits} Bottles)`,
      quantity: 1,
      discountRate,
      originalTotal,
      discountAmount,
      finalPrice,
      items: bundleLines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        category: l.product.category,
        gender: l.product.gender,
        volume: l.volume,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        accentHex: l.product.accentHex,
      })),
    });
    setBundleLines([]);
    setBundleName('');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <section id="combo-builder" className="py-16 lg:py-20 bg-[#F9F7F4]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D8]">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#8C6D32] font-medium mb-2">
              CUSTOM BUNDLE STUDIO
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-[#141414]">
              Build Your Own Combo
            </h2>
          </div>
          <p className="text-sm text-[#524E46] max-w-lg">
            Mix and match any Attars, Male Perfumes, or Female Perfumes. Select 2 items to unlock{' '}
            <strong className="font-semibold text-[#141414]">10% off</strong>, or 3+ items for{' '}
            <strong className="font-semibold text-[#141414]">15% off</strong> automatically.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Interactive Fragrance Selector with Thumbnails */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {(
                [
                  { id: 'all', label: 'All Scents' },
                  { id: 'attar', label: 'Attar' },
                  { id: 'male', label: 'Perfume · Male' },
                  { id: 'female', label: 'Perfume · Female' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filter === tab.id
                      ? 'bg-[#141414] text-[#F9F7F4] border-[#141414]'
                      : 'bg-[#FAF8F4] text-[#4A4741] border-[#E5E0D8] hover:border-[#141414]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableProducts.map((product) => {
                const vol = getChosenVolume(product);
                const variant =
                  product.variants.find((v) => v.volume === vol) || product.variants[0];
                const inBundleCount = bundleLines
                  .filter((l) => l.product.id === product.id && l.volume === vol)
                  .reduce((s, l) => s + l.quantity, 0);

                const varKey = `cbvar:${product.id}:${vol}:${variant?.imageUrl}`;
                const mainKey = `cb:${product.id}:${product.imageUrl}`;
                const hasVarImg = Boolean(variant?.imageUrl) && !brokenImages[varKey];
                const hasMainImg = Boolean(product.imageUrl) && !brokenImages[mainKey];
                const resolvedThumb = hasVarImg
                  ? variant?.imageUrl
                  : hasMainImg
                    ? product.imageUrl
                    : undefined;
                const brokenKey = hasVarImg ? varKey : mainKey;

                return (
                  <div
                    key={product.id}
                    className={`bg-[#FAF8F4] border border-[#E5E0D8] p-4 flex flex-col justify-between gap-4 ${
                      !product.inStock ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-24 bg-[#EFECE6] border border-[#E5E0D8] shrink-0 overflow-hidden">
                        {resolvedThumb ? (
                          <img
                            key={`cb-${product.id}-${vol}-${resolvedThumb}`}
                            src={resolvedThumb}
                            alt={`${product.name} (${vol})`}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setBrokenImages((prev) => ({
                                ...prev,
                                [brokenKey]: true,
                              }))
                            }
                            className={`w-full h-full object-cover animate-bottle-switch ${
                              !product.inStock ? 'opacity-50 grayscale-[20%]' : ''
                            }`}
                          />
                        ) : (
                          <div
                            key={`cb-art-${product.id}-${vol}`}
                            className={`w-full h-full animate-bottle-switch ${
                              !product.inStock ? 'opacity-50 grayscale-[20%]' : ''
                            }`}
                          >
                            <FlaconArt
                              category={product.category}
                              gender={product.gender}
                              accentHex={product.accentHex}
                              name={product.name}
                              volume={vol}
                              className="w-full h-full"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#6E6A61] mb-1">
                          <span className="truncate">
                            {product.category === 'attar'
                              ? 'Attar'
                              : `Perfume · ${product.gender === 'male' ? 'Male' : 'Female'}`}
                          </span>
                          <span className="tabular-nums font-semibold text-xs text-[#141414] shrink-0">
                            {formatBDT(variant?.price ?? 0)}
                          </span>
                        </div>

                        <h3 className="font-display text-lg text-[#141414] truncate">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-[#6E685F] mt-0.5 truncate">
                          {summarizeNotes(product)}
                        </p>
                        {!product.inStock && (
                          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7F1D1D]">
                            Out of Stock
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E5E0D8]">
                      <div className="flex items-center gap-1">
                        {product.variants.map((v) => (
                          <button
                            key={v.volume}
                            type="button"
                            onClick={() =>
                              setSelectedVolumes((prev) => ({
                                ...prev,
                                [product.id]: v.volume,
                              }))
                            }
                            className={`px-2 py-1 text-[11px] font-medium tabular-nums border cursor-pointer ${
                              v.volume === vol
                                ? 'bg-[#141414] text-[#F9F7F4] border-[#141414]'
                                : 'border-[#DCD6CA] text-[#4A4741] hover:border-[#141414]'
                            }`}
                          >
                            {v.volume}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={!product.inStock}
                        onClick={() => addBottleToBundle(product)}
                        className="px-3.5 py-1.5 bg-[#141414] text-[#F9F7F4] text-xs font-medium hover:bg-[#2B2926] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {product.inStock ? (
                          <>
                            <Plus className="w-3 h-3 text-[#C5A059]" />
                            <span>{inBundleCount > 0 ? `Add (${inBundleCount})` : 'Add'}</span>
                          </>
                        ) : (
                          <span>Out of Stock</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Sticky Live Combo Summary & Discount Calculator */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 bg-[#1C1B1A] text-[#F9F7F4] border border-[#2A2A27] p-7">
            <div className="pb-5 border-b border-[#2A2A27]">
              <div className="flex items-center justify-between text-xs text-[#C5A059] mb-2">
                <span>Your Custom Combo</span>
                <span className="tabular-nums">{totalUnits} Selected</span>
              </div>
              <h3 className="font-display text-2xl font-normal text-[#F9F7F4]">
                Combo Pricing Studio
              </h3>

              <div className="mt-4 pt-3 border-t border-[#2A2A27]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#C8C2B6]">
                    {totalUnits === 0 && 'Add 2 items for 10% off · 3+ items for 15% off'}
                    {totalUnits === 1 && 'Add 1 more item to unlock 10% Combo Discount'}
                    {totalUnits === 2 && '10% Duo Savings Unlocked · Add 1 more for 15% off'}
                    {totalUnits >= 3 && '15% Signature Trio Discount Unlocked'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1.5">
                  <div className={totalUnits >= 1 ? 'bg-[#C5A059]' : 'bg-[#2A2A27]'} />
                  <div className={totalUnits >= 2 ? 'bg-[#C5A059]' : 'bg-[#2A2A27]'} />
                  <div className={totalUnits >= 3 ? 'bg-[#C5A059]' : 'bg-[#2A2A27]'} />
                </div>
              </div>
            </div>

            <div className="py-5 space-y-3 max-h-[300px] overflow-y-auto border-b border-[#2A2A27]">
              {bundleLines.length === 0 ? (
                <p className="text-xs text-[#8C877C] py-6 text-center leading-relaxed">
                  Select fragrances on the left to compose your personalized combo pack.
                </p>
              ) : (
                bundleLines.map((line) => (
                  <div
                    key={`${line.product.id}-${line.volume}`}
                    className="flex items-center justify-between gap-3 text-xs py-2 border-b border-[#2A2A27]/60 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#F9F7F4] truncate">{line.product.name}</p>
                      <p className="text-[#A39E93] tabular-nums">
                        {line.volume} · {formatBDT(line.unitPrice)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateLineQuantity(line.product.id, line.volume, -1)}
                        className="w-6 h-6 border border-[#3A3832] flex items-center justify-center hover:border-[#C5A059] cursor-pointer"
                        aria-label={`Decrease quantity of ${line.product.name}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateLineQuantity(line.product.id, line.volume, 1)}
                        className="w-6 h-6 border border-[#3A3832] flex items-center justify-center hover:border-[#C5A059] cursor-pointer"
                        aria-label={`Increase quantity of ${line.product.name}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateLineQuantity(line.product.id, line.volume, -line.quantity)
                        }
                        className="p-1 text-[#8C877C] hover:text-[#F9F7F4] cursor-pointer"
                        aria-label={`Remove ${line.product.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-5">
              <label
                htmlFor="custom-combo-name"
                className="block text-[11px] uppercase tracking-wider text-[#A39E93] mb-1.5"
              >
                Bundle Label (Optional)
              </label>
              <input
                id="custom-combo-name"
                type="text"
                maxLength={60}
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder="e.g., Signature Evening Layering"
                className="w-full px-3 py-2 bg-[#1D1C1A] border border-[#32302B] text-xs text-[#F9F7F4] placeholder:text-[#6E6A61] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <dl className="mt-5 pt-5 border-t border-[#2A2A27] space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-[#C8C2B6]">
                <dt>Original Price</dt>
                <dd className="tabular-nums">{formatBDT(originalTotal)}</dd>
              </div>
              <div className="flex items-center justify-between text-[#C5A059]">
                <dt>
                  Combo Discount{' '}
                  {discountRate > 0 ? `(${Math.round(discountRate * 100)}% Off)` : '(Min. 2 items)'}
                </dt>
                <dd className="tabular-nums">-{formatBDT(discountAmount)}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-3 border-t border-[#2A2A27]">
                <dt className="text-xs uppercase tracking-wider text-[#A39E93]">Final Combo Price</dt>
                <dd className="font-display text-3xl text-[#F9F7F4] tabular-nums">
                  {formatBDT(finalPrice)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={totalUnits < 2}
              onClick={handleConfirmCombo}
              className="mt-6 w-full py-3.5 px-5 bg-[#C5A059] text-[#141414] text-xs font-semibold uppercase tracking-wider hover:bg-[#D4B472] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Custom Combo Added to Bag</span>
                </>
              ) : totalUnits < 2 ? (
                <span>Select {2 - totalUnits} More Item{2 - totalUnits === 1 ? '' : 's'} to Unlock</span>
              ) : (
                <span>Add Custom Combo to Bag · {formatBDT(finalPrice)}</span>
              )}
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
};
