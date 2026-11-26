export type ProductCategory = 'attar' | 'perfume';
export type PerfumeGender = 'male' | 'female';

export interface ProductVariant {
  volume: string;
  price: number;
  imageUrl?: string;
}

export interface FragranceNotes {
  top: string;
  middle: string;
  base: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  gender?: PerfumeGender;
  concentration: string;
  origin: string;
  description: string;
  notes: FragranceNotes;
  variants: ProductVariant[];
  accentHex: string;
  imageUrl?: string;
  inStock: boolean;
  featured?: boolean;
}

export interface CuratedComboItemRef {
  productId: string;
  volume: string;
  quantity: number;
}

export interface CuratedCombo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  items: CuratedComboItemRef[];
  comboPrice: number;
  imageUrl?: string;
  active: boolean;
  tag?: string;
}

export type HeroCtaTarget =
  | 'collection'
  | 'attar'
  | 'perfume-male'
  | 'perfume-female'
  | 'curated-combos'
  | 'combo-builder';

export interface HeroSlide {
  id: string;
  kicker: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaTarget: HeroCtaTarget;
  imageUrl?: string;
}

export interface PromoBannerCard {
  eyebrow: string;
  heading: string;
  description: string;
  buttonLabel: string;
  imageUrl?: string;
}

export interface SplitPromoBanners {
  left: PromoBannerCard;
  right: PromoBannerCard;
}

export interface SpecialSaleAd {
  active: boolean;
  eyebrow: string;
  title: string;
  offerText: string;
  buttonText: string;
  ctaTarget: HeroCtaTarget;
  customUrl?: string;
  imageUrl?: string;
}

export interface CartSingleItem {
  kind: 'single';
  cartId: string;
  productId: string;
  name: string;
  category: ProductCategory;
  gender?: PerfumeGender;
  volume: string;
  unitPrice: number;
  quantity: number;
  accentHex: string;
}

export interface CartCuratedComboItem {
  kind: 'curated_combo';
  cartId: string;
  comboId: string;
  title: string;
  comboPrice: number;
  originalTotal: number;
  quantity: number;
  items: Array<{
    productId: string;
    name: string;
    volume: string;
    quantity: number;
  }>;
}

export interface CartCustomComboItem {
  kind: 'custom_combo';
  cartId: string;
  title: string;
  quantity: number;
  discountRate: number;
  originalTotal: number;
  discountAmount: number;
  finalPrice: number;
  items: Array<{
    productId: string;
    name: string;
    category: ProductCategory;
    gender?: PerfumeGender;
    volume: string;
    unitPrice: number;
    quantity: number;
    accentHex: string;
  }>;
}

export type CartItem = CartSingleItem | CartCuratedComboItem | CartCustomComboItem;

export type OrderStatus = 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered';

export interface OrderRecord {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: 'Cash on Delivery';
  customer: {
    name: string;
    phone: string;
    address: string;
    cityArea: string;
    notes: string;
  };
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalPayable: number;
}

export interface CatalogResponse {
  products: Product[];
  curatedCombos: CuratedCombo[];
  heroSlides: HeroSlide[];
  promoBanners: SplitPromoBanners;
  specialSaleAd: SpecialSaleAd;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
}
