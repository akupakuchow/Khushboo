import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  CuratedCombo,
  HeroSlide,
  OrderRecord,
  Product,
  SpecialSaleAd,
  SplitPromoBanners,
} from '../src/types/store.ts';

export interface AdminCredential {
  salt: string;
  hash: string;
  claimedAt: string;
}

export interface StoreDatabase {
  currency: 'BDT';
  products: Product[];
  curatedCombos: CuratedCombo[];
  heroSlides: HeroSlide[];
  promoBanners: SplitPromoBanners;
  specialSaleAd: SpecialSaleAd;
  orders: OrderRecord[];
  adminCredential: AdminCredential | null;
}

export const FREE_DELIVERY_THRESHOLD = 5000;
export const STANDARD_DELIVERY_FEE = 120;

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'store.json');

if (!STORE_FILE.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Invalid store file boundary');
}

const SEED_PRODUCTS: Product[] = [
  {
    id: 'attar-royal-oud',
    name: 'Oud Al-Mulk',
    subtitle: 'Aged Assam Agarwood & Smoked Saffron',
    category: 'attar',
    concentration: 'Pure Oil Extrait',
    origin: 'Kannauj · Small Batch',
    description:
      'Matured in cedarwood vessels for eighteen months, Oud Al-Mulk opens with golden Kashmiri saffron threads before settling into resinous wild agarwood and warm ambergris.',
    notes: {
      top: 'Kashmiri Saffron, Black Cardamom',
      middle: 'Aged Assam Oud, Damask Rose',
      base: 'Ambergris, Mysore Sandalwood, Labdanum',
    },
    variants: [
      { volume: '3ml', price: 2200 },
      { volume: '6ml', price: 3950 },
      { volume: '12ml', price: 7200 },
    ],
    accentHex: '#8C5E2A',
    inStock: true,
    featured: true,
  },
  {
    id: 'attar-shamama-amber',
    name: 'Shamama Reserve',
    subtitle: 'Forty-Herb Spiced Amber Elixir',
    category: 'attar',
    concentration: 'Pure Oil Extrait',
    origin: 'Kannauj · Heritage Blend',
    description:
      'A classic winter composition hydro-distilled over sandalwood base oil with warming cloves, nutmeg, vetiver root, and golden benzoin resin.',
    notes: {
      top: 'Nutmeg, Clove Bud, Sweet Cinnamon',
      middle: 'Wild Honey, Vetiver Root, Saffron',
      base: 'Aged Sandalwood, Siam Benzoin, Dark Amber',
    },
    variants: [
      { volume: '3ml', price: 1850 },
      { volume: '6ml', price: 3300 },
      { volume: '12ml', price: 5900 },
    ],
    accentHex: '#A67232',
    inStock: true,
    featured: true,
  },
  {
    id: 'attar-ruh-gulab',
    name: 'Ruh Gulab',
    subtitle: 'Dawn-Harvested Damask Rose Oil',
    category: 'attar',
    concentration: 'Pure Hydro-Distillation',
    origin: 'Aligarh · Copper Deg',
    description:
      'Five thousand hand-picked crimson rose blossoms distilled at dawn in traditional copper stills, capturing velvety petal nectar with green stem crispness.',
    notes: {
      top: 'Dewy Rose Petal, Pink Peppercorn',
      middle: 'Damask Rose Otto, Geranium Leaf',
      base: 'White Musk, Soft Sandalwood',
    },
    variants: [
      { volume: '3ml', price: 2100 },
      { volume: '6ml', price: 3750 },
      { volume: '12ml', price: 6800 },
    ],
    accentHex: '#9E4D58',
    inStock: true,
  },
  {
    id: 'attar-ruh-khus',
    name: 'Ruh Khus',
    subtitle: 'Wild Monsoon Vetiver Root',
    category: 'attar',
    concentration: 'Pure Botanical Oil',
    origin: 'North India · Rain-Fed',
    description:
      'Deep emerald vetiver roots extracted through slow copper-pot distillation. Earthy, cooling, and remarkably crisp on warm skin.',
    notes: {
      top: 'Crushed Green Leaf, Rain-Soaked Earth',
      middle: 'Wild Vetiver Root, Cypress',
      base: 'Oakmoss, Dry Cedarwood',
    },
    variants: [
      { volume: '3ml', price: 1550 },
      { volume: '6ml', price: 2800 },
      { volume: '12ml', price: 5100 },
    ],
    accentHex: '#3D5E4A',
    inStock: true,
  },
  {
    id: 'attar-misk-tahara',
    name: 'Misk Al-Noor',
    subtitle: 'Luminous White Musk & Lotus',
    category: 'attar',
    concentration: 'Silky Oil Extrait',
    origin: 'Atelier Signature',
    description:
      'Clean, enveloping white skin musk softened by powdery iris root, white lotus, and crystalline cashmere woods for effortless daily wear.',
    notes: {
      top: 'White Lotus, Aldehydes, Pear Blossom',
      middle: 'Orris Butter, Jasmine Sambac',
      base: 'Clean White Musk, Cashmere Wood',
    },
    variants: [
      { volume: '3ml', price: 1450 },
      { volume: '6ml', price: 2600 },
      { volume: '12ml', price: 4800 },
    ],
    accentHex: '#B8A88A',
    inStock: true,
  },
  {
    id: 'attar-amber-sultan',
    name: 'Ambergris & Myrrh',
    subtitle: 'Resinous Desert Balsam Oil',
    category: 'attar',
    concentration: 'Pure Oil Extrait',
    origin: 'Omani Resin Infusion',
    description:
      'Sacred Somalian myrrh tears melted into dark vanilla bean, smoked frankincense, and mineral sea ambergris.',
    notes: {
      top: 'Hojari Frankincense, Bergamot Peel',
      middle: 'Myrrh Resin, Warm Labdanum',
      base: 'Dark Vanilla Pod, Sea Ambergris',
    },
    variants: [
      { volume: '3ml', price: 1950 },
      { volume: '6ml', price: 3500 },
      { volume: '12ml', price: 6400 },
    ],
    accentHex: '#7A542E',
    inStock: true,
  },
  {
    id: 'perfume-male-noir-cedar',
    name: 'Santal Nocturne',
    subtitle: 'Smoked Atlas Cedar & Black Cardamom',
    category: 'perfume',
    gender: 'male',
    concentration: 'Eau de Parfum',
    origin: 'Grasse & Kannauj',
    description:
      'Architectural dark woods meet cool crushed cardamom and dry leather. Built with high oil concentration for commanding evening projection.',
    notes: {
      top: 'Black Cardamom, Calabrian Bergamot',
      middle: 'Atlas Cedar, Violet Leaf, Incense',
      base: 'Saddle Leather, Smoked Vetiver, Tonka',
    },
    variants: [
      { volume: '30ml', price: 3200 },
      { volume: '50ml', price: 4900 },
      { volume: '100ml', price: 7800 },
    ],
    accentHex: '#3A3A38',
    inStock: true,
    featured: true,
  },
  {
    id: 'perfume-male-oud-mineral',
    name: 'Oud Cuir',
    subtitle: 'Dry Saffron Leather & Mineral Wood',
    category: 'perfume',
    gender: 'male',
    concentration: 'Extrait de Parfum',
    origin: 'Atelier Signature',
    description:
      'Refined suede wrapped around crisp juniper berry, dry agarwood smoke, and cool sea salt crystals.',
    notes: {
      top: 'Juniper Berry, Bitter Grapefruit',
      middle: 'Saffron Suede, Clary Sage',
      base: 'Dry Agarwood, Patchouli, Mineral Amber',
    },
    variants: [
      { volume: '30ml', price: 3500 },
      { volume: '50ml', price: 5400 },
      { volume: '100ml', price: 8500 },
    ],
    accentHex: '#4E4337',
    inStock: true,
  },
  {
    id: 'perfume-male-bergamot-vetiver',
    name: 'Vétiver Gris',
    subtitle: 'Crisp Citrus & Charcoal Vetiver',
    category: 'perfume',
    gender: 'male',
    concentration: 'Eau de Parfum',
    origin: 'Atelier Signature',
    description:
      'Sun-drenched Amalfi citron balanced against brisk black pepper, Haitian vetiver, and clean cedar shavings.',
    notes: {
      top: 'Amalfi Citron, Crushed Black Pepper',
      middle: 'Haitian Vetiver, Cypress Needle',
      base: 'Cedarwood, White Amber, Ambroxan',
    },
    variants: [
      { volume: '30ml', price: 2850 },
      { volume: '50ml', price: 4400 },
      { volume: '100ml', price: 6900 },
    ],
    accentHex: '#516158',
    inStock: true,
  },
  {
    id: 'perfume-male-spice-tobacco',
    name: 'Tabac Doré',
    subtitle: 'Golden Tobacco Leaf & Bourbon Vanilla',
    category: 'perfume',
    gender: 'male',
    concentration: 'Eau de Parfum',
    origin: 'Winter Reserve',
    description:
      'Warm cured tobacco leaf infused with toasted tonka bean, spiced rum accord, and smooth sandalwood.',
    notes: {
      top: 'Ginger Root, Dried Plum, Davana',
      middle: 'Cured Tobacco Leaf, Cacao Husk',
      base: 'Bourbon Vanilla, Tonka Bean, Guaiac Wood',
    },
    variants: [
      { volume: '30ml', price: 3350 },
      { volume: '50ml', price: 5100 },
      { volume: '100ml', price: 8100 },
    ],
    accentHex: '#784A2A',
    inStock: true,
  },
  {
    id: 'perfume-female-jasmine-silk',
    name: 'Jasmin Soie',
    subtitle: 'Night-Blooming Jasmine & Sandalwood',
    category: 'perfume',
    gender: 'female',
    concentration: 'Eau de Parfum',
    origin: 'Atelier Signature',
    description:
      'Intoxicating Madurai jasmine sambac draped in sheer white tea, creamy tuberose, and warm sandalwood milk.',
    notes: {
      top: 'White Tea, Mandarin Zest, Pear',
      middle: 'Jasmine Sambac, Sheer Tuberose',
      base: 'Mysore Sandalwood, Soft Musk, Benzoin',
    },
    variants: [
      { volume: '30ml', price: 3100 },
      { volume: '50ml', price: 4700 },
      { volume: '100ml', price: 7500 },
    ],
    accentHex: '#C5A059',
    inStock: true,
    featured: true,
  },
  {
    id: 'perfume-female-rose-oud',
    name: 'Rose Velours',
    subtitle: 'Velvet Taif Rose & Smoked Praline',
    category: 'perfume',
    gender: 'female',
    concentration: 'Extrait de Parfum',
    origin: 'Atelier Signature',
    description:
      'Lush Taif rose petals steeped in blackcurrant nectar, velvety cashmere wood, and subtle dark agarwood warmth.',
    notes: {
      top: 'Blackcurrant Bud, Lychee, Pink Pepper',
      middle: 'Taif Rose, Peony, Violet',
      base: 'Cashmere Wood, Subtle Oud, Praline',
    },
    variants: [
      { volume: '30ml', price: 3400 },
      { volume: '50ml', price: 5200 },
      { volume: '100ml', price: 8200 },
    ],
    accentHex: '#9E5461',
    inStock: true,
  },
  {
    id: 'perfume-female-neroli-iris',
    name: 'Néroli Blanc',
    subtitle: 'Tunisian Orange Blossom & Orris',
    category: 'perfume',
    gender: 'female',
    concentration: 'Eau de Parfum',
    origin: 'Mediterranean Harvest',
    description:
      'Radiant orange blossom water meets powdery Florentine iris butter and warm honeyed almond milk.',
    notes: {
      top: 'Neroli Petals, Bitter Orange, Bergamot',
      middle: 'Florentine Iris, Orange Blossom',
      base: 'Almond Milk, White Musk, Cedar',
    },
    variants: [
      { volume: '30ml', price: 2800 },
      { volume: '50ml', price: 4350 },
      { volume: '100ml', price: 6800 },
    ],
    accentHex: '#C9AD7E',
    inStock: true,
  },
  {
    id: 'perfume-female-amber-fig',
    name: 'Figue Ambrée',
    subtitle: 'Sun-Warmed Black Fig & Golden Amber',
    category: 'perfume',
    gender: 'female',
    concentration: 'Eau de Parfum',
    origin: 'Atelier Signature',
    description:
      'Ripe Mediterranean black fig and crushed fig leaf layered over golden amber resin and smooth coconut sandalwood.',
    notes: {
      top: 'Crushed Fig Leaf, Green Mandarin',
      middle: 'Black Fig Nectar, Heliotrope',
      base: 'Golden Amber, Sandalwood, Tonka',
    },
    variants: [
      { volume: '30ml', price: 2950 },
      { volume: '50ml', price: 4600 },
      { volume: '100ml', price: 7200 },
    ],
    accentHex: '#7D5C6E',
    inStock: true,
  },
];

