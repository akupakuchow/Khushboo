import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type {
  CuratedCombo,
  HeroCtaTarget,
  HeroSlide,
  OrderRecord,
  OrderStatus,
  PerfumeGender,
  Product,
  ProductCategory,
  SpecialSaleAd,
  SplitPromoBanners,
} from '../types/store';
import { formatBDT } from '../utils/currency';

interface AdminPanelProps {
  onBackToStore: () => void;
  onCatalogUpdated: () => void;
}

type AdminTab = 'products' | 'combos' | 'slides' | 'promos' | 'sale' | 'orders';

interface ImageFieldProps {
  label: string;
  value: string;
  token: string;
  onChange: (nextUrl: string) => void;
  onError: (msg: string) => void;
}

const ImageUploadField: React.FC<ImageFieldProps> = ({
  label,
  value,
  token,
  onChange,
  onError,
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || 'Image upload failed.');
        return;
      }
      onChange(data.imageUrl);
    } catch {
      onError('Network error uploading image.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const safePreviewUrl =
    value.startsWith('/uploads/') ||
    value.startsWith('/assets/') ||
    value.startsWith('https://') ||
    value.startsWith('http://')
      ? value
      : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-[11px] uppercase tracking-wider text-[#6E6A61] font-medium">
          {label}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-[#6E6A61] hover:text-[#7F1D1D] inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* Live Thumbnail Preview */}
        <div className="w-16 h-20 bg-[#EFECE6] border border-[#DCD6CA] shrink-0 overflow-hidden flex items-center justify-center">
          {safePreviewUrl ? (
            <img
              src={safePreviewUrl}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-[#9B9488]" />
          )}
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-[#141414] text-[#F9F7F4] text-[11px] font-medium uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#2B2926] disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3 h-3 text-[#C5A059]" />
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            </button>
            <span className="text-[11px] text-[#6E6A61]">JPG, PNG, WebP (max 5MB)</span>
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL (https://... or /uploads/...)"
            className="w-full px-2.5 py-1.5 bg-[#F7F5F0] border border-[#DCD6CA] text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
          />
        </div>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStore, onCatalogUpdated }) => {
  const [token, setToken] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [tab, setTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<CuratedCombo[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('attar');
  const [newGender, setNewGender] = useState<PerfumeGender>('male');
  const [newTop, setNewTop] = useState('');
  const [newMid, setNewMid] = useState('');
  const [newBase, setNewBase] = useState('');
  const [newPriceSmall, setNewPriceSmall] = useState('1800');
  const [newPriceMed, setNewPriceMed] = useState('3200');
  const [newPriceLarge, setNewPriceLarge] = useState('5800');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVarImgSmall, setNewVarImgSmall] = useState('');
  const [newVarImgMed, setNewVarImgMed] = useState('');
  const [newVarImgLarge, setNewVarImgLarge] = useState('');
  const [newInStock, setNewInStock] = useState(true);

  // Edit Product State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductDraft, setEditProductDraft] = useState<{
    name: string;
    subtitle: string;
    top: string;
    middle: string;
    base: string;
    imageUrl: string;
    inStock: boolean;
    variants: Array<{ volume: string; price: number; imageUrl?: string }>;
  } | null>(null);

  // Split Promo Banners State
  const [promoDraft, setPromoDraft] = useState<SplitPromoBanners>({
    left: {
      eyebrow: 'CUSTOM BUNDLE STUDIO',
      heading: 'Build Your Own Combo',
      description:
        'Mix any Attars and Perfumes. Unlock 10% off 2 bottles or 15% off 3+ bottles automatically.',
      buttonLabel: 'BUILD YOUR COMBO',
      imageUrl: '',
    },
    right: {
      eyebrow: 'THE ART OF GIFTING',
      heading: 'Curated Combos',
      description:
        'Beautifully paired Attar and Eau de Parfum coffrets offered at exclusive seasonal savings.',
      buttonLabel: 'SHOP CURATED COMBOS',
      imageUrl: '',
    },
  });

  // Special Sale Ad State
  const [saleDraft, setSaleDraft] = useState<SpecialSaleAd>({
    active: false,
    eyebrow: 'LIMITED SEASONAL OFFER',
    title: 'Eid Flash Sale — Flat 20% Off',
    offerText:
      'Celebrate with artisanal pure attars and Eau de Parfum gift sets—delivered nationwide with Cash on Delivery.',
    buttonText: 'SHOP CURATED OFFERS',
    ctaTarget: 'curated-combos',
    customUrl: '',
    imageUrl: '',
  });

  // New Combo Form State
  const [comboTitle, setComboTitle] = useState('');
  const [comboSubtitle, setComboSubtitle] = useState('');
  const [comboDesc, setComboDesc] = useState('');
  const [comboTag, setComboTag] = useState('Signature Offer');
  const [comboPrice, setComboPrice] = useState('6800');
  const [comboImageUrl, setComboImageUrl] = useState('');
  const [comboItem1, setComboItem1] = useState('');
  const [comboVol1, setComboVol1] = useState('');
  const [comboItem2, setComboItem2] = useState('');
  const [comboVol2, setComboVol2] = useState('');

  // Edit Combo State
  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  const [editComboDraft, setEditComboDraft] = useState<{
    title: string;
    subtitle: string;
    description: string;
    tag: string;
    comboPrice: string;
    imageUrl: string;
  } | null>(null);

  // New Hero Slide State
  const [slideKicker, setSlideKicker] = useState('KHUSHBOO EDITION');
  const [slideHeadline, setSlideHeadline] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideCtaText, setSlideCtaText] = useState('EXPLORE COLLECTIONS');
  const [slideCtaTarget, setSlideCtaTarget] = useState<HeroCtaTarget>('collection');
  const [slideImageUrl, setSlideImageUrl] = useState('');

  // Edit Hero Slide State
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editSlideDraft, setEditSlideDraft] = useState<HeroSlide | null>(null);

  useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((d) => setNeedsSetup(Boolean(d.needsSetup)))
      .catch(() => setNeedsSetup(false));
  }, []);

  const notify = (msg: string) => {
    setActionError(null);
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2600);
  };

  const notifyError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 3500);
  };

  const fetchOverview = async (authToken: string) => {
    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.status === 401) {
      setToken(null);
      return;
    }
    const data = await res.json();
    setProducts(data.products || []);
    setCombos(data.curatedCombos || []);
    setSlides(data.heroSlides || []);
    if (data.promoBanners) {
      setPromoDraft({
        left: { ...data.promoBanners.left, imageUrl: data.promoBanners.left?.imageUrl || '' },
        right: { ...data.promoBanners.right, imageUrl: data.promoBanners.right?.imageUrl || '' },
      });
    }
    if (data.specialSaleAd) {
      setSaleDraft({
        ...data.specialSaleAd,
        customUrl: data.specialSaleAd.customUrl || '',
        imageUrl: data.specialSaleAd.imageUrl || '',
      });
    }
    setOrders(data.orders || []);
    if (data.products?.length >= 2) {
      const p1 = data.products[0] as Product;
      const p2 = data.products[1] as Product;
      setComboItem1((curr) => curr || p1.id);
      setComboVol1((curr) => curr || p1.variants[0]?.volume || '');
      setComboItem2((curr) => curr || p2.id);
      setComboVol2((curr) => curr || p2.variants[0]?.volume || '');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const endpoint = needsSetup ? '/api/admin/claim' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      setToken(data.token);
      setPasscode('');
      await fetchOverview(data.token);
    } catch {
      setAuthError('Unable to reach server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // --- PRODUCTS ---
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const vols = newCategory === 'attar' ? ['3ml', '6ml', '12ml'] : ['30ml', '50ml', '100ml'];
    const prices = [Number(newPriceSmall), Number(newPriceMed), Number(newPriceLarge)];
    const varImages = [newVarImgSmall, newVarImgMed, newVarImgLarge];

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newName,
        subtitle: newSubtitle,
        category: newCategory,
        gender: newCategory === 'perfume' ? newGender : undefined,
        imageUrl: newImageUrl,
        inStock: newInStock,
        notes: {
          top: newTop || 'Saffron, Bergamot',
          middle: newMid || 'Damask Rose, Vetiver',
          base: newBase || 'Aged Sandalwood, Amber',
        },
        variants: vols.map((volume, idx) => ({
          volume,
          price: prices[idx],
          imageUrl: varImages[idx] || undefined,
        })),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not create product.');
      return;
    }

    setNewName('');
    setNewSubtitle('');
    setNewTop('');
    setNewMid('');
    setNewBase('');
    setNewImageUrl('');
    setNewVarImgSmall('');
    setNewVarImgMed('');
    setNewVarImgLarge('');
    setNewInStock(true);
    await fetchOverview(token);
    onCatalogUpdated();
    notify('Fragrance added to catalog.');
  };

  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setEditProductDraft({
      name: p.name,
      subtitle: p.subtitle,
      top: p.notes.top,
      middle: p.notes.middle,
      base: p.notes.base,
      imageUrl: p.imageUrl || '',
      inStock: p.inStock,
      variants: p.variants.map((v) => ({
        volume: v.volume,
        price: v.price,
        imageUrl: v.imageUrl || '',
      })),
    });
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProductId || !editProductDraft) return;
    const res = await fetch(`/api/admin/products/${editingProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editProductDraft.name,
        subtitle: editProductDraft.subtitle,
        imageUrl: editProductDraft.imageUrl,
        inStock: editProductDraft.inStock,
        notes: {
          top: editProductDraft.top,
          middle: editProductDraft.middle,
          base: editProductDraft.base,
        },
        variants: editProductDraft.variants.map((v) => ({
          volume: v.volume,
          price: v.price,
          imageUrl: v.imageUrl || '',
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not update product.');
      return;
    }
    setEditingProductId(null);
    setEditProductDraft(null);
    await fetchOverview(token);
    onCatalogUpdated();
    notify('Product updated.');
  };

  const handleToggleStock = async (product: Product) => {
    if (!token) return;
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ inStock: !product.inStock }),
    });
    if (res.ok) {
      await fetchOverview(token);
      onCatalogUpdated();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchOverview(token);
      onCatalogUpdated();
      notify('Product removed.');
    }
  };

  // --- CURATED COMBOS ---
  const handleCreateCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/admin/combos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: comboTitle,
        subtitle: comboSubtitle,
        description: comboDesc,
        tag: comboTag,
        comboPrice: Number(comboPrice),
        imageUrl: comboImageUrl,
        items: [
          { productId: comboItem1, volume: comboVol1, quantity: 1 },
          { productId: comboItem2, volume: comboVol2, quantity: 1 },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not publish combo.');
      return;
    }
    setComboTitle('');
    setComboSubtitle('');
    setComboDesc('');
    setComboImageUrl('');
    await fetchOverview(token);
    onCatalogUpdated();
    notify('Curated combo published.');
  };

  const startEditCombo = (c: CuratedCombo) => {
    setEditingComboId(c.id);
    setEditComboDraft({
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      tag: c.tag || 'Curated Offer',
      comboPrice: String(c.comboPrice),
      imageUrl: c.imageUrl || '',
    });
  };

  const handleSaveEditCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingComboId || !editComboDraft) return;
    const res = await fetch(`/api/admin/combos/${editingComboId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editComboDraft.title,
        subtitle: editComboDraft.subtitle,
        description: editComboDraft.description,
        tag: editComboDraft.tag,
        comboPrice: Number(editComboDraft.comboPrice),
        imageUrl: editComboDraft.imageUrl,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not update combo.');
      return;
    }
    setEditingComboId(null);
    setEditComboDraft(null);
    await fetchOverview(token);
    onCatalogUpdated();
    notify('Curated combo updated.');
  };

  const handleToggleComboActive = async (combo: CuratedCombo) => {
    if (!token) return;
    const res = await fetch(`/api/admin/combos/${combo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active: !combo.active }),
    });
    if (res.ok) {
      await fetchOverview(token);
      onCatalogUpdated();
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/combos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchOverview(token);
      onCatalogUpdated();
      notify('Curated combo deleted.');
    }
  };

  // --- HERO SLIDES ---
  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/admin/slides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        kicker: slideKicker,
        headline: slideHeadline,
        subtitle: slideSubtitle,
        ctaText: slideCtaText,
        ctaTarget: slideCtaTarget,
        imageUrl: slideImageUrl,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not add hero slide.');
      return;
    }
    setSlideHeadline('');
    setSlideSubtitle('');
    setSlideImageUrl('');
    await fetchOverview(token);
    onCatalogUpdated();
    notify('Hero slide added.');
  };

  const handleSaveEditSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingSlideId || !editSlideDraft) return;
    const res = await fetch(`/api/admin/slides/${editingSlideId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        kicker: editSlideDraft.kicker,
        headline: editSlideDraft.headline,
        subtitle: editSlideDraft.subtitle,
        ctaText: editSlideDraft.ctaText,
        ctaTarget: editSlideDraft.ctaTarget,
        imageUrl: editSlideDraft.imageUrl || '',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not update slide.');
      return;
    }
    setEditingSlideId(null);
    setEditSlideDraft(null);
    await fetchOverview(token);
    onCatalogUpdated();
    notify('Hero slide updated.');
  };

  const handleMoveSlide = async (index: number, direction: -1 | 1) => {
    if (!token) return;
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= slides.length) return;
    const reordered = [...slides];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(nextIdx, 0, moved);
    setSlides(reordered);

    const res = await fetch('/api/admin/slides-reorder', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slideIds: reordered.map((s) => s.id) }),
    });
    if (res.ok) {
      onCatalogUpdated();
      notify('Slide order updated.');
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/slides/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not delete slide.');
      return;
    }
    await fetchOverview(token);
    onCatalogUpdated();
    notify('Hero slide deleted.');
  };

  const handleSavePromoBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/admin/promo-banners', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(promoDraft),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not save promo banners.');
      return;
    }
    await fetchOverview(token);
    onCatalogUpdated();
    notify('Promo banners updated.');
  };

  const handleSaveSpecialSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/admin/special-sale', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(saleDraft),
    });
    const data = await res.json();
    if (!res.ok) {
      notifyError(data.error || 'Could not save special sale ad.');
      return;
    }
    await fetchOverview(token);
    onCatalogUpdated();
    notify(saleDraft.active ? 'Special Sale Ad is now Active.' : 'Special Sale Ad is hidden.');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchOverview(token);
      notify(`Order ${orderId} marked ${status}.`);
    }
  };

  if (!token) {
    return (
      <main className="min-h-[80vh] bg-[#F9F7F4] py-16 px-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#FAF8F4] border border-[#E5E0D8] p-8 space-y-6">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-xs text-[#5C564E] hover:text-[#141414] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C6D32]">KHUSHBOO</p>
            <h1 className="font-display text-3xl text-[#141414] mt-1">
              {needsSetup ? 'Set Admin Passcode' : 'Admin Sign In'}
            </h1>
            <p className="text-xs text-[#5C564E] mt-2 leading-relaxed">
              {needsSetup
                ? 'First-time setup: claim an admin passcode (minimum 6 characters) to manage fragrances, combos, hero slides, and COD orders.'
                : 'Enter your passcode to manage inventory, hero banners, combo pricing, and Cash on Delivery orders.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#7F1D1D]">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-passcode"
                className="block text-xs font-medium text-[#3C3933] mb-1.5"
              >
                {needsSetup ? 'Choose Admin Passcode' : 'Passcode'}
              </label>
              <input
                id="admin-passcode"
                type="password"
                required
                minLength={needsSetup ? 6 : 1}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#F9F7F4] border border-[#DCD6CA] text-sm text-[#141414] focus:outline-none focus:border-[#141414]"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading || needsSetup === null}
              className="w-full py-3 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider hover:bg-[#2B2926] cursor-pointer disabled:opacity-50"
            >
              {authLoading ? 'Verifying...' : needsSetup ? 'Claim Admin Access' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[82vh] bg-[#F9F7F4] py-12 px-5 sm:px-8">
      <div className="max-w-[1360px] mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
          <div>
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-2 text-xs text-[#5C564E] hover:text-[#141414] mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
            <h1 className="font-display text-3xl text-[#141414]">KHUSHBOO Admin</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'products', label: `Products (${products.length})` },
                { id: 'combos', label: `Curated Combos (${combos.length})` },
                { id: 'slides', label: `Hero Slider (${slides.length}/4)` },
                { id: 'promos', label: 'Promo Banners' },
                {
                  id: 'sale',
                  label: saleDraft.active ? 'Special Sale Ad (On)' : 'Special Sale Ad (Off)',
                },
                { id: 'orders', label: `COD Orders (${orders.length})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-xs font-medium border cursor-pointer whitespace-nowrap ${
                  tab === t.id
                    ? 'bg-[#141414] text-[#F9F7F4] border-[#141414]'
                    : 'bg-[#FAF8F4] text-[#4A4741] border-[#E5E0D8]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <div className="p-3 bg-[#141414] text-[#C5A059] text-xs font-medium">{feedback}</div>
        )}
        {actionError && (
          <div className="p-3 bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#7F1D1D]">
            {actionError}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateProduct}
              className="lg:col-span-5 bg-[#FAF8F4] border border-[#E5E0D8] p-6 space-y-4"
            >
              <h2 className="font-display text-2xl text-[#141414]">Add Fragrance</h2>

              <ImageUploadField
                label="Product Image"
                value={newImageUrl}
                token={token}
                onChange={setNewImageUrl}
                onError={notifyError}
              />

              <input
                type="text"
                required
                placeholder="Fragrance Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <input
                type="text"
                required
                placeholder="Subtitle (e.g., Aged Oud & Rose)"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                  className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                >
                  <option value="attar">Attar</option>
                  <option value="perfume">Perfume</option>
                </select>
                {newCategory === 'perfume' && (
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as PerfumeGender)}
                    className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                )}
              </div>
              <input
                type="text"
                placeholder="Top Notes"
                value={newTop}
                onChange={(e) => setNewTop(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <input
                type="text"
                placeholder="Heart Notes"
                value={newMid}
                onChange={(e) => setNewMid(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <input
                type="text"
                placeholder="Base Notes"
                value={newBase}
                onChange={(e) => setNewBase(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-[#6E6A61] mb-1">
                    {newCategory === 'attar' ? '3ml (৳ BDT)' : '30ml (৳ BDT)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newPriceSmall}
                    onChange={(e) => setNewPriceSmall(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6E6A61] mb-1">
                    {newCategory === 'attar' ? '6ml (৳ BDT)' : '50ml (৳ BDT)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newPriceMed}
                    onChange={(e) => setNewPriceMed(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6E6A61] mb-1">
                    {newCategory === 'attar' ? '12ml (৳ BDT)' : '100ml (৳ BDT)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newPriceLarge}
                    onChange={(e) => setNewPriceLarge(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-sm tabular-nums"
                  />
                </div>
              </div>

              {/* Per-Size Variant Bottle Images */}
              <div className="pt-3 border-t border-[#E5E0D8] space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-[#8C6D32] font-medium">
                  Size-Specific Bottle Images (Optional)
                </p>
                <ImageUploadField
                  label={newCategory === 'attar' ? '3ml Bottle Image' : '30ml Bottle Image'}
                  value={newVarImgSmall}
                  token={token}
                  onChange={setNewVarImgSmall}
                  onError={notifyError}
                />
                <ImageUploadField
                  label={newCategory === 'attar' ? '6ml Bottle Image' : '50ml Bottle Image'}
                  value={newVarImgMed}
                  token={token}
                  onChange={setNewVarImgMed}
                  onError={notifyError}
                />
                <ImageUploadField
                  label={newCategory === 'attar' ? '12ml Bottle Image' : '100ml Bottle Image'}
                  value={newVarImgLarge}
                  token={token}
                  onChange={setNewVarImgLarge}
                  onError={notifyError}
                />
              </div>

              {/* In Stock / Out of Stock Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E5E0D8]">
                <span className="text-xs font-medium text-[#141414]">
                  Availability: {newInStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={newInStock}
                  onClick={() => setNewInStock((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    newInStock ? 'bg-[#141414]' : 'bg-[#CFC8BC]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-[#F9F7F4] transition-transform ${
                      newInStock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Create Fragrance</span>
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {products.map((p) => {
                const isEditing = editingProductId === p.id && editProductDraft !== null;
                return (
                  <div
                    key={p.id}
                    className="bg-[#FAF8F4] border border-[#E5E0D8] p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-14 bg-[#EFECE6] border border-[#E5E0D8] shrink-0 overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-[#9B9488]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-[#8C6D32]">
                            {p.category === 'attar' ? 'Attar' : `Perfume · ${p.gender}`} ·{' '}
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </p>
                          <h3 className="font-display text-xl text-[#141414] truncate">{p.name}</h3>
                          <p className="text-xs text-[#6E6A61] truncate">{p.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={p.inStock}
                            aria-label={`Toggle stock status for ${p.name}`}
                            onClick={() => handleToggleStock(p)}
                            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                              p.inStock ? 'bg-[#141414]' : 'bg-[#CFC8BC]'
                            }`}
                          >
                            <span
                              className={`block w-3.5 h-3.5 rounded-full bg-[#F9F7F4] transition-transform ${
                                p.inStock ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="text-[11px] font-medium text-[#524E46]">
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            isEditing ? setEditingProductId(null) : startEditProduct(p)
                          }
                          className="px-3 py-1.5 text-xs border border-[#DCD6CA] hover:border-[#141414] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-[#6E6A61] hover:text-[#7F1D1D] cursor-pointer"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing && editProductDraft && (
                      <form
                        onSubmit={handleSaveEditProduct}
                        className="pt-4 border-t border-[#E5E0D8] space-y-4"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]">
                          <span className="text-xs font-medium text-[#141414]">
                            Stock Status: {editProductDraft.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={editProductDraft.inStock}
                            onClick={() =>
                              setEditProductDraft({
                                ...editProductDraft,
                                inStock: !editProductDraft.inStock,
                              })
                            }
                            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                              editProductDraft.inStock ? 'bg-[#141414]' : 'bg-[#CFC8BC]'
                            }`}
                          >
                            <span
                              className={`block w-4 h-4 rounded-full bg-[#F9F7F4] transition-transform ${
                                editProductDraft.inStock ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <ImageUploadField
                          label="Default Product Image (Fallback)"
                          value={editProductDraft.imageUrl}
                          token={token}
                          onChange={(url) =>
                            setEditProductDraft({ ...editProductDraft, imageUrl: url })
                          }
                          onError={notifyError}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={editProductDraft.name}
                            onChange={(e) =>
                              setEditProductDraft({ ...editProductDraft, name: e.target.value })
                            }
                            placeholder="Product Name"
                            className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                          <input
                            type="text"
                            required
                            value={editProductDraft.subtitle}
                            onChange={(e) =>
                              setEditProductDraft({ ...editProductDraft, subtitle: e.target.value })
                            }
                            placeholder="Subtitle"
                            className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editProductDraft.top}
                            onChange={(e) =>
                              setEditProductDraft({ ...editProductDraft, top: e.target.value })
                            }
                            placeholder="Top Notes"
                            className="px-2.5 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                          <input
                            type="text"
                            value={editProductDraft.middle}
                            onChange={(e) =>
                              setEditProductDraft({ ...editProductDraft, middle: e.target.value })
                            }
                            placeholder="Heart Notes"
                            className="px-2.5 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                          <input
                            type="text"
                            value={editProductDraft.base}
                            onChange={(e) =>
                              setEditProductDraft({ ...editProductDraft, base: e.target.value })
                            }
                            placeholder="Base Notes"
                            className="px-2.5 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                        </div>

                        <div className="space-y-3 pt-2 border-t border-[#E5E0D8]">
                          <p className="text-[11px] uppercase tracking-wider text-[#8C6D32] font-medium">
                            Size Variants &amp; Dedicated Bottle Images
                          </p>
                          {editProductDraft.variants.map((v, idx) => (
                            <div
                              key={v.volume}
                              className="p-3 bg-[#F9F7F4] border border-[#E5E0D8] space-y-2.5"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-[#141414]">
                                  {v.volume} Size
                                </span>
                                <label className="text-xs flex items-center gap-1.5 bg-[#FAF8F4] border border-[#DCD6CA] px-2.5 py-1">
                                  <span className="text-[#6E6A61]">Price (৳):</span>
                                  <input
                                    type="number"
                                    min={1}
                                    required
                                    value={v.price}
                                    onChange={(e) => {
                                      const nextVars = [...editProductDraft.variants];
                                      nextVars[idx] = { ...v, price: Number(e.target.value) };
                                      setEditProductDraft({
                                        ...editProductDraft,
                                        variants: nextVars,
                                      });
                                    }}
                                    className="w-20 bg-transparent tabular-nums focus:outline-none"
                                  />
                                </label>
                              </div>
                              <ImageUploadField
                                label={`${v.volume} Bottle Image`}
                                value={v.imageUrl || ''}
                                token={token}
                                onChange={(url) => {
                                  const nextVars = [...editProductDraft.variants];
                                  nextVars[idx] = { ...v, imageUrl: url };
                                  setEditProductDraft({
                                    ...editProductDraft,
                                    variants: nextVars,
                                  });
                                }}
                                onError={notifyError}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CURATED COMBOS TAB */}
        {tab === 'combos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateCombo}
              className="lg:col-span-5 bg-[#FAF8F4] border border-[#E5E0D8] p-6 space-y-4"
            >
              <h2 className="font-display text-2xl text-[#141414]">Post Curated Combo</h2>

              <ImageUploadField
                label="Combo Banner / Coffret Image"
                value={comboImageUrl}
                token={token}
                onChange={setComboImageUrl}
                onError={notifyError}
              />

              <input
                type="text"
                required
                placeholder="Combo Title"
                value={comboTitle}
                onChange={(e) => setComboTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Subtitle"
                  value={comboSubtitle}
                  onChange={(e) => setComboSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
                <input
                  type="text"
                  placeholder="Tag (e.g., Signature Pair)"
                  value={comboTag}
                  onChange={(e) => setComboTag(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Description"
                value={comboDesc}
                onChange={(e) => setComboDesc(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={comboItem1}
                  onChange={(e) => {
                    const id = e.target.value;
                    setComboItem1(id);
                    const prod = products.find((x) => x.id === id);
                    setComboVol1(prod?.variants[0]?.volume || '');
                  }}
                  className="px-2.5 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={comboVol1}
                  onChange={(e) => setComboVol1(e.target.value)}
                  className="px-2.5 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                >
                  {(products.find((x) => x.id === comboItem1)?.variants || []).map((v) => (
                    <option key={v.volume} value={v.volume}>
                      {v.volume} ({formatBDT(v.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={comboItem2}
                  onChange={(e) => {
                    const id = e.target.value;
                    setComboItem2(id);
                    const prod = products.find((x) => x.id === id);
                    setComboVol2(prod?.variants[0]?.volume || '');
                  }}
                  className="px-2.5 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={comboVol2}
                  onChange={(e) => setComboVol2(e.target.value)}
                  className="px-2.5 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                >
                  {(products.find((x) => x.id === comboItem2)?.variants || []).map((v) => (
                    <option key={v.volume} value={v.volume}>
                      {v.volume} ({formatBDT(v.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6E6A61] mb-1">
                  Promotional Combo Price (৳ BDT)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={comboPrice}
                  onChange={(e) => setComboPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm tabular-nums"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Publish Curated Combo
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {combos.map((c) => {
                const isEditing = editingComboId === c.id && editComboDraft !== null;
                return (
                  <div
                    key={c.id}
                    className="bg-[#FAF8F4] border border-[#E5E0D8] p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-16 h-12 bg-[#EFECE6] border border-[#E5E0D8] shrink-0 overflow-hidden flex items-center justify-center">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt={c.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-[#9B9488]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-[#8C6D32]">
                            {c.active ? 'Active Offer' : 'Paused'} · {formatBDT(c.comboPrice)}
                          </p>
                          <h3 className="font-display text-xl text-[#141414] truncate">{c.title}</h3>
                          <p className="text-xs text-[#6E6A61] truncate">{c.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingComboId(null) : startEditCombo(c))}
                          className="px-3 py-1.5 text-xs border border-[#DCD6CA] hover:border-[#141414] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleComboActive(c)}
                          className="px-3 py-1.5 text-xs border border-[#DCD6CA] hover:border-[#141414] cursor-pointer"
                        >
                          {c.active ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCombo(c.id)}
                          className="p-1.5 text-[#6E6A61] hover:text-[#7F1D1D] cursor-pointer"
                          aria-label={`Delete ${c.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing && editComboDraft && (
                      <form
                        onSubmit={handleSaveEditCombo}
                        className="pt-4 border-t border-[#E5E0D8] space-y-3"
                      >
                        <ImageUploadField
                          label="Combo Image"
                          value={editComboDraft.imageUrl}
                          token={token}
                          onChange={(url) =>
                            setEditComboDraft({ ...editComboDraft, imageUrl: url })
                          }
                          onError={notifyError}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={editComboDraft.title}
                            onChange={(e) =>
                              setEditComboDraft({ ...editComboDraft, title: e.target.value })
                            }
                            placeholder="Combo Title"
                            className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                          <input
                            type="text"
                            required
                            value={editComboDraft.subtitle}
                            onChange={(e) =>
                              setEditComboDraft({ ...editComboDraft, subtitle: e.target.value })
                            }
                            placeholder="Subtitle"
                            className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={editComboDraft.description}
                          onChange={(e) =>
                            setEditComboDraft({ ...editComboDraft, description: e.target.value })
                          }
                          placeholder="Description"
                          className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="text"
                            value={editComboDraft.tag}
                            onChange={(e) =>
                              setEditComboDraft({ ...editComboDraft, tag: e.target.value })
                            }
                            placeholder="Tag"
                            className="px-3 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                          <label className="text-xs flex items-center gap-1.5 bg-[#F9F7F4] border border-[#DCD6CA] px-2.5 py-1.5">
                            <span className="text-[#6E6A61]">Price (৳):</span>
                            <input
                              type="number"
                              min={1}
                              required
                              value={editComboDraft.comboPrice}
                              onChange={(e) =>
                                setEditComboDraft({
                                  ...editComboDraft,
                                  comboPrice: e.target.value,
                                })
                              }
                              className="w-20 bg-transparent tabular-nums focus:outline-none"
                            />
                          </label>
                          <button
                            type="submit"
                            className="ml-auto px-4 py-1.5 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider cursor-pointer"
                          >
                            Save Combo
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HERO SLIDER TAB */}
        {tab === 'slides' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateSlide}
              className="lg:col-span-5 bg-[#FAF8F4] border border-[#E5E0D8] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-[#141414]">Add Hero Slide</h2>
                <span className="text-xs text-[#6E6A61] tabular-nums">
                  {slides.length} / 4 slides
                </span>
              </div>

              <ImageUploadField
                label="Slide Banner Image (Optional)"
                value={slideImageUrl}
                token={token}
                onChange={setSlideImageUrl}
                onError={notifyError}
              />

              <input
                type="text"
                placeholder="Kicker (e.g., WINTER RESERVE)"
                value={slideKicker}
                onChange={(e) => setSlideKicker(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <input
                type="text"
                required
                placeholder="Editorial Headline"
                value={slideHeadline}
                onChange={(e) => setSlideHeadline(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <textarea
                rows={2}
                required
                placeholder="Short editorial subtitle"
                value={slideSubtitle}
                onChange={(e) => setSlideSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Button Label"
                  value={slideCtaText}
                  onChange={(e) => setSlideCtaText(e.target.value)}
                  className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                />
                <select
                  value={slideCtaTarget}
                  onChange={(e) => setSlideCtaTarget(e.target.value as HeroCtaTarget)}
                  className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                >
                  <option value="collection">All Fragrances</option>
                  <option value="attar">Attar Collection</option>
                  <option value="perfume-male">Men&apos;s Perfume</option>
                  <option value="perfume-female">Women&apos;s Perfume</option>
                  <option value="curated-combos">Curated Combos</option>
                  <option value="combo-builder">Build Your Combo</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={slides.length >= 4}
                className="w-full py-3 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider disabled:opacity-45 cursor-pointer"
              >
                {slides.length >= 4 ? 'Maximum 4 Slides Reached' : 'Add Hero Slide'}
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {slides.map((slide, index) => {
                const isEditing = editingSlideId === slide.id && editSlideDraft !== null;
                return (
                  <div
                    key={slide.id}
                    className="bg-[#FAF8F4] border border-[#E5E0D8] p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-20 h-14 bg-[#EFECE6] border border-[#E5E0D8] shrink-0 overflow-hidden flex items-center justify-center">
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl}
                              alt={slide.headline}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider text-[#8C877C]">
                              Studio Art
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-[#8C6D32]">
                            Slide {index + 1} · {slide.kicker}
                          </p>
                          <h3 className="font-display text-xl text-[#141414] truncate">
                            {slide.headline}
                          </h3>
                          <p className="text-xs text-[#6E6A61] truncate">
                            CTA: {slide.ctaText} → {slide.ctaTarget}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSlide(index, -1)}
                          aria-label="Move slide up"
                          className="p-1.5 border border-[#DCD6CA] hover:border-[#141414] disabled:opacity-35 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === slides.length - 1}
                          onClick={() => handleMoveSlide(index, 1)}
                          aria-label="Move slide down"
                          className="p-1.5 border border-[#DCD6CA] hover:border-[#141414] disabled:opacity-35 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingSlideId(null);
                              setEditSlideDraft(null);
                            } else {
                              setEditingSlideId(slide.id);
                              setEditSlideDraft({ ...slide });
                            }
                          }}
                          className="px-3 py-1.5 text-xs border border-[#DCD6CA] hover:border-[#141414] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={slides.length <= 1}
                          onClick={() => handleDeleteSlide(slide.id)}
                          aria-label="Delete slide"
                          className="p-1.5 text-[#6E6A61] hover:text-[#7F1D1D] disabled:opacity-35 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing && editSlideDraft && (
                      <form
                        onSubmit={handleSaveEditSlide}
                        className="pt-4 border-t border-[#E5E0D8] space-y-3"
                      >
                        <ImageUploadField
                          label="Slide Banner Image"
                          value={editSlideDraft.imageUrl || ''}
                          token={token}
                          onChange={(url) =>
                            setEditSlideDraft({ ...editSlideDraft, imageUrl: url })
                          }
                          onError={notifyError}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editSlideDraft.kicker}
                            onChange={(e) =>
                              setEditSlideDraft({ ...editSlideDraft, kicker: e.target.value })
                            }
                            placeholder="Kicker"
                            className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                          <input
                            type="text"
                            required
                            value={editSlideDraft.headline}
                            onChange={(e) =>
                              setEditSlideDraft({ ...editSlideDraft, headline: e.target.value })
                            }
                            placeholder="Headline"
                            className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                        </div>
                        <textarea
                          rows={2}
                          required
                          value={editSlideDraft.subtitle}
                          onChange={(e) =>
                            setEditSlideDraft({ ...editSlideDraft, subtitle: e.target.value })
                          }
                          placeholder="Subtitle"
                          className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            required
                            value={editSlideDraft.ctaText}
                            onChange={(e) =>
                              setEditSlideDraft({ ...editSlideDraft, ctaText: e.target.value })
                            }
                            placeholder="CTA Button Text"
                            className="px-3 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          />
                          <select
                            value={editSlideDraft.ctaTarget}
                            onChange={(e) =>
                              setEditSlideDraft({
                                ...editSlideDraft,
                                ctaTarget: e.target.value as HeroCtaTarget,
                              })
                            }
                            className="px-3 py-1.5 bg-[#F9F7F4] border border-[#DCD6CA] text-xs"
                          >
                            <option value="collection">All Fragrances</option>
                            <option value="attar">Attar Collection</option>
                            <option value="perfume-male">Men&apos;s Perfume</option>
                            <option value="perfume-female">Women&apos;s Perfume</option>
                            <option value="curated-combos">Curated Combos</option>
                            <option value="combo-builder">Build Your Combo</option>
                          </select>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider cursor-pointer"
                          >
                            Save Slide
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROMO BANNERS TAB (Split Dual Cards) */}
        {tab === 'promos' && (
          <form onSubmit={handleSavePromoBanners} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Promo Banner Card */}
              <div className="bg-[#FAF8F4] border border-[#E5E0D8] p-6 space-y-4">
                <div className="pb-3 border-b border-[#E5E0D8]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8C6D32] font-medium">
                    LEFT SPLIT CARD (DARK CHARCOAL)
                  </p>
                  <h2 className="font-display text-2xl text-[#141414]">Build Your Own Combo Card</h2>
                </div>

                <ImageUploadField
                  label="Left Card Artwork Image (Optional)"
                  value={promoDraft.left.imageUrl || ''}
                  token={token}
                  onChange={(url) =>
                    setPromoDraft({
                      ...promoDraft,
                      left: { ...promoDraft.left, imageUrl: url },
                    })
                  }
                  onError={notifyError}
                />

                <input
                  type="text"
                  required
                  placeholder="Eyebrow Tag"
                  value={promoDraft.left.eyebrow}
                  onChange={(e) =>
                    setPromoDraft({
                      ...promoDraft,
                      left: { ...promoDraft.left, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Serif Heading"
                  value={promoDraft.left.heading}
                  onChange={(e) =>
                    setPromoDraft({
                      ...promoDraft,
                      left: { ...promoDraft.left, heading: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Description Text"
                  value={promoDraft.left.description}
                  onChange={(e) =>
                    setPromoDraft({
                      ...promoDraft,
                      left: { ...promoDraft.left, description: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Button Label"
                  value={promoDraft.left.buttonLabel}
                  onChange={(e) =>
                    setPromoDraft({
                      ...promoDraft,
                      left: { ...promoDraft.left, buttonLabel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
              </div>

              {/* Right Promo Banner Card */}
              <div className="bg-[#FAF8F4] border border-[#E5E0D8] p-6 space-y-4">
                <div className="pb-3 border-b border-[#E5E0D8]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8C6D32] font-medium">
                    RIGHT SPLIT CARD (WARM SAND)
                  </p>
                  <h2 className="font-display text-2xl text-[#141414]">Curated Combos Card</h2>
                </div>

                <ImageUploadField
                  label="Right Card Artwork Image (Optional)"
                  value={promoDraft.right.imageUrl || ''}
                  token={token}
                  onChange={(url) =>
                    setPromoDraft({
                      ...promoDraft,
                      right: { ...promoDraft.right, imageUrl: url },
                    })
                  }
                  onError={notifyError}
                />

                <input
                  type="text"
                  required
                  placeholder="Eyebrow Tag"
                  value={promoDraft.right.eyebrow}
                  onChange={(e) =>
                    setPromoDraft({
                      ...promoDraft,
                      right: { ...promoDraft.right, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Serif Heading"
                  value={promoDraft.right.heading}
                  onChange={(e) =>
                    setPromoDraft({
                      ...promoDraft,
                      right: { ...promoDraft.right, heading: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Description Text"
                  value={promoDraft.right.description}
                  onChange={(e) =>
                    setPromoDraft({
                      ...promoDraft,
                      right: { ...promoDraft.right, description: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="Button Label"
                  value={promoDraft.right.buttonLabel}
                  onChange={(e) =>
                    setPromoDraft({
                      ...promoDraft,
                      right: { ...promoDraft.right, buttonLabel: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-7 py-3 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Save Promo Banners
              </button>
            </div>
          </form>
        )}

        {/* SPECIAL SALE AD TAB */}
        {tab === 'sale' && (
          <form
            onSubmit={handleSaveSpecialSale}
            className="max-w-2xl bg-[#FAF8F4] border border-[#E5E0D8] p-6 sm:p-8 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D8]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8C6D32] font-medium">
                  STOREFRONT PROMOTIONAL POPUP
                </p>
                <h2 className="font-display text-2xl text-[#141414]">Special Sale Ad</h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={saleDraft.active}
                  aria-label="Toggle Special Sale Ad visibility"
                  onClick={() => setSaleDraft({ ...saleDraft, active: !saleDraft.active })}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    saleDraft.active ? 'bg-[#141414]' : 'bg-[#CFC8BC]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-[#F9F7F4] transition-transform ${
                      saleDraft.active ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-[#141414]">
                  {saleDraft.active ? 'Active (Visible on Storefront)' : 'Inactive (Hidden)'}
                </span>
              </div>
            </div>

            <ImageUploadField
              label="Promotional Banner Image (Optional)"
              value={saleDraft.imageUrl || ''}
              token={token}
              onChange={(url) => setSaleDraft({ ...saleDraft, imageUrl: url })}
              onError={notifyError}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6E6A61] mb-1">
                  Eyebrow Tag
                </label>
                <input
                  type="text"
                  required
                  value={saleDraft.eyebrow}
                  onChange={(e) => setSaleDraft({ ...saleDraft, eyebrow: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6E6A61] mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  required
                  value={saleDraft.buttonText}
                  onChange={(e) => setSaleDraft({ ...saleDraft, buttonText: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6E6A61] mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Eid Flash Sale — Flat 20% Off"
                value={saleDraft.title}
                onChange={(e) => setSaleDraft({ ...saleDraft, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6E6A61] mb-1">
                Offer Subtitle / Details
              </label>
              <textarea
                rows={2}
                required
                value={saleDraft.offerText}
                onChange={(e) => setSaleDraft({ ...saleDraft, offerText: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6E6A61] mb-1">
                  Storefront Destination
                </label>
                <select
                  value={saleDraft.ctaTarget}
                  onChange={(e) =>
                    setSaleDraft({ ...saleDraft, ctaTarget: e.target.value as HeroCtaTarget })
                  }
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                >
                  <option value="curated-combos">Curated Combos</option>
                  <option value="combo-builder">Build Your Combo</option>
                  <option value="collection">All Fragrances</option>
                  <option value="attar">Attar Collection</option>
                  <option value="perfume-male">Men&apos;s Perfume</option>
                  <option value="perfume-female">Women&apos;s Perfume</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6E6A61] mb-1">
                  Custom Target Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., #curated-combos or https://..."
                  value={saleDraft.customUrl || ''}
                  onChange={(e) => setSaleDraft({ ...saleDraft, customUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#141414] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider cursor-pointer"
            >
              Save Special Sale Ad
            </button>
          </form>
        )}

        {/* COD ORDERS TAB */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#FAF8F4] border border-[#E5E0D8] p-10 text-center text-sm text-[#6E6A61]">
                No Cash on Delivery orders placed yet.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FAF8F4] border border-[#E5E0D8] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 text-xs text-[#8C6D32]">
                      <span className="font-mono font-semibold">{order.id}</span>
                      <span>·</span>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                      <span>·</span>
                      <span>{order.paymentMethod}</span>
                    </div>
                    <h3 className="font-display text-2xl text-[#141414]">
                      {order.customer.name} —{' '}
                      <span className="tabular-nums">{formatBDT(order.totalPayable)}</span>
                    </h3>
                    <p className="text-xs text-[#524E46]">
                      {order.customer.phone} · {order.customer.address}, {order.customer.cityArea}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="px-3 py-2 bg-[#F9F7F4] border border-[#DCD6CA] text-xs font-medium text-[#141414]"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
};
