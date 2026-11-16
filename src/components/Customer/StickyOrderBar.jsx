import React from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * Sticky Bottom Cart Bar (Matching reference image)
 * Shows [▲] Your Order (N) on left, and Subtotal: ₹... with red [ Continue ] button on right
 */
export default function StickyOrderBar({ cartCount, cartSubtotal, onOpenCart }) {
    if (!cartCount || cartCount <= 0) return null;

    return (
        <aside 
            aria-label="Order summary"
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-2.5 sm:py-3 px-4 sm:px-8 transition-transform duration-200"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                {/* Left: [▲] Your Order (count) */}
                <button
                    type="button"
                    onClick={onOpenCart}
                    className="flex items-center gap-2.5 text-neutral-900 hover:text-neutral-700 font-bold text-sm sm:text-base cursor-pointer group select-none"
                    title="View your order items"
                >
                    <span className="w-6 h-6 rounded-md border border-neutral-300 flex items-center justify-center bg-white shadow-2xs group-hover:border-neutral-400 transition-colors">
                        <ChevronUp className="w-3.5 h-3.5 text-neutral-800" />
                    </span>
                    <span>Your Order ({cartCount})</span>
                </button>

                {/* Right: Subtotal + Red [ Continue ] Button */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <span className="text-sm sm:text-base font-bold text-neutral-900 whitespace-nowrap">
                        Subtotal: ₹{cartSubtotal}
                    </span>
                    <button
                        type="button"
                        onClick={onOpenCart}
                        className="bg-red-500 hover:bg-red-600 active:scale-98 text-white font-bold px-6 sm:px-8 py-2 rounded-lg text-sm sm:text-base shadow-xs transition-all cursor-pointer whitespace-nowrap"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </aside>
    );
}
