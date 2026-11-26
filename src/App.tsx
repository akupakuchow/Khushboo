import { useCallback, useEffect, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { CartDrawer } from './components/CartDrawer';
import { CatalogSection, type CategoryFilter, type GenderFilter } from './components/CatalogSection';
import { CategoryStrip } from './components/CategoryStrip';
import { CheckoutModal } from './components/CheckoutModal';
import { ComboBuilder } from './components/ComboBuilder';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { SpecialSalePopup } from './components/SpecialSalePopup';
import { TrustFooter } from './components/TrustFooter';
import type {
  CartCustomComboItem,
  CartItem,
  CatalogResponse,
  CuratedCombo,
  HeroCtaTarget,
  Product,
} from './types/store';

const BAG_STORAGE_KEY = 'khushboo_bag_bdt_v1';

export default function App() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(BAG_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [saleDismissed, setSaleDismissed] = useState(false);

  const isAdminRoute = pathname.startsWith('/admin');

  const fetchCatalog = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch('/api/catalog');
      if (!res.ok) throw new Error('Catalog unavailable');
      const data = (await res.json()) as CatalogResponse;
      setCatalog(data);
    } catch {
      setLoadError('Unable to load the KHUSHBOO fragrance catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigateToPath = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setPathname(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (
    sectionId: string,
    filterPreset?: { category?: CategoryFilter; gender?: GenderFilter }
  ) => {
    if (filterPreset?.category) setCategoryFilter(filterPreset.category);
    if (filterPreset?.gender) setGenderFilter(filterPreset.gender);
    else if (filterPreset?.category === 'attar') setGenderFilter('all');

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroTarget = (target: HeroCtaTarget) => {
    if (target === 'attar') {
      handleNavigateSection('collection', { category: 'attar' });
    } else if (target === 'perfume-male') {
      handleNavigateSection('collection', { category: 'perfume', gender: 'male' });
    } else if (target === 'perfume-female') {
      handleNavigateSection('collection', { category: 'perfume', gender: 'female' });
    } else if (target === 'curated-combos') {
      handleNavigateSection('curated-combos');
    } else if (target === 'combo-builder') {
      handleNavigateSection('combo-builder');
    } else {
      handleNavigateSection('collection', { category: 'all' });
    }
  };

  const handleAddSingle = (product: Product, volume: string) => {
    const variant = product.variants.find((v) => v.volume === volume) || product.variants[0];
    if (!variant) return;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.kind === 'single' &&
          item.productId === product.id &&
          item.volume === variant.volume
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        const curr = next[existingIdx];
        if (curr.kind === 'single') {
          next[existingIdx] = { ...curr, quantity: curr.quantity + 1 };
        }
        return next;
      }
      return [
        ...prev,
        {
          kind: 'single',
          cartId: `single-${product.id}-${variant.volume}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          gender: product.gender,
          volume: variant.volume,
          unitPrice: variant.price,
          quantity: 1,
          accentHex: product.accentHex,
        },
      ];
    });
  };

  const handleAddCuratedCombo = (combo: CuratedCombo) => {
    const products = catalog?.products || [];
    const prodMap = new Map(products.map((p) => [p.id, p]));
    let originalTotal = 0;
    const resolvedItems = combo.items.map((ref) => {
      const p = prodMap.get(ref.productId);
      const v = p?.variants.find((x) => x.volume === ref.volume);
      originalTotal += (v?.price || 0) * ref.quantity;
      return {
        productId: ref.productId,
        name: p?.name || ref.productId,
        volume: ref.volume,
        quantity: ref.quantity,
      };
    });

    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.kind === 'curated_combo' && item.comboId === combo.id
      );
      if (idx >= 0) {
        const next = [...prev];
        const curr = next[idx];
        next[idx] = { ...curr, quantity: curr.quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          kind: 'curated_combo',
          cartId: `curated-${combo.id}`,
          comboId: combo.id,
          title: combo.title,
          comboPrice: combo.comboPrice,
          originalTotal,
          quantity: 1,
          items: resolvedItems,
        },
      ];
    });
  };

  const handleAddCustomCombo = (combo: Omit<CartCustomComboItem, 'cartId'>) => {
    const cartId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setCart((prev) => [...prev, { ...combo, cartId }]);
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeThreshold = catalog?.freeDeliveryThreshold ?? 5000;
  const standardFee = catalog?.standardDeliveryFee ?? 120;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F4] text-[#141414]">
      <Navbar
        cartCount={totalBagCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setCartOpen(true)}
        onNavigateSection={handleNavigateSection}
        onOpenAdmin={() => navigateToPath('/admin')}
        isAdminRoute={isAdminRoute}
        onExitAdmin={() => navigateToPath('/')}
      />

      {isAdminRoute ? (
        <AdminPanel
          onBackToStore={() => navigateToPath('/')}
          onCatalogUpdated={() => {
            setSaleDismissed(false);
            fetchCatalog();
          }}
        />
      ) : (
        <main className="flex-1">
          <Hero
            slides={catalog?.heroSlides || []}
            onNavigateTarget={handleHeroTarget}
          />

          <CategoryStrip onSelectCategory={handleNavigateSection} />

          {loading ? (
            <section className="max-w-[1360px] mx-auto px-5 sm:px-8 py-16">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="aspect-[4/5] bg-[#EFECE6] border border-[#E5E0D8] animate-pulse"
                  />
                ))}
              </div>
            </section>
          ) : loadError || !catalog ? (
            <section className="max-w-[1360px] mx-auto px-5 sm:px-8 py-20 text-center space-y-4">
              <p className="text-sm text-[#5C564E]">{loadError || 'Catalog unavailable.'}</p>
              <button
                type="button"
                onClick={fetchCatalog}
                className="px-6 py-2.5 bg-[#141414] text-[#F9F7F4] text-xs uppercase tracking-wider cursor-pointer"
              >
                Retry
              </button>
            </section>
          ) : (
            <>
              <CatalogSection
                products={catalog.products}
                curatedCombos={catalog.curatedCombos}
                promoBanners={catalog.promoBanners}
                categoryFilter={categoryFilter}
                genderFilter={genderFilter}
                searchQuery={searchQuery}
                onChangeCategory={setCategoryFilter}
                onChangeGender={setGenderFilter}
                onAddSingle={handleAddSingle}
                onAddCuratedCombo={handleAddCuratedCombo}
                onJumpToBuilder={() => handleNavigateSection('combo-builder')}
                onJumpToCurated={() => handleNavigateSection('curated-combos')}
              />

              <ComboBuilder
                products={catalog.products}
                onAddCustomCombo={handleAddCustomCombo}
              />
            </>
          )}
        </main>
      )}

      <TrustFooter
        isAdminRoute={isAdminRoute}
        onNavigateSection={handleNavigateSection}
        onOpenAdmin={() => navigateToPath('/admin')}
        onExitAdmin={() => navigateToPath('/')}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        freeDeliveryThreshold={freeThreshold}
        standardDeliveryFee={standardFee}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        freeDeliveryThreshold={freeThreshold}
        standardDeliveryFee={standardFee}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={() => {
          setCart([]);
        }}
      />

      {!isAdminRoute && catalog?.specialSaleAd?.active && !saleDismissed && (
        <SpecialSalePopup
          ad={catalog.specialSaleAd}
          onDismiss={() => setSaleDismissed(true)}
          onNavigateTarget={handleHeroTarget}
        />
      )}
    </div>
  );
}
