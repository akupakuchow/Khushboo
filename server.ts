import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import type {
  CartItem,
  CuratedCombo,
  HeroCtaTarget,
  HeroSlide,
  OrderRecord,
  OrderStatus,
  Product,
  PromoBannerCard,
  SpecialSaleAd,
  SplitPromoBanners,
} from './src/types/store.ts';
import {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  hashPasscode,
  mutateStore,
  readStore,
  verifyPasscodeHash,
} from './server/db.ts';

dotenv.config();

const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

function getEnvPasscode(): string {
  return (process.env.ADMIN_PASSCODE || '').trim();
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function signAdminToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 12 }),
    'utf-8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!payload || !sig) return false;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  if (!timingSafeStringEqual(sig, expectedSig)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }
  next();
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function computeDiscountRate(totalUnits: number): number {
  if (totalUnits >= 3) return 0.15;
  if (totalUnits === 2) return 0.1;
  return 0;
}

function roundMoney(n: number): number {
  return Math.round(n);
}

function sanitizeImageUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, 500);
  if (!trimmed) return undefined;
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/assets/')) {
    if (trimmed.includes('..') || trimmed.includes('\\')) return undefined;
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

const VALID_CTA_TARGETS: HeroCtaTarget[] = [
  'collection',
  'attar',
  'perfume-male',
  'perfume-female',
  'curated-combos',
  'combo-builder',
];

function sanitizeCtaTarget(value: unknown): HeroCtaTarget {
  return VALID_CTA_TARGETS.includes(value as HeroCtaTarget)
    ? (value as HeroCtaTarget)
    : 'collection';
}

function sanitizeActionUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, 400);
  if (!trimmed) return undefined;
  if (trimmed.startsWith('#')) {
    return /^#[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : undefined;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    if (trimmed.includes('..') || trimmed.includes('\\')) return undefined;
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
if (!UPLOADS_DIR.startsWith(PUBLIC_DIR + path.sep)) {
  throw new Error('Invalid uploads directory boundary');
}

const ALLOWED_IMAGE_MIME = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
]);

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = ALLOWED_IMAGE_MIME.get(file.mimetype.toLowerCase()) || '.jpg';
    const uniqueName = `khushboo-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

const uploadMiddleware = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.has(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, or AVIF images are allowed.'));
    }
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })
  );

  // Public Catalog
  app.get('/api/catalog', (_req, res) => {
    const db = readStore();
    res.json({
      products: db.products,
      curatedCombos: db.curatedCombos.filter((c) => c.active),
      heroSlides: db.heroSlides,
      promoBanners: db.promoBanners,
      specialSaleAd: db.specialSaleAd,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      standardDeliveryFee: STANDARD_DELIVERY_FEE,
    });
  });

  // Cash on Delivery Order Submission (server-side price recalculation)
  app.post('/api/orders', async (req, res) => {
    try {
      const body = req.body as {
        customer?: {
          name?: unknown;
          phone?: unknown;
          address?: unknown;
          cityArea?: unknown;
          notes?: unknown;
        };
        items?: unknown;
      };

      const name = sanitizeText(body.customer?.name, 120);
      const phone = sanitizeText(body.customer?.phone, 40);
      const address = sanitizeText(body.customer?.address, 300);
      const cityArea = sanitizeText(body.customer?.cityArea, 120);
      const notes = sanitizeText(body.customer?.notes, 400);

      if (!name || !phone || !address || !cityArea) {
        res.status(400).json({ error: 'Please complete all required delivery fields.' });
        return;
      }

      if (!Array.isArray(body.items) || body.items.length === 0) {
        res.status(400).json({ error: 'Your bag is empty.' });
        return;
      }

      const db = readStore();
      const productMap = new Map<string, Product>(db.products.map((p) => [p.id, p]));
      const comboMap = new Map<string, CuratedCombo>(db.curatedCombos.map((c) => [c.id, c]));

      const verifiedItems: CartItem[] = [];
      let subtotal = 0;

      for (const rawItem of body.items) {
        if (!rawItem || typeof rawItem !== 'object') {
          res.status(400).json({ error: 'Invalid bag item format.' });
          return;
        }
        const entry = rawItem as Record<string, unknown>;
        const qty = Number(entry.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
          res.status(400).json({ error: 'Invalid item quantity.' });
          return;
        }

        if (entry.kind === 'single') {
          const product = productMap.get(String(entry.productId || ''));
          if (!product || !product.inStock) {
            res.status(400).json({ error: 'One or more selected fragrances are unavailable.' });
            return;
          }
          const variant = product.variants.find((v) => v.volume === String(entry.volume || ''));
          if (!variant) {
            res.status(400).json({ error: `Invalid bottle size for ${product.name}.` });
            return;
          }
          const lineTotal = roundMoney(variant.price * qty);
          subtotal = roundMoney(subtotal + lineTotal);
          verifiedItems.push({
            kind: 'single',
            cartId: sanitizeText(entry.cartId, 80) || crypto.randomUUID(),
            productId: product.id,
            name: product.name,
            category: product.category,
            gender: product.gender,
            volume: variant.volume,
            unitPrice: variant.price,
            quantity: qty,
            accentHex: product.accentHex,
          });
        } else if (entry.kind === 'curated_combo') {
          const combo = comboMap.get(String(entry.comboId || ''));
          if (!combo || !combo.active) {
            res.status(400).json({ error: 'Selected curated combo is no longer active.' });
            return;
          }
          let originalTotal = 0;
          const resolvedRefs: Array<{
            productId: string;
            name: string;
            volume: string;
            quantity: number;
          }> = [];
          for (const ref of combo.items) {
            const prod = productMap.get(ref.productId);
            const variant = prod?.variants.find((v) => v.volume === ref.volume);
            if (!prod || !variant) {
              res.status(400).json({ error: 'Curated combo references an unavailable item.' });
              return;
            }
            originalTotal = roundMoney(originalTotal + variant.price * ref.quantity);
            resolvedRefs.push({
              productId: prod.id,
              name: prod.name,
              volume: variant.volume,
              quantity: ref.quantity,
            });
          }
          subtotal = roundMoney(subtotal + combo.comboPrice * qty);
          verifiedItems.push({
            kind: 'curated_combo',
            cartId: sanitizeText(entry.cartId, 80) || crypto.randomUUID(),
            comboId: combo.id,
            title: combo.title,
            comboPrice: combo.comboPrice,
            originalTotal,
            quantity: qty,
            items: resolvedRefs,
          });
        } else if (entry.kind === 'custom_combo') {
          const subItemsRaw = entry.items;
          if (!Array.isArray(subItemsRaw) || subItemsRaw.length === 0) {
            res.status(400).json({ error: 'Custom combo cannot be empty.' });
            return;
          }
          let totalUnits = 0;
          let originalTotal = 0;
          const resolvedSub: Array<{
            productId: string;
            name: string;
            category: Product['category'];
            gender?: Product['gender'];
            volume: string;
            unitPrice: number;
            quantity: number;
            accentHex: string;
          }> = [];

          for (const sub of subItemsRaw) {
            if (!sub || typeof sub !== 'object') {
              res.status(400).json({ error: 'Invalid custom combo item.' });
              return;
            }
            const subObj = sub as Record<string, unknown>;
            const subQty = Number(subObj.quantity);
            if (!Number.isInteger(subQty) || subQty < 1 || subQty > 20) {
              res.status(400).json({ error: 'Invalid quantity inside custom combo.' });
              return;
            }
            const prod = productMap.get(String(subObj.productId || ''));
            const variant = prod?.variants.find((v) => v.volume === String(subObj.volume || ''));
            if (!prod || !prod.inStock || !variant) {
              res.status(400).json({ error: 'Custom combo contains an unavailable item.' });
              return;
            }
            totalUnits += subQty;
            originalTotal = roundMoney(originalTotal + variant.price * subQty);
            resolvedSub.push({
              productId: prod.id,
              name: prod.name,
              category: prod.category,
              gender: prod.gender,
              volume: variant.volume,
              unitPrice: variant.price,
              quantity: subQty,
              accentHex: prod.accentHex,
            });
          }

          if (totalUnits < 2) {
            res.status(400).json({ error: 'Custom combos require at least 2 items.' });
            return;
          }

          const discountRate = computeDiscountRate(totalUnits);
          const discountAmount = roundMoney(originalTotal * discountRate);
          const finalPrice = roundMoney(originalTotal - discountAmount);
          subtotal = roundMoney(subtotal + finalPrice * qty);

          verifiedItems.push({
            kind: 'custom_combo',
            cartId: sanitizeText(entry.cartId, 80) || crypto.randomUUID(),
            title: sanitizeText(entry.title, 80) || `Custom Atelier Combo (${totalUnits} Bottles)`,
            quantity: qty,
            discountRate,
            originalTotal,
            discountAmount,
            finalPrice,
            items: resolvedSub,
          });
        } else {
          res.status(400).json({ error: 'Unsupported cart item kind.' });
          return;
        }
      }

      const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
      const totalPayable = roundMoney(subtotal + deliveryFee);

      const orderNumber = 1040 + db.orders.length + 1;
      const order: OrderRecord = {
        id: `KHB-${new Date().getFullYear()}-${orderNumber}`,
        createdAt: new Date().toISOString(),
        status: 'Confirmed',
        paymentMethod: 'Cash on Delivery',
        customer: { name, phone, address, cityArea, notes },
        items: verifiedItems,
        subtotal,
        deliveryFee,
        totalPayable,
      };

      await mutateStore((store) => {
        store.orders.unshift(order);
      });

      res.status(201).json({ order });
    } catch (err) {
      console.error('Order creation failed:', err);
      res.status(500).json({ error: 'Unable to submit order right now.' });
    }
  });

  // Admin Auth Status & Setup/Login
  app.get('/api/admin/status', (_req, res) => {
    const db = readStore();
    const envConfigured = Boolean(getEnvPasscode());
    const claimed = Boolean(db.adminCredential);
    res.json({
      needsSetup: !envConfigured && !claimed,
      envConfigured,
    });
  });

  app.post('/api/admin/claim', async (req, res) => {
    const envPass = getEnvPasscode();
    if (envPass) {
      res.status(409).json({ error: 'Admin passcode is configured via environment secret.' });
      return;
    }

    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (passcode.length < 6 || passcode.length > 128) {
      res.status(400).json({ error: 'Choose a passcode between 6 and 128 characters.' });
      return;
    }

    try {
      const result = await mutateStore((db) => {
        if (db.adminCredential) {
          return { alreadyClaimed: true };
        }
        const { salt, hash } = hashPasscode(passcode);
        db.adminCredential = {
          salt,
          hash,
          claimedAt: new Date().toISOString(),
        };
        return { alreadyClaimed: false };
      });

      if (result.alreadyClaimed) {
        res.status(409).json({ error: 'Admin access has already been claimed.' });
        return;
      }

      res.json({ token: signAdminToken() });
    } catch (err) {
      console.error('Admin claim failed:', err);
      res.status(500).json({ error: 'Unable to complete setup.' });
    }
  });

  app.post('/api/admin/login', (req, res) => {
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!passcode) {
      res.status(400).json({ error: 'Passcode is required.' });
      return;
    }

    const envPass = getEnvPasscode();
    if (envPass) {
      if (!timingSafeStringEqual(passcode, envPass)) {
        res.status(401).json({ error: 'Incorrect passcode.' });
        return;
      }
      res.json({ token: signAdminToken() });
      return;
    }

    const db = readStore();
    if (!db.adminCredential) {
      res.status(400).json({ error: 'Admin passcode has not been configured yet.' });
      return;
    }
    if (!verifyPasscodeHash(passcode, db.adminCredential)) {
      res.status(401).json({ error: 'Incorrect passcode.' });
      return;
    }
    res.json({ token: signAdminToken() });
  });

  // Protected Admin Routes
  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    const db = readStore();
    res.json({
      products: db.products,
      curatedCombos: db.curatedCombos,
      heroSlides: db.heroSlides,
      promoBanners: db.promoBanners,
      specialSaleAd: db.specialSaleAd,
      orders: db.orders,
    });
  });

  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    uploadMiddleware.single('image')(req, res, (err) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'Image upload failed.';
        res.status(400).json({ error: message });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: 'Please select an image file to upload.' });
        return;
      }
      const resolvedFile = path.resolve(UPLOADS_DIR, req.file.filename);
      if (!resolvedFile.startsWith(UPLOADS_DIR + path.sep)) {
        res.status(400).json({ error: 'Invalid upload file path.' });
        return;
      }
      res.status(201).json({ imageUrl: `/uploads/${req.file.filename}` });
    });
  });

  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    const b = req.body as Partial<Product>;
    const name = sanitizeText(b.name, 80);
    const subtitle = sanitizeText(b.subtitle, 120);
    const category = b.category === 'attar' || b.category === 'perfume' ? b.category : null;
    const gender =
      category === 'perfume' && (b.gender === 'male' || b.gender === 'female')
        ? b.gender
        : undefined;

    if (!name || !subtitle || !category || (category === 'perfume' && !gender)) {
      res.status(400).json({ error: 'Name, subtitle, category, and gender (for perfume) are required.' });
      return;
    }

    if (!Array.isArray(b.variants) || b.variants.length === 0) {
      res.status(400).json({ error: 'At least one volume/price variant is required.' });
      return;
    }

    const cleanVariants = b.variants
      .map((v) => {
        const variantImg = sanitizeImageUrl(v?.imageUrl);
        return {
          volume: sanitizeText(v?.volume, 20),
          price: Number(v?.price),
          ...(variantImg ? { imageUrl: variantImg } : {}),
        };
      })
      .filter((v) => v.volume && Number.isFinite(v.price) && v.price > 0);

    if (cleanVariants.length === 0) {
      res.status(400).json({ error: 'Provide valid positive variant prices.' });
      return;
    }

    const imageUrl = sanitizeImageUrl(b.imageUrl);

    const newProduct: Product = {
      id: `${category}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32)}-${crypto.randomBytes(2).toString('hex')}`,
      name,
      subtitle,
      category,
      gender,
      concentration: sanitizeText(b.concentration, 60) || (category === 'attar' ? 'Pure Oil Extrait' : 'Eau de Parfum'),
      origin: sanitizeText(b.origin, 60) || 'KHUSHBOO',
      description: sanitizeText(b.description, 400) || subtitle,
      notes: {
        top: sanitizeText(b.notes?.top, 120) || 'Bergamot, Saffron',
        middle: sanitizeText(b.notes?.middle, 120) || 'Damask Rose, Vetiver',
        base: sanitizeText(b.notes?.base, 120) || 'Sandalwood, Ambergris',
      },
      variants: cleanVariants,
      accentHex: /^#[0-9A-Fa-f]{6}$/.test(String(b.accentHex || '')) ? String(b.accentHex) : '#8C5E2A',
      ...(imageUrl ? { imageUrl } : {}),
      inStock: b.inStock !== false,
      featured: Boolean(b.featured),
    };

    await mutateStore((db) => {
      db.products.unshift(newProduct);
    });

    res.status(201).json({ product: newProduct });
  });

  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const b = req.body as Partial<Product>;

    const updated = await mutateStore((db) => {
      const idx = db.products.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      const existing = db.products[idx];

      const cleanVariants = Array.isArray(b.variants)
        ? b.variants
            .map((v, vIdx) => {
              const hasVarImgProp = v && Object.prototype.hasOwnProperty.call(v, 'imageUrl');
              const existingVar = existing.variants[vIdx];
              const nextVarImg = hasVarImgProp
                ? sanitizeImageUrl(v?.imageUrl)
                : existingVar?.imageUrl;
              return {
                volume: sanitizeText(v?.volume, 20),
                price: Number(v?.price),
                ...(nextVarImg ? { imageUrl: nextVarImg } : {}),
              };
            })
            .filter((v) => v.volume && Number.isFinite(v.price) && v.price > 0)
        : existing.variants;

      const hasImageProp = Object.prototype.hasOwnProperty.call(b, 'imageUrl');
      const nextImageUrl = hasImageProp ? sanitizeImageUrl(b.imageUrl) : existing.imageUrl;

      const next: Product = {
        ...existing,
        name: sanitizeText(b.name, 80) || existing.name,
        subtitle: sanitizeText(b.subtitle, 120) || existing.subtitle,
        concentration: sanitizeText(b.concentration, 60) || existing.concentration,
        origin: sanitizeText(b.origin, 60) || existing.origin,
        description: sanitizeText(b.description, 400) || existing.description,
        notes: {
          top: sanitizeText(b.notes?.top, 120) || existing.notes.top,
          middle: sanitizeText(b.notes?.middle, 120) || existing.notes.middle,
          base: sanitizeText(b.notes?.base, 120) || existing.notes.base,
        },
        variants: cleanVariants.length > 0 ? cleanVariants : existing.variants,
        imageUrl: nextImageUrl,
        inStock: typeof b.inStock === 'boolean' ? b.inStock : existing.inStock,
        featured: typeof b.featured === 'boolean' ? b.featured : existing.featured,
      };
      db.products[idx] = next;
      return next;
    });

    if (!updated) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json({ product: updated });
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const removed = await mutateStore((db) => {
      const before = db.products.length;
      db.products = db.products.filter((p) => p.id !== id);
      return db.products.length < before;
    });
    if (!removed) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/admin/combos', requireAdmin, async (req, res) => {
    const b = req.body as Partial<CuratedCombo>;
    const title = sanitizeText(b.title, 80);
    const subtitle = sanitizeText(b.subtitle, 120);
    const description = sanitizeText(b.description, 300);
    const comboPrice = Number(b.comboPrice);

    if (!title || !subtitle || !Number.isFinite(comboPrice) || comboPrice <= 0) {
      res.status(400).json({ error: 'Title, subtitle, and valid combo price are required.' });
      return;
    }

    if (!Array.isArray(b.items) || b.items.length < 2) {
      res.status(400).json({ error: 'A curated combo must contain at least 2 items.' });
      return;
    }

    const dbSnapshot = readStore();
    const validItems = b.items
      .map((item) => {
        const prod = dbSnapshot.products.find((p) => p.id === String(item?.productId || ''));
        const variant = prod?.variants.find((v) => v.volume === String(item?.volume || ''));
        const qty = Number(item?.quantity) || 1;
        if (!prod || !variant || qty < 1) return null;
        return { productId: prod.id, volume: variant.volume, quantity: qty };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (validItems.length < 2) {
      res.status(400).json({ error: 'Select at least 2 valid products and sizes.' });
      return;
    }

    const comboImageUrl = sanitizeImageUrl(b.imageUrl);

    const newCombo: CuratedCombo = {
      id: `combo-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 28)}-${crypto.randomBytes(2).toString('hex')}`,
      title,
      subtitle,
      description: description || subtitle,
      items: validItems,
      comboPrice: roundMoney(comboPrice),
      ...(comboImageUrl ? { imageUrl: comboImageUrl } : {}),
      active: b.active !== false,
      tag: sanitizeText(b.tag, 40) || 'Curated Offer',
    };

    await mutateStore((db) => {
      db.curatedCombos.unshift(newCombo);
    });

    res.status(201).json({ combo: newCombo });
  });

  app.put('/api/admin/combos/:id', requireAdmin, async (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const b = req.body as Partial<CuratedCombo>;
    const updated = await mutateStore((db) => {
      const idx = db.curatedCombos.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      const existing = db.curatedCombos[idx];
      const nextPrice = Number(b.comboPrice);
      const hasImageProp = Object.prototype.hasOwnProperty.call(b, 'imageUrl');
      const nextImageUrl = hasImageProp ? sanitizeImageUrl(b.imageUrl) : existing.imageUrl;

      let nextItems = existing.items;
      if (Array.isArray(b.items) && b.items.length >= 2) {
        const candidateItems = b.items
          .map((item) => {
            const prod = db.products.find((p) => p.id === String(item?.productId || ''));
            const variant = prod?.variants.find((v) => v.volume === String(item?.volume || ''));
            const qty = Number(item?.quantity) || 1;
            if (!prod || !variant || qty < 1) return null;
            return { productId: prod.id, volume: variant.volume, quantity: qty };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        if (candidateItems.length >= 2) {
          nextItems = candidateItems;
        }
      }

      const next: CuratedCombo = {
        ...existing,
        title: sanitizeText(b.title, 80) || existing.title,
        subtitle: sanitizeText(b.subtitle, 120) || existing.subtitle,
        description: sanitizeText(b.description, 300) || existing.description,
        items: nextItems,
        comboPrice: Number.isFinite(nextPrice) && nextPrice > 0 ? roundMoney(nextPrice) : existing.comboPrice,
        imageUrl: nextImageUrl,
        active: typeof b.active === 'boolean' ? b.active : existing.active,
        tag: sanitizeText(b.tag, 40) || existing.tag,
      };
      db.curatedCombos[idx] = next;
      return next;
    });

    if (!updated) {
      res.status(404).json({ error: 'Curated combo not found.' });
      return;
    }
    res.json({ combo: updated });
  });

  app.delete('/api/admin/combos/:id', requireAdmin, async (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const removed = await mutateStore((db) => {
      const before = db.curatedCombos.length;
      db.curatedCombos = db.curatedCombos.filter((c) => c.id !== id);
      return db.curatedCombos.length < before;
    });
    if (!removed) {
      res.status(404).json({ error: 'Curated combo not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // Hero Slider Management (up to 4 slides)
  app.post('/api/admin/slides', requireAdmin, async (req, res) => {
    const b = req.body as Partial<HeroSlide>;
    const headline = sanitizeText(b.headline, 120);
    const subtitle = sanitizeText(b.subtitle, 280);
    const ctaText = sanitizeText(b.ctaText, 40) || 'EXPLORE COLLECTIONS';

    if (!headline || !subtitle) {
      res.status(400).json({ error: 'Slide headline and subtitle are required.' });
      return;
    }

    const slideImageUrl = sanitizeImageUrl(b.imageUrl);
    const newSlide: HeroSlide = {
      id: `slide-${crypto.randomBytes(4).toString('hex')}`,
      kicker: sanitizeText(b.kicker, 48) || 'KHUSHBOO COLLECTION',
      headline,
      subtitle,
      ctaText,
      ctaTarget: sanitizeCtaTarget(b.ctaTarget),
      ...(slideImageUrl ? { imageUrl: slideImageUrl } : {}),
    };

    const result = await mutateStore((db) => {
      if (db.heroSlides.length >= 4) {
        return { limitReached: true };
      }
      db.heroSlides.push(newSlide);
      return { limitReached: false, slide: newSlide };
    });

    if (result.limitReached) {
      res.status(400).json({ error: 'Maximum of 4 hero slides allowed.' });
      return;
    }

    res.status(201).json({ slide: newSlide });
  });

  app.put('/api/admin/slides/:id', requireAdmin, async (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const b = req.body as Partial<HeroSlide>;

    const updated = await mutateStore((db) => {
      const idx = db.heroSlides.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      const existing = db.heroSlides[idx];
      const hasImageProp = Object.prototype.hasOwnProperty.call(b, 'imageUrl');
      const nextImageUrl = hasImageProp ? sanitizeImageUrl(b.imageUrl) : existing.imageUrl;

      const next: HeroSlide = {
        ...existing,
        kicker: sanitizeText(b.kicker, 48) || existing.kicker,
        headline: sanitizeText(b.headline, 120) || existing.headline,
        subtitle: sanitizeText(b.subtitle, 280) || existing.subtitle,
        ctaText: sanitizeText(b.ctaText, 40) || existing.ctaText,
        ctaTarget: b.ctaTarget ? sanitizeCtaTarget(b.ctaTarget) : existing.ctaTarget,
        imageUrl: nextImageUrl,
      };
      db.heroSlides[idx] = next;
      return next;
    });

    if (!updated) {
      res.status(404).json({ error: 'Hero slide not found.' });
      return;
    }
    res.json({ slide: updated });
  });

  app.put('/api/admin/slides-reorder', requireAdmin, async (req, res) => {
    const order = req.body?.slideIds;
    if (!Array.isArray(order)) {
      res.status(400).json({ error: 'slideIds array is required.' });
      return;
    }

    const slides = await mutateStore((db) => {
      const map = new Map(db.heroSlides.map((s) => [s.id, s]));
      const reordered: HeroSlide[] = [];
      for (const id of order) {
        const s = map.get(String(id));
        if (s) {
          reordered.push(s);
          map.delete(String(id));
        }
      }
      for (const leftover of map.values()) {
        reordered.push(leftover);
      }
      db.heroSlides = reordered;
      return reordered;
    });

    res.json({ heroSlides: slides });
  });

  app.delete('/api/admin/slides/:id', requireAdmin, async (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const result = await mutateStore((db) => {
      if (db.heroSlides.length <= 1) {
        return { tooFew: true, removed: false };
      }
      const before = db.heroSlides.length;
      db.heroSlides = db.heroSlides.filter((s) => s.id !== id);
      return { tooFew: false, removed: db.heroSlides.length < before };
    });

    if (result.tooFew) {
      res.status(400).json({ error: 'At least 1 hero slide must remain active.' });
      return;
    }
    if (!result.removed) {
      res.status(404).json({ error: 'Hero slide not found.' });
      return;
    }
    res.json({ ok: true });
  });

  // Split Promo Banners Management (Left: Build Your Own Combo, Right: Curated Combos)
  app.put('/api/admin/promo-banners', requireAdmin, async (req, res) => {
    const body = req.body as Partial<SplitPromoBanners>;

    const updated = await mutateStore((db) => {
      const sanitizeCard = (
        incoming: Partial<PromoBannerCard> | undefined,
        fallback: PromoBannerCard
      ): PromoBannerCard => {
        const hasImgProp = incoming && Object.prototype.hasOwnProperty.call(incoming, 'imageUrl');
        const nextImg = hasImgProp ? sanitizeImageUrl(incoming?.imageUrl) : fallback.imageUrl;
        return {
          eyebrow: sanitizeText(incoming?.eyebrow, 60) || fallback.eyebrow,
          heading: sanitizeText(incoming?.heading, 90) || fallback.heading,
          description: sanitizeText(incoming?.description, 260) || fallback.description,
          buttonLabel: sanitizeText(incoming?.buttonLabel, 48) || fallback.buttonLabel,
          ...(nextImg ? { imageUrl: nextImg } : {}),
        };
      };

      db.promoBanners = {
        left: sanitizeCard(body.left, db.promoBanners.left),
        right: sanitizeCard(body.right, db.promoBanners.right),
      };
      return db.promoBanners;
    });

    res.json({ promoBanners: updated });
  });

  // Special Sale Ad Management
  app.put('/api/admin/special-sale', requireAdmin, async (req, res) => {
    const b = req.body as Partial<SpecialSaleAd>;

    const updated = await mutateStore((db) => {
      const existing = db.specialSaleAd;
      const hasImgProp = Object.prototype.hasOwnProperty.call(b, 'imageUrl');
      const nextImg = hasImgProp ? sanitizeImageUrl(b.imageUrl) : existing.imageUrl;
      const hasCustomUrlProp = Object.prototype.hasOwnProperty.call(b, 'customUrl');
      const nextCustomUrl = hasCustomUrlProp
        ? sanitizeActionUrl(b.customUrl)
        : existing.customUrl;

      const next: SpecialSaleAd = {
        active: typeof b.active === 'boolean' ? b.active : existing.active,
        eyebrow: sanitizeText(b.eyebrow, 60) || existing.eyebrow,
        title: sanitizeText(b.title, 100) || existing.title,
        offerText: sanitizeText(b.offerText, 260) || existing.offerText,
        buttonText: sanitizeText(b.buttonText, 48) || existing.buttonText,
        ctaTarget: b.ctaTarget ? sanitizeCtaTarget(b.ctaTarget) : existing.ctaTarget,
        ...(nextCustomUrl ? { customUrl: nextCustomUrl } : {}),
        ...(nextImg ? { imageUrl: nextImg } : {}),
      };
      db.specialSaleAd = next;
      return next;
    });

    res.json({ specialSaleAd: updated });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    const id = sanitizeText(req.params.id, 80);
    const allowed: OrderStatus[] = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
    const status = req.body?.status as OrderStatus;
    if (!allowed.includes(status)) {
      res.status(400).json({ error: 'Invalid order status.' });
      return;
    }

    const updated = await mutateStore((db) => {
      const order = db.orders.find((o) => o.id === id);
      if (!order) return null;
      order.status = status;
      return order;
    });

    if (!updated) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.json({ order: updated });
  });

  // Frontend Vite Dev Middleware or Static Dist Serving
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Khushboo Atelier running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