const SEED_COMBOS: CuratedCombo[] = [
  {
    id: 'combo-royal-layering',
    title: 'The Royal Layering Coffret',
    subtitle: 'Attar + Eau de Parfum Duo',
    description:
      'Designed for signature scent layering: apply Oud Al-Mulk oil to pulse points beneath Santal Nocturne for a twelve-hour trail.',
    items: [
      { productId: 'attar-royal-oud', volume: '6ml', quantity: 1 },
      { productId: 'perfume-male-noir-cedar', volume: '50ml', quantity: 1 },
    ],
    comboPrice: 7450,
    active: true,
    tag: 'Signature Pair',
  },
  {
    id: 'combo-silk-petal-edit',
    title: 'Silk & Rose Atelier Set',
    subtitle: 'Pure Rose Attar + Floral Parfum',
    description:
      'An intimate pairing of dawn-distilled Ruh Gulab oil with night-blooming Jasmin Soie Eau de Parfum.',
    items: [
      { productId: 'attar-ruh-gulab', volume: '6ml', quantity: 1 },
      { productId: 'perfume-female-jasmine-silk', volume: '50ml', quantity: 1 },
    ],
    comboPrice: 7150,
    active: true,
    tag: 'Limited Season',
  },
  {
    id: 'combo-discovery-trio',
    title: 'Kannauj Heritage Trio',
    subtitle: 'Three 6ml Pure Attar Flacons',
    description:
      'Experience the full spectrum of artisanal distillation: aged agarwood, forty-herb Shamama, and monsoon vetiver.',
    items: [
      { productId: 'attar-royal-oud', volume: '6ml', quantity: 1 },
      { productId: 'attar-shamama-amber', volume: '6ml', quantity: 1 },
      { productId: 'attar-ruh-khus', volume: '6ml', quantity: 1 },
    ],
    comboPrice: 8250,
    active: true,
    tag: 'Collector Edition',
  },
];

