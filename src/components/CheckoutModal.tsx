import React, { useState } from 'react';
import { Banknote, CheckCircle2, X } from 'lucide-react';
import type { CartItem, OrderRecord } from '../types/store';
import { formatBDT } from '../utils/currency';
import { getCartLineUnitPrice } from './CartDrawer';

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  onClose: () => void;
  onOrderSuccess: (order: OrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  items,
  freeDeliveryThreshold,
  standardDeliveryFee,
  onClose,
  onOrderSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cityArea, setCityArea] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  if (!open) return null;

  const subtotal = Math.round(
    items.reduce((sum, item) => sum + getCartLineUnitPrice(item) * item.quantity, 0)
  );
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
  const totalPayable = Math.round(subtotal + deliveryFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name, phone, address, cityArea, notes },
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not place order.');
        return;
      }
      setConfirmedOrder(data.order as OrderRecord);
      onOrderSuccess(data.order as OrderRecord);
    } catch {
      setError('Network error while submitting your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAfterConfirm = () => {
    setConfirmedOrder(null);
    setName('');
    setPhone('');
    setAddress('');
    setCityArea('');
    setNotes('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#141413]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Cash on Delivery Checkout"
    >
      <div className="bg-[#FAF8F4] border border-[#E4DFD5] w-full max-w-4xl my-8 overflow-hidden">
        {/* Top Bar */}
        <div className="px-7 py-5 border-b border-[#E4DFD5] flex items-center justify-between bg-[#F7F5F0]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C6D32]">
              KHUSHBOO
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-[#1A1917]">
              {confirmedOrder ? 'Order Confirmation' : 'Single-Page Checkout'}
            </h2>
          </div>
          <button
            type="button"
            onClick={confirmedOrder ? handleCloseAfterConfirm : onClose}
            className="p-2 text-[#524E46] hover:text-[#1A1917] cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          /* Instant Order Confirmation Receipt */
          <div className="p-8 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4DFD5]">
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-7 h-7 text-[#8C6D32] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6E6A61]">
                    Confirmed · {confirmedOrder.paymentMethod}
                  </p>
                  <h3 className="font-display text-3xl text-[#1A1917] mt-0.5">
                    Thank you, {confirmedOrder.customer.name}
                  </h3>
                  <p className="text-sm text-[#524E46] mt-1">
                    Your fragrances are being prepared at our atelier for dispatch.
                  </p>
                </div>
              </div>

              <div className="bg-[#141413] text-[#F7F5F0] px-5 py-3.5 shrink-0">
                <span className="block text-[11px] uppercase tracking-wider text-[#A39E93]">
                  Order Reference
                </span>
                <span className="font-mono text-base tracking-wide text-[#C5A059] tabular-nums">
                  {confirmedOrder.id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 text-sm">
                <p className="text-xs uppercase tracking-wider text-[#8C6D32] font-medium">
                  Delivery Details
                </p>
                <div className="bg-[#F7F5F0] border border-[#E4DFD5] p-5 space-y-2 text-[#3C3933]">
                  <p className="font-medium text-[#1A1917]">{confirmedOrder.customer.name}</p>
                  <p className="tabular-nums">{confirmedOrder.customer.phone}</p>
                  <p>{confirmedOrder.customer.address}</p>
                  <p>{confirmedOrder.customer.cityArea}</p>
                  {confirmedOrder.customer.notes && (
                    <p className="text-xs text-[#6E6A61] pt-2 border-t border-[#E4DFD5]">
                      Note: {confirmedOrder.customer.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-xs uppercase tracking-wider text-[#8C6D32] font-medium">
                  Receipt Summary
                </p>
                <div className="bg-[#F7F5F0] border border-[#E4DFD5] p-5 space-y-3">
                  {confirmedOrder.items.map((item) => (
                    <div key={item.cartId} className="flex justify-between text-xs text-[#3C3933]">
                      <span>
                        {item.quantity}× {item.kind === 'single' ? `${item.name} (${item.volume})` : item.title}
                      </span>
                      <span className="tabular-nums font-medium">
                        {formatBDT(getCartLineUnitPrice(item) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-[#E4DFD5] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#6E6A61]">
                      <span>Delivery</span>
                      <span className="tabular-nums">
                        {confirmedOrder.deliveryFee === 0
                          ? 'Complimentary'
                          : formatBDT(confirmedOrder.deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-[#1A1917] pt-1">
                      <span>Cash Due on Delivery</span>
                      <span className="tabular-nums">{formatBDT(confirmedOrder.totalPayable)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCloseAfterConfirm}
                className="px-8 py-3.5 bg-[#141413] text-[#F7F5F0] text-xs font-medium uppercase tracking-wider hover:bg-[#2B2926] cursor-pointer"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        ) : (
          /* Single-Page COD Form + Summary */
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 p-7 sm:p-8 space-y-5 border-b lg:border-b-0 lg:border-r border-[#E4DFD5]">
              {error && (
                <div className="p-3.5 bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#7F1D1D]">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cod-name" className="block text-xs font-medium text-[#3C3933] mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    id="cod-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#DCD6CA] text-sm text-[#1A1917] focus:outline-none focus:border-[#141413]"
                  />
                </div>
                <div>
                  <label htmlFor="cod-phone" className="block text-xs font-medium text-[#3C3933] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    id="cod-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17XX-XXXXXX"
                    className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#DCD6CA] text-sm text-[#1A1917] focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cod-address" className="block text-xs font-medium text-[#3C3933] mb-1.5">
                  Delivery Address *
                </label>
                <input
                  id="cod-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Road, Block / Apartment"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#DCD6CA] text-sm text-[#1A1917] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="cod-city" className="block text-xs font-medium text-[#3C3933] mb-1.5">
                  City / Area *
                </label>
                <input
                  id="cod-city"
                  type="text"
                  required
                  value={cityArea}
                  onChange={(e) => setCityArea(e.target.value)}
                  placeholder="e.g., Gulshan, Dhaka / Chattogram"
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#DCD6CA] text-sm text-[#1A1917] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="cod-notes" className="block text-xs font-medium text-[#3C3933] mb-1.5">
                  Order Notes (Optional)
                </label>
                <textarea
                  id="cod-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gift wrapping request, preferred delivery window..."
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#DCD6CA] text-sm text-[#1A1917] focus:outline-none focus:border-[#141413]"
                />
              </div>

              {/* Strictly Cash on Delivery Confirmation */}
              <div className="p-4 bg-[#141413] text-[#F7F5F0] border border-[#2A2A27] flex items-start gap-3.5">
                <Banknote className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#C5A059]">
                    Payment Method: Cash on Delivery (COD)
                  </p>
                  <p className="text-xs text-[#C8C2B6] mt-1 leading-relaxed">
                    No card or online payment required. Pay the exact total in cash to the courier
                    upon inspecting your sealed parcel.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-5 p-7 sm:p-8 bg-[#F7F5F0] flex flex-col justify-between gap-6">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[#8C6D32] font-medium pb-3 border-b border-[#E4DFD5]">
                  Order Summary
                </h3>

                <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.cartId} className="text-xs space-y-1 pb-2.5 border-b border-[#E4DFD5]/70 last:border-b-0">
                      <div className="flex justify-between font-medium text-[#1A1917]">
                        <span>
                          {item.quantity}× {item.kind === 'single' ? `${item.name} (${item.volume})` : item.title}
                        </span>
                        <span className="tabular-nums">
                          {formatBDT(getCartLineUnitPrice(item) * item.quantity)}
                        </span>
                      </div>
                      {item.kind !== 'single' && (
                        <p className="text-[11px] text-[#6E6A61]">
                          {item.items.map((s) => `${s.quantity}× ${s.name} ${s.volume}`).join(' · ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <dl className="mt-5 pt-4 border-t border-[#E4DFD5] space-y-2 text-sm">
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
                  <div className="flex items-baseline justify-between pt-3 border-t border-[#E4DFD5]">
                    <dt className="font-semibold text-[#1A1917]">Payable on Delivery</dt>
                    <dd className="font-display text-3xl text-[#1A1917] tabular-nums">
                      {formatBDT(totalPayable)}
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full py-3.5 bg-[#141413] text-[#F7F5F0] text-xs font-medium uppercase tracking-wider hover:bg-[#2B2926] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Confirming Order...' : `Place COD Order · ${formatBDT(totalPayable)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
