import React, { useState } from 'react';
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { CategoryFilter, GenderFilter } from './CatalogSection';

interface NavbarProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onNavigateSection: (
    sectionId: string,
    filterPreset?: { category?: CategoryFilter; gender?: GenderFilter }
  ) => void;
  onOpenAdmin: () => void;
  isAdminRoute: boolean;
  onExitAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onNavigateSection,
  onOpenAdmin,
  isAdminRoute,
  onExitAdmin,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [perfumeMenuOpen, setPerfumeMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLinkClick = (
    sectionId: string,
    filterPreset?: { category?: CategoryFilter; gender?: GenderFilter }
  ) => {
    setMobileOpen(false);
    setPerfumeMenuOpen(false);
    if (isAdminRoute) {
      onExitAdmin();
      setTimeout(() => onNavigateSection(sectionId, filterPreset), 60);
      return;
    }
    onNavigateSection(sectionId, filterPreset);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F4]">
      {/* Slim Solid Black Top Announcement Bar */}
      <div className="bg-[#141414] text-[#F9F7F4] py-2 px-4 text-center">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          CASH ON DELIVERY AVAILABLE NATIONWIDE &nbsp;|&nbsp; CREATE YOUR OWN COMBO &amp; SAVE
        </p>
      </div>

      {/* Main Header Row */}
      <div className="border-b border-[#E5E0D8] bg-[#F9F7F4]/95 backdrop-blur-sm">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-6">
          {/* Left: Large KHUSHBOO SVG Logo (Standalone, No Tagline) */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (isAdminRoute) {
                onExitAdmin();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#141414]"
            aria-label="KHUSHBOO Home"
          >
            <BrandLogo id="brand-logo" className="h-[46px] md:h-[52px] w-auto text-[#141414]" />
          </a>

          {/* Center: Uppercase Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.18em] text-[#141414]"
            aria-label="Primary"
          >
            <button
              type="button"
              onClick={() => handleLinkClick('collection', { category: 'attar' })}
              className="hover:opacity-65 transition-opacity whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              ATTAR
            </button>

            <div
              className="relative"
              onMouseEnter={() => setPerfumeMenuOpen(true)}
              onMouseLeave={() => setPerfumeMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setPerfumeMenuOpen((v) => !v);
                }}
                className="inline-flex items-center gap-1 hover:opacity-65 transition-opacity whitespace-nowrap shrink-0 cursor-pointer py-1"
              >
                <span>PERFUME</span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>

              {perfumeMenuOpen && (
                <div className="absolute left-0 top-full pt-2 z-50">
                  <div className="bg-[#FAF8F4] border border-[#E5E0D8] shadow-sm min-w-[170px] py-2 flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        handleLinkClick('collection', { category: 'perfume', gender: 'all' })
                      }
                      className="text-left px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[#141414] hover:bg-[#EFECE6] cursor-pointer"
                    >
                      All Perfumes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleLinkClick('collection', { category: 'perfume', gender: 'male' })
                      }
                      className="text-left px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[#141414] hover:bg-[#EFECE6] cursor-pointer"
                    >
                      Men&apos;s Perfume
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleLinkClick('collection', { category: 'perfume', gender: 'female' })
                      }
                      className="text-left px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[#141414] hover:bg-[#EFECE6] cursor-pointer"
                    >
                      Women&apos;s Perfume
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleLinkClick('curated-combos')}
              className="hover:opacity-65 transition-opacity whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              CURATED COMBOS
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('combo-builder')}
              className="hover:opacity-65 transition-opacity whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              BUILD YOUR COMBO
            </button>
          </nav>

          {/* Right: Minimal Outline Icons (Search, Admin/Account, Cart Bag) */}
          <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((prev) => !prev);
                if (isAdminRoute) onExitAdmin();
              }}
              className="p-1.5 text-[#141414] hover:opacity-65 transition-opacity cursor-pointer"
              aria-label="Search fragrances"
            >
              <Search className="w-[19px] h-[19px] stroke-[1.4]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAdmin();
              }}
              className="p-1.5 text-[#141414] hover:opacity-65 transition-opacity cursor-pointer"
              aria-label="Atelier Admin"
              title="Atelier Admin"
            >
              <User className="w-[19px] h-[19px] stroke-[1.4]" />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-1.5 text-[#141414] hover:opacity-65 transition-opacity cursor-pointer"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-[19px] h-[19px] stroke-[1.4]" />
              <span className="absolute -top-0.5 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#141414] text-[#F9F7F4] text-[10px] font-medium flex items-center justify-center tabular-nums leading-none">
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden p-1.5 text-[#141414] cursor-pointer"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && !isAdminRoute && (
        <div className="border-b border-[#E5E0D8] bg-[#FAF8F4] px-5 sm:px-8 py-3">
          <div className="max-w-[1360px] mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-[#6E6A61] shrink-0" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onNavigateSection('collection', { category: 'all' });
              }}
              placeholder="Search attars, perfumes, or notes (e.g. Oud, Jasmine, Vetiver)..."
              className="w-full bg-transparent text-sm text-[#141414] placeholder:text-[#7D776D] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-xs uppercase tracking-wider text-[#6E6A61] hover:text-[#141414] cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-1 text-[#6E6A61] hover:text-[#141414] cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[#E5E0D8] bg-[#F9F7F4] px-6 py-4 flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.16em] text-[#141414]">
          <button
            type="button"
            onClick={() => handleLinkClick('collection', { category: 'attar' })}
            className="text-left py-2.5 border-b border-[#E5E0D8]"
          >
            Attar
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('collection', { category: 'perfume', gender: 'male' })}
            className="text-left py-2.5 border-b border-[#E5E0D8]"
          >
            Perfume · Male
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('collection', { category: 'perfume', gender: 'female' })}
            className="text-left py-2.5 border-b border-[#E5E0D8]"
          >
            Perfume · Female
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('curated-combos')}
            className="text-left py-2.5 border-b border-[#E5E0D8]"
          >
            Curated Combos
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('combo-builder')}
            className="text-left py-2.5"
          >
            Build Your Combo
          </button>
        </div>
      )}
    </header>
  );
};