const SEED_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-signature-impression',
    kicker: 'CRAFTED FOR MOMENTS',
    headline: 'Scents that leave a lasting impression.',
    subtitle:
      'Artisanal pure attars and architectural perfumes, thoughtfully crafted with the finest botanical ingredients from around the world.',
    ctaText: 'EXPLORE COLLECTIONS',
    ctaTarget: 'collection',
  },
  {
    id: 'slide-pure-attars',
    kicker: 'TRADITIONAL DISTILLATION',
    headline: 'Aged oud & pure botanical oils.',
    subtitle:
      'Alcohol-free hydro-distilled attars matured in cedarwood vessels—available in 3ml, 6ml, and 12ml crystal flacons.',
    ctaText: 'SHOP PURE ATTARS',
    ctaTarget: 'attar',
  },
  {
    id: 'slide-custom-combo',
    kicker: 'BESPOKE LAYERING',
    headline: 'Compose your signature fragrance trio.',
    subtitle:
      'Mix any Attars and Perfumes in our Custom Combo Studio to unlock 10% off 2 bottles or 15% off 3+ bottles.',
    ctaText: 'BUILD YOUR COMBO',
    ctaTarget: 'combo-builder',
  },
];

const SEED_PROMO_BANNERS: SplitPromoBanners = {
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

const SEED_SPECIAL_SALE_AD: SpecialSaleAd = {
  active: false,
  eyebrow: 'LIMITED SEASONAL OFFER',
  title: 'Eid Flash Sale — Flat 20% Off',
  offerText:
    'Celebrate with artisanal pure attars and Eau de Parfum gift sets—delivered nationwide with Cash on Delivery.',
  buttonText: 'SHOP CURATED OFFERS',
  ctaTarget: 'curated-combos',
};

let writeChain: Promise<void> = Promise.resolve();

function ensureInitialized(): StoreDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initial: StoreDatabase = {
      currency: 'BDT',
      products: SEED_PRODUCTS,
      curatedCombos: SEED_COMBOS,
      heroSlides: SEED_HERO_SLIDES,
      promoBanners: SEED_PROMO_BANNERS,
      specialSaleAd: SEED_SPECIAL_SALE_AD,
      orders: [],
      adminCredential: null,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  const raw = fs.readFileSync(STORE_FILE, 'utf-8');
  const parsed = JSON.parse(raw) as Partial<StoreDatabase>;
  const promoBanners: SplitPromoBanners = {
    left: {
      ...SEED_PROMO_BANNERS.left,
      ...(parsed.promoBanners?.left || {}),
    },
    right: {
      ...SEED_PROMO_BANNERS.right,
      ...(parsed.promoBanners?.right || {}),
    },
  };
  const specialSaleAd: SpecialSaleAd = {
    ...SEED_SPECIAL_SALE_AD,
    ...(parsed.specialSaleAd || {}),
  };

  if (parsed.currency !== 'BDT') {
    const migrated: StoreDatabase = {
      currency: 'BDT',
      products: SEED_PRODUCTS,
      curatedCombos: SEED_COMBOS,
      heroSlides:
        Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0
          ? parsed.heroSlides
          : SEED_HERO_SLIDES,
      promoBanners,
      specialSaleAd,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      adminCredential: parsed.adminCredential ?? null,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(migrated, null, 2), 'utf-8');
    return migrated;
  }
  const heroSlides =
    Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0
      ? parsed.heroSlides
      : SEED_HERO_SLIDES;
  return {
    currency: 'BDT',
    products: Array.isArray(parsed.products) ? parsed.products : SEED_PRODUCTS,
    curatedCombos: Array.isArray(parsed.curatedCombos) ? parsed.curatedCombos : SEED_COMBOS,
    heroSlides,
    promoBanners,
    specialSaleAd,
    orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    adminCredential: parsed.adminCredential ?? null,
  };
}

export function readStore(): StoreDatabase {
  return ensureInitialized();
}

export async function mutateStore<T>(mutator: (db: StoreDatabase) => T): Promise<T> {
  let result!: T;
  writeChain = writeChain.then(() => {
    const db = ensureInitialized();
    result = mutator(db);
    const tmpPath = path.resolve(DATA_DIR, `store.${process.pid}.tmp.json`);
    if (!tmpPath.startsWith(DATA_DIR + path.sep)) {
      throw new Error('Invalid temp store path');
    }
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpPath, STORE_FILE);
  });
  await writeChain;
  return result;
}

export function hashPasscode(passcode: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, salt, 64).toString('hex');
  return { salt, hash: derived };
}

export function verifyPasscodeHash(passcode: string, cred: AdminCredential): boolean {
  const derived = crypto.scryptSync(passcode, cred.salt, 64);
  const stored = Buffer.from(cred.hash, 'hex');
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}
