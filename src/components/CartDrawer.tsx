import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem } from '../types/store';
import { formatBDT } from '../utils/currency';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  onClose: () => void;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onProceedCheckout: () => void;
}

export function getCartLineUnitPrice(item: CartItem): number {
  if (item.kind === 'single') return item.unitPrice;
  if (item.kind === 'curated_combo') return item.comboPrice;
  return item.finalPrice;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  freeDeliveryThreshold,
  standardDeliveryFee,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!open) return null;

  const subtotal = Math.round(
    items.reduce((sum, item) => sum + getCartLineUnitPrice(item) * item.quantity, 0)
  );
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const total = Math.round(subtotal + deliveryFee);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#141413]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FAF8F4] h-full border-l border-[#E4DFD5] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E4DFD5] flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-[#1A1917]">Your Bag</h2>
            <p className="text-xs text-[#6E6A61] mt-0.5">
              Cash on Delivery available on all orders
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#524E46] hover:text-[#1A1917] cursor-pointer"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-[#EFECE5] border-b border-[#E4DFD5] text-xs text-[#3C3933]">
            {remainingForFree === 0 ? (
              <span>Complimentary Express Cash-on-Delivery shipping unlocked.</span>
            ) : (
              <span>
                Add <strong className="tabular-nums">{formatBDT(remainingForFree)}</strong> more for
                complimentary delivery (otherwise {formatBDT(standardDeliveryFee)}).
              </span>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-8 h-8 text-[#B6914B] mb-4 stroke-[1.25]" />
              <p className="font-display text-2xl text-[#1A1917] mb-1">Your bag is empty</p>
              <p className="text-xs text-[#6E6A61] max-w-xs">
                Explore pure Attars, Eau de Parfums, or compose a custom combo with up to 15% savings.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const unitPrice = getCartLineUnitPrice(item);
              const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;

              return (
                <div
                  key={item.cartId}
                  className="pb-5 border-b border-[#E4DFD5] last:border-b-0 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#8C6D32]">
                        {item.kind === 'single'
                          ? item.category === 'attar'
                            ? `Attar · ${item.volume}`
                            : `Perfume · ${item.gender === 'male' ? 'Male' : 'Female'} · ${item.volume}`
                          : item.kind === 'curated_combo'
                            ? 'Curated Combo'
                            : `Custom Combo · ${Math.round(item.discountRate * 100)}% Off`}
                      </p>
                      <h3 className="font-display text-xl text-[#1A1917] mt-0.5">
                        {item.kind === 'single' ? item.name : item.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#1A1917] tabular-nums">
                        {formatBDT(lineTotal)}
                      </p>
                      {item.kind === 'custom_combo' && (
                        <p className="text-[11px] text-[#6E6A61] line-through tabular-nums">
                          {formatBDT(item.originalTotal * item.quantity)}
                        </p>
                      )}
                      {item.kind === 'curated_combo' && item.originalTotal > item.comboPrice && (
                        <p className="text-[11px] text-[#6E6A61] line-through tabular-nums">
                          {formatBDT(item.originalTotal * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Itemized Breakdown for Combos */}
                  {item.kind !== 'single' && (
                    <ul className="pl-3 border-l border-[#DCD6CA] space-y-1 text-xs text-[#524E46]">
                      {item.items.map((sub, i) => (
                        <li key={`${sub.productId}-${sub.volume}-${i}`}>
                          {sub.quantity}× {sub.name} ({sub.volume})
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Quantity & Remove */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="inline-flex items-center border border-[#DCD6CA]">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartId, -1)}
                        className="px-2.5 py-1 text-[#1A1917] hover:bg-[#EFECE5] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1 text-xs tabular-nums font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartId, 1)}
                        className="px-2.5 py-1 text-[#1A1917] hover:bg-[#EFECE5] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.cartId)}
                      className="text-xs text-[#6E6A61] hover:text-[#1A1917] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 bg-[#F7F5F0] border-t border-[#E4DFD5] space-y-4">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#524E46]">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatBDT(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-[#524E46]">
                <dt>Delivery</dt>
                <dd className="tabular-nums">
                  {deliveryFee === 0 ? 'Complimentary' : formatBDT(deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E4DFD5] font-semibold text-[#1A1917]">
                <dt>Total Payable (COD)</dt>
                <dd className="tabular-nums">{formatBDT(total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={onProceedCheckout}
              className="w-full py-3.5 bg-[#141413] text-[#F7F5F0] text-xs font-medium uppercase tracking-wider hover:bg-[#2B2926] transition-colors cursor-pointer"
            >
              Proceed to Cash on Delivery Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
