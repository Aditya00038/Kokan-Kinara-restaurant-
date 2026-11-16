import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

/**
 * Generates portion options matching the restaurant menu and Zomato style
 * Exactly as in user reference: Half, Full, 500 Grams, 1 Kg for Biryani & curries
 */
export function getDishPortions(dish) {
    if (!dish) return [];
    if (dish.portions && Array.isArray(dish.portions) && dish.portions.length > 0) {
        return dish.portions;
    }

    const base = Number(dish.price) || 300;
    const name = (dish.name || '').toLowerCase();
    const cat = (dish.category || '').toLowerCase();

    // Biryani & Rice Special Options (Direct match with reference image)
    if (name.includes('biryani') || cat.includes('biryani') || cat.includes('rice')) {
        // If base price is close to ~340 or dish price
        const half = base;
        const full = Math.round((base * 1.647) / 10) * 10; // e.g. 340 -> 560
        const g500 = Math.round((base * 2.823) / 10) * 10; // e.g. 340 -> 960
        const kg1 = Math.round((base * 4.764) / 10) * 10;  // e.g. 340 -> 1620

        return [
            { id: 'half', name: 'Half', price: half },
            { id: 'full', name: 'Full', price: full },
            { id: '500g', name: '500 Grams', price: g500 },
            { id: '1kg', name: '1 Kg', price: kg1 }
        ];
    }

    // Seafood & Meat curries
    if (cat.includes('seafood') || cat.includes('meat') || cat.includes('mains')) {
        return [
            { id: 'half', name: 'Half', price: base },
            { id: 'full', name: 'Full', price: Math.round((base * 1.65) / 10) * 10 },
            { id: '500g', name: '500 Grams', price: Math.round((base * 2.8) / 10) * 10 },
            { id: '1kg', name: '1 Kg (Handi)', price: Math.round((base * 4.75) / 10) * 10 }
        ];
    }

    // Starters / Fry
    if (cat.includes('starters')) {
        return [
            { id: 'regular', name: 'Regular Portion (6 Pcs)', price: base },
            { id: 'large', name: 'Full Plate (12 Pcs)', price: Math.round((base * 1.75) / 10) * 10 }
        ];
    }

    // Breads / Bhakri
    if (cat.includes('bhakri') || cat.includes('breads')) {
        return [
            { id: 'single', name: '1 Piece', price: base },
            { id: 'double', name: '2 Pieces', price: base * 2 },
            { id: 'pack4', name: 'Pack of 4 Pieces', price: Math.round((base * 3.8) / 5) * 5 }
        ];
    }

    // Drinks & Desserts
    if (cat.includes('drinks') || cat.includes('desserts')) {
        return [
            { id: 'single', name: 'Single Serving', price: base },
            { id: 'double', name: 'Double Serving', price: Math.round((base * 1.9) / 5) * 5 },
            { id: 'pack4', name: 'Family Pack (4 Servings)', price: Math.round((base * 3.6) / 10) * 10 }
        ];
    }

    // Default / Thali
    return [
        { id: 'regular', name: 'Standard Portion', price: base },
        { id: 'special', name: 'Special Large (+ Solkadhi & Extra Bhakri)', price: base + 80 }
    ];
}

export default function CustomizationModal({ dish, onClose, onAddToCart }) {
    const portions = useMemo(() => getDishPortions(dish), [dish]);
    const [selectedPortion, setSelectedPortion] = useState(portions[0] || null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (portions.length > 0) {
            setSelectedPortion(portions[0]);
            setQuantity(1);
        }
    }, [dish, portions]);

    if (!dish || !selectedPortion) return null;

    const totalPrice = selectedPortion.price * quantity;

    const handleConfirm = () => {
        onAddToCart(dish, quantity, '', selectedPortion.name, selectedPortion.price);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-100 flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Thumbnail + Dish Name + Close X */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-neutral-100 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                            }}
                        />
                        <h3 className="font-bold text-base sm:text-lg text-neutral-900 truncate">
                            {dish.name}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body: Quantity Selection */}
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-sm sm:text-base text-neutral-900">
                                Quantity
                            </span>
                            <span className="border border-orange-400 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                REQUIRED
                            </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-medium">
                            You can choose any 1 option
                        </p>
                    </div>

                    {/* Radio Options List */}
                    <div className="divide-y divide-neutral-100 pt-1">
                        {portions.map(p => {
                            const isSelected = selectedPortion.id === p.id;
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPortion(p)}
                                    className="flex items-center justify-between py-3.5 cursor-pointer select-none group transition-colors"
                                >
                                    <span className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-950">
                                        {p.name}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-neutral-800">
                                            ₹{p.price}
                                        </span>
                                        {/* Red Radio Button */}
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            isSelected ? 'border-red-500' : 'border-neutral-300 group-hover:border-neutral-400'
                                        }`}>
                                            {isSelected && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer: Stepper [ - 1 + ] and [ Add to order - ₹... ] */}
                <div className="p-4 sm:p-5 border-t border-neutral-100 bg-white flex items-center gap-3">
                    {/* Stepper */}
                    <div className="flex items-center gap-3 border border-red-300 rounded-xl px-3 py-2 bg-white shrink-0">
                        <button
                            type="button"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="text-red-500 hover:text-red-700 font-bold text-lg leading-none cursor-pointer px-1 py-0.5"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className="text-sm font-bold w-4 text-center text-neutral-900">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => setQuantity(q => q + 1)}
                            className="text-red-500 hover:text-red-700 font-bold text-lg leading-none cursor-pointer px-1 py-0.5"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>

                    {/* Add to order button */}
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 bg-red-500 hover:bg-red-600 active:scale-98 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center"
                    >
                        Add to order - ₹{totalPrice}
                    </button>
                </div>
            </div>
        </div>
    );
}
