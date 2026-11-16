import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import VegNonVegBadge, { VegNonVegIcon } from '../Common/VegNonVegBadge';
import CustomizationModal from './CustomizationModal';
import {
    UtensilsCrossed,
    Search,
    ShoppingBag,
    CheckCircle2,
    Clock,
    Plus,
    Minus,
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Bell,
    GlassWater,
    Receipt,
    HelpCircle,
    Check,
    QrCode,
    Sparkles,
    ChefHat,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

export default function DineInQRPortal({ tableIdParam, tokenParam, onNavigateHome }) {
    const {
        tables,
        menu,
        orders,
        diningSessions,
        validateQRToken,
        createDineInQROrder,
        requestBillForSession,
        generateSessionBill,
        createServiceRequest,
        startDiningSession
    } = useRestaurant();

    // 1. URL Query Param Detection (supports props or direct window.location)
    const [currentTableId, setCurrentTableId] = useState(() => {
        if (tableIdParam) return tableIdParam;
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('table') || '';
        }
        return '';
    });

    const [currentToken, setCurrentToken] = useState(() => {
        if (tokenParam) return tokenParam;
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('token') || '';
        }
        return '';
    });

    // Sub-view: 'menu' (digital menu & cart), 'orders' (live session order tracker), 'bill' (consolidated bill)
    const [activeTab, setActiveTab] = useState('menu');

    // Menu Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [dietFilter, setDietFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'

    // Cart for current round of ordering
    const [roundCart, setRoundCart] = useState([]);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
    const [orderPlacing, setOrderPlacing] = useState(false);
    const [orderSuccessMessage, setOrderSuccessMessage] = useState('');
    const [customizingDish, setCustomizingDish] = useState(null);

    // Floor Service Notification State
    const [serviceMessage, setServiceMessage] = useState('');
    const [billRequestedNotice, setBillRequestedNotice] = useState(false);

    // Update query params if props change
    useEffect(() => {
        if (tableIdParam) setCurrentTableId(tableIdParam);
        if (tokenParam) setCurrentToken(tokenParam);
    }, [tableIdParam, tokenParam]);

    // 2. Security & Session Validation
    const validationResult = useMemo(() => {
        return validateQRToken(currentTableId, currentToken);
    }, [currentTableId, currentToken, tables, diningSessions, validateQRToken]);

    const activeTable = validationResult.table;
    const activeSession = validationResult.session;

    // Extract categories
    const categories = useMemo(() => {
        return ['All', ...new Set(menu.map(item => item.category))];
    }, [menu]);

    // Filtered Menu
    const filteredMenu = useMemo(() => {
        return menu.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesDiet = dietFilter === 'ALL' ||
                (dietFilter === 'VEG' && item.isVeg) ||
                (dietFilter === 'NON_VEG' && !item.isVeg);
            return matchesSearch && matchesCategory && matchesDiet;
        });
    }, [menu, searchQuery, selectedCategory, dietFilter]);

    // All orders belonging to this dining session
    const sessionOrders = useMemo(() => {
        if (!activeSession) return [];
        return (orders || []).filter(o => o.diningSessionId === activeSession.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [orders, activeSession]);

    // Cart Calculations
    const cartSubtotal = useMemo(() => {
        return roundCart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    }, [roundCart]);

    const cartCount = useMemo(() => {
        return roundCart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }, [roundCart]);

    // Cart Handlers
    const handleAddToCart = (dish, quantity = 1, notes = '', selectedPortion = null, customPrice = null) => {
        const price = customPrice !== null ? customPrice : dish.price;
        const portion = selectedPortion || 'Standard';
        const cartKey = `${dish.id}-${portion}`;

        setRoundCart(prev => {
            const existingIdx = prev.findIndex(item => item.cartKey === cartKey);
            if (existingIdx > -1) {
                const updated = [...prev];
                updated[existingIdx].quantity += quantity;
                if (notes) updated[existingIdx].notes = notes;
                return updated;
            }
            return [...prev, {
                ...dish,
                cartKey,
                price,
                selectedPortion: portion,
                quantity,
                notes
            }];
        });
        setCustomizingDish(null);
    };

    const handleUpdateCartQuantity = (cartKey, delta) => {
        setRoundCart(prev => {
            return prev.map(item => {
                if (item.cartKey === cartKey) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : null;
                }
                return item;
            }).filter(Boolean);
        });
    };

    // Place Dine-In QR Order
    const handlePlaceRoundOrder = () => {
        if (roundCart.length === 0) return;
        setOrderPlacing(true);

        setTimeout(() => {
            const result = createDineInQROrder({
                tableId: activeTable.id,
                qrToken: currentToken,
                items: roundCart,
                specialInstructions,
                customerName: activeSession?.customerName
            });

            setOrderPlacing(false);
            if (result.success) {
                setRoundCart([]);
                setSpecialInstructions('');
                setIsCartSheetOpen(false);
                setOrderSuccessMessage(`Round order #${result.order.id} sent directly to the kitchen!`);
                setActiveTab('orders'); // Jump to live order tracking
                setTimeout(() => setOrderSuccessMessage(''), 5000);
            } else {
                alert(result.error || 'Failed to place order. Please try again.');
            }
        }, 500);
    };

    // Quick Floor Service Call
    const handleTriggerServiceCall = (type, details = '') => {
        if (!activeTable) return;
        createServiceRequest({
            tableNumber: activeTable.number,
            type,
            details: details || `Table #${activeTable.number} requested ${type}`
        });
        setServiceMessage(`Requested: ${type}. A server is heading to your table.`);
        setTimeout(() => setServiceMessage(''), 4000);
    };

    // Request Final Bill
    const handleRequestFinalBill = () => {
        if (!activeSession) return;
        requestBillForSession(activeSession.id);
        setBillRequestedNotice(true);
        setServiceMessage('Final bill requested. Your server or cashier will present the bill shortly.');
        setTimeout(() => setServiceMessage(''), 6000);
    };

    // -------------------------------------------------------------
    // SCENARIO 1: Invalid Table / Token or Inactive Session
    // -------------------------------------------------------------
    if (!validationResult.valid) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-neutral-800 rounded-3xl p-7 border border-neutral-700 shadow-2xl text-center space-y-5 animate-fadeIn">
                    <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/30">
                        <QrCode className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-800/40">
                            Offline QR Dine-In
                        </span>
                        <h2 className="text-2xl font-black text-white">Table QR Verification</h2>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                            {validationResult.message}
                        </p>
                    </div>

                    {/* Table Details if known */}
                    {activeTable && (
                        <div className="p-3 bg-neutral-900/60 rounded-2xl border border-neutral-700 text-xs text-neutral-300 space-y-1">
                            <p className="font-bold text-white">Table #{activeTable.number} ({activeTable.section})</p>
                            <p className="text-[11px] text-neutral-400">Status: <span className="uppercase font-bold text-amber-400">{activeTable.status}</span></p>
                            <p className="text-[10px] text-neutral-500 font-mono">Token: {currentToken ? `${currentToken.slice(0, 8)}...` : 'None'}</p>
                        </div>
                    )}

                    {/* Simulation / Testing Assist Box */}
                    <div className="p-4 bg-neutral-950/70 rounded-2xl border border-neutral-800 text-left space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                            <Sparkles className="w-4 h-4" />
                            <span>Staff / Demo Testing Controls</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                            Select an occupied table or activate Table #1 to test the full QR ordering experience:
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            {tables.slice(0, 4).map(tbl => (
                                <button
                                    key={tbl.id}
                                    onClick={() => {
                                        // If table not active, start session for demo
                                        if (tbl.status !== 'occupied') {
                                            startDiningSession({ tableId: tbl.id, guestCount: 2, customerName: 'Demo Diner', openedBy: 'Staff' });
                                        }
                                        setCurrentTableId(tbl.id);
                                        setCurrentToken(tbl.qrToken);
                                    }}
                                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-left text-xs transition-colors cursor-pointer"
                                >
                                    <div className="font-bold text-white">Table #{tbl.number}</div>
                                    <div className="text-[10px] text-neutral-400 truncate">{tbl.section}</div>
                                    <span className={`inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                        tbl.status === 'occupied' ? 'bg-rose-900 text-rose-200' : 'bg-emerald-900 text-emerald-200'
                                    }`}>
                                        {tbl.status === 'occupied' ? 'Occupied' : 'Activate & Enter'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {onNavigateHome && (
                        <button
                            onClick={onNavigateHome}
                            className="w-full py-2.5 px-4 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                            Return to Kokan Kinara Home
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // SCENARIO 2: Valid Active Dining Session
    // -------------------------------------------------------------
    const consolidatedBill = generateSessionBill(activeSession.id);

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-28 font-sans">
            {/* Top Table Status Bar */}
            <header className="sticky top-0 z-30 bg-neutral-900 text-white px-4 py-3 shadow-md border-b border-neutral-800">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                            #{activeTable.number}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-sm text-white tracking-tight">
                                    Table #{activeTable.number}
                                </h1>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Dine-In Active
                                </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                                {activeTable.section} • {activeSession.customerName}
                            </p>
                        </div>
                    </div>

                    {/* View Switcher Pills */}
                    <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-xl border border-neutral-700 text-xs">
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                activeTab === 'menu' ? 'bg-rose-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            Menu
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all relative cursor-pointer ${
                                activeTab === 'orders' ? 'bg-rose-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            Orders {sessionOrders.length > 0 && `(${sessionOrders.length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab('bill')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                activeTab === 'bill' ? 'bg-rose-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            Bill
                        </button>
                    </div>
                </div>

                {/* Live Toast Notification */}
                {serviceMessage && (
                    <div className="mt-2 max-w-3xl mx-auto p-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
                        <span>{serviceMessage}</span>
                        <Check className="w-4 h-4 shrink-0" />
                    </div>
                )}
                {orderSuccessMessage && (
                    <div className="mt-2 max-w-3xl mx-auto p-2.5 bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
                        <span>{orderSuccessMessage}</span>
                        <ChefHat className="w-4 h-4 shrink-0" />
                    </div>
                )}
            </header>

            <main className="max-w-3xl mx-auto px-4 pt-3 space-y-4">
                {/* ONE-TOUCH SERVICE CALL BAR */}
                <section className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-2xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center justify-between">
                        <span>Quick Table Assistance</span>
                        <span className="text-[10px] text-neutral-500 font-normal">Direct floor dispatch</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        <button
                            onClick={() => handleTriggerServiceCall('WATER', 'Drinking water request')}
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100 transition-colors text-center cursor-pointer"
                        >
                            <GlassWater className="w-4 h-4 text-sky-600 mb-1" />
                            <span className="text-[11px] font-bold">Water</span>
                        </button>
                        <button
                            onClick={() => handleTriggerServiceCall('CUTLERY', 'Extra plates and cutlery')}
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-100 transition-colors text-center cursor-pointer"
                        >
                            <UtensilsCrossed className="w-4 h-4 text-amber-600 mb-1" />
                            <span className="text-[11px] font-bold">Cutlery</span>
                        </button>
                        <button
                            onClick={() => handleTriggerServiceCall('WAITER', 'Diner requested server assistance')}
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-100 transition-colors text-center cursor-pointer"
                        >
                            <Bell className="w-4 h-4 text-purple-600 mb-1" />
                            <span className="text-[11px] font-bold">Call Waiter</span>
                        </button>
                        <button
                            onClick={handleRequestFinalBill}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors text-center cursor-pointer ${
                                billRequestedNotice || activeSession.status === 'BILL_REQUESTED'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100'
                            }`}
                        >
                            <Receipt className="w-4 h-4 text-emerald-600 mb-1" />
                            <span className="text-[11px] font-bold">
                                {activeSession.status === 'BILL_REQUESTED' ? 'Bill Called' : 'Get Bill'}
                            </span>
                        </button>
                    </div>
                </section>

                {/* ======================================================== */}
                {/* TAB 1: DIGITAL MENU & ORDER ROUNDS                       */}
                {/* ======================================================== */}
                {activeTab === 'menu' && (
                    <div className="space-y-4">
                        {/* Search & Veg/Non-Veg Filter Bar */}
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search seafood, thalis, biryani, solkadhi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-neutral-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-neutral-900 shadow-2xs"
                                />
                            </div>

                            {/* Diet and Categories Chips */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-0.5 shadow-2xs shrink-0">
                                    <button
                                        onClick={() => setDietFilter('ALL')}
                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                                            dietFilter === 'ALL' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setDietFilter('VEG')}
                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer ${
                                            dietFilter === 'VEG' ? 'bg-emerald-600 text-white' : 'text-emerald-700'
                                        }`}
                                    >
                                        <VegNonVegIcon isVeg={true} size={11} /> Veg
                                    </button>
                                    <button
                                        onClick={() => setDietFilter('NON_VEG')}
                                        className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer ${
                                            dietFilter === 'NON_VEG' ? 'bg-rose-600 text-white' : 'text-rose-700'
                                        }`}
                                    >
                                        <VegNonVegIcon isVeg={false} size={11} /> Non-Veg
                                    </button>
                                </div>

                                <div className="h-4 w-px bg-neutral-200 shrink-0" />

                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                                            selectedCategory === cat
                                                ? 'bg-rose-600 text-white shadow-xs'
                                                : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Item Cards */}
                        <div className="space-y-3">
                            {filteredMenu.map(dish => {
                                const inCartItem = roundCart.find(i => i.id === dish.id);
                                return (
                                    <div
                                        key={dish.id}
                                        className="bg-white rounded-2xl border border-neutral-200 p-3.5 shadow-2xs flex gap-3 hover:border-neutral-300 transition-all"
                                    >
                                        {/* Dish Details */}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <VegNonVegBadge isVeg={dish.isVeg} size="sm" showLabel={false} />
                                                <h3 className="font-bold text-sm text-neutral-900 leading-snug">{dish.name}</h3>
                                            </div>
                                            <div className="text-sm font-black text-neutral-900">
                                                ₹{dish.price}
                                            </div>
                                            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                                {dish.description}
                                            </p>
                                            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-400">
                                                <span>⏱️ {dish.prepTime || '15 mins'}</span>
                                                {dish.spicyLevel && <span>🌶️ {dish.spicyLevel}/3 Spicy</span>}
                                                {!dish.inStock && (
                                                    <span className="text-rose-600 font-bold uppercase text-[10px]">Sold Out</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dish Image & Add Action */}
                                        <div className="w-24 shrink-0 flex flex-col items-center justify-between">
                                            <div className="w-24 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                                                <img
                                                    src={dish.image || '/foods/image.png'}
                                                    alt={dish.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = '/foods/image.png'; }}
                                                />
                                            </div>

                                            {/* Add Button */}
                                            {dish.inStock ? (
                                                inCartItem ? (
                                                    <div className="flex items-center gap-2 mt-1.5 bg-neutral-900 text-white rounded-lg px-2 py-1 text-xs font-bold">
                                                        <button
                                                            onClick={() => handleUpdateCartQuantity(inCartItem.cartKey, -1)}
                                                            className="hover:text-rose-300 cursor-pointer"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span>{inCartItem.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateCartQuantity(inCartItem.cartKey, 1)}
                                                            className="hover:text-rose-300 cursor-pointer"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setCustomizingDish(dish)}
                                                        className="mt-1.5 w-full py-1 px-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add
                                                    </button>
                                                )
                                            ) : (
                                                <span className="mt-1.5 text-[10px] text-neutral-400 font-bold uppercase">Unavailable</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* TAB 2: LIVE SESSION ORDERS TRACKER                       */}
                {/* ======================================================== */}
                {activeTab === 'orders' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs flex items-center justify-between">
                            <div>
                                <h2 className="font-extrabold text-base text-neutral-900">Your Table Orders</h2>
                                <p className="text-xs text-neutral-500">Live preparation tickets sent to kitchen in this session.</p>
                            </div>
                            <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-lg border border-neutral-200">
                                {sessionOrders.length} Rounds Placed
                            </span>
                        </div>

                        {sessionOrders.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl border border-dashed border-neutral-300 text-center space-y-3">
                                <div className="w-12 h-12 bg-neutral-100 text-neutral-500 rounded-2xl flex items-center justify-center mx-auto text-xl">
                                    🍽️
                                </div>
                                <h3 className="font-bold text-sm text-neutral-900">No Orders Placed Yet</h3>
                                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                                    Browse the digital menu, add dishes to your round cart, and tap Send Order to Kitchen.
                                </p>
                                <button
                                    onClick={() => setActiveTab('menu')}
                                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                                >
                                    Browse Digital Menu
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessionOrders.map((ord, idx) => {
                                    const fStatus = ord.fulfillmentStatus || ord.status;
                                    return (
                                        <div key={ord.id} className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-sm text-neutral-900">#{ord.id}</span>
                                                        <span className="text-[11px] text-neutral-400 font-medium">Round {sessionOrders.length - idx}</span>
                                                    </div>
                                                    <p className="text-[11px] text-neutral-500">
                                                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>

                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                                    fStatus === 'SERVED' ? 'bg-emerald-100 text-emerald-800' :
                                                    fStatus === 'READY' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                                                    fStatus === 'PREPARING' ? 'bg-rose-100 text-rose-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {fStatus === 'SERVED' ? '✓ Served at Table' :
                                                     fStatus === 'READY' ? '🛎️ Ready to Serve' :
                                                     fStatus === 'PREPARING' ? '🔥 Cooking in Kitchen' :
                                                     '⏳ Order Dispatched'}
                                                </span>
                                            </div>

                                            {/* Items Breakdown */}
                                            <div className="divide-y divide-neutral-100 text-xs">
                                                {ord.items?.map((it, i) => (
                                                    <div key={i} className="py-1.5 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-neutral-900">{it.quantity}x</span>
                                                            <span className="text-neutral-700">{it.name}</span>
                                                            {it.selectedPortion && it.selectedPortion !== 'Standard' && (
                                                                <span className="text-[10px] text-neutral-400">({it.selectedPortion})</span>
                                                            )}
                                                        </div>
                                                        <span className="font-semibold text-neutral-900">₹{(Number(it.price) * Number(it.quantity)).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {ord.specialInstructions && (
                                                <div className="p-2 bg-neutral-50 rounded-xl text-[11px] text-neutral-500 italic">
                                                    Note: "{ord.specialInstructions}"
                                                </div>
                                            )}

                                            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                                                <span className="text-neutral-500">Round Total:</span>
                                                <span className="font-black text-neutral-900">₹{ord.total}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ======================================================== */}
                {/* TAB 3: CONSOLIDATED SESSION BILL                         */}
                {/* ======================================================== */}
                {activeTab === 'bill' && consolidatedBill && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4 font-mono text-xs">
                            {/* Bill Header */}
                            <div className="text-center border-b-2 border-dashed border-neutral-200 pb-4">
                                <h3 className="font-black text-lg text-neutral-900 tracking-tight font-sans">KOKAN KINARA</h3>
                                <p className="text-[11px] text-neutral-500">Table #{activeTable.number} • {activeTable.section}</p>
                                <p className="text-[10px] text-neutral-400">Session: {activeSession.id}</p>
                            </div>

                            {/* Line Items Consolidated */}
                            <div className="space-y-2 py-2">
                                <div className="flex justify-between font-bold text-neutral-400 text-[10px] uppercase border-b border-neutral-100 pb-1">
                                    <span>Item</span>
                                    <span>Qty x Price</span>
                                    <span>Amount</span>
                                </div>
                                {consolidatedBill.items.length === 0 ? (
                                    <p className="text-center text-neutral-400 py-4 font-sans text-xs">No items ordered yet.</p>
                                ) : (
                                    consolidatedBill.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between text-neutral-800">
                                            <div className="truncate max-w-[150px]">
                                                {it.name} {it.selectedPortion && it.selectedPortion !== 'Standard' && `(${it.selectedPortion})`}
                                            </div>
                                            <div className="text-neutral-500">{it.quantity} x ₹{it.price}</div>
                                            <div className="font-bold">₹{it.totalAmount.toFixed(2)}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Financials */}
                            <div className="border-t-2 border-dashed border-neutral-200 pt-3 space-y-1.5">
                                <div className="flex justify-between text-neutral-600">
                                    <span>Subtotal ({consolidatedBill.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                    <span>₹{consolidatedBill.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-600">
                                    <span>GST / Service Tax (5%)</span>
                                    <span>₹{consolidatedBill.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-black text-sm text-neutral-900 pt-2 border-t border-neutral-200">
                                    <span>Grand Total</span>
                                    <span>₹{consolidatedBill.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Status Pill */}
                            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-center font-sans space-y-1">
                                <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    activeSession.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                                    activeSession.status === 'BILL_REQUESTED' ? 'bg-amber-100 text-amber-800' :
                                    'bg-neutral-200 text-neutral-700'
                                }`}>
                                    Status: {activeSession.status}
                                </span>
                                <p className="text-[11px] text-neutral-500">
                                    {activeSession.status === 'BILL_REQUESTED'
                                        ? 'Bill request sent to cashier register.'
                                        : 'Payment is settled by waiter or cashier at your table.'}
                                </p>
                            </div>

                            {/* Request Bill Action */}
                            {activeSession.status !== 'BILL_REQUESTED' && activeSession.status !== 'CLOSED' && (
                                <button
                                    onClick={handleRequestFinalBill}
                                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors font-sans flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Receipt className="w-4 h-4" /> Request Final Bill Now
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* STICKY BOTTOM CART BAR (Active on Menu tab when items exist) */}
            {activeTab === 'menu' && roundCart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 p-3 shadow-xl">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                        <button
                            onClick={() => setIsCartSheetOpen(!isCartSheetOpen)}
                            className="flex items-center gap-2 text-left cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                                {cartCount}
                            </div>
                            <div>
                                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                                    Round Order {isCartSheetOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                </span>
                                <p className="text-[11px] text-neutral-500">Subtotal: ₹{cartSubtotal.toFixed(2)}</p>
                            </div>
                        </button>

                        <button
                            onClick={handlePlaceRoundOrder}
                            disabled={orderPlacing}
                            className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {orderPlacing ? 'Dispatching...' : 'Send Order to Kitchen'}
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Expandable Cart Tray */}
                    {isCartSheetOpen && (
                        <div className="max-w-3xl mx-auto mt-3 pt-3 border-t border-neutral-100 space-y-2 animate-fadeIn">
                            <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                                {roundCart.map(item => (
                                    <div key={item.cartKey} className="py-2 flex items-center justify-between text-xs">
                                        <div>
                                            <p className="font-bold text-neutral-900">{item.name}</p>
                                            <span className="text-[10px] text-neutral-500">Portion: {item.selectedPortion}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-2 py-0.5 font-bold">
                                                <button onClick={() => handleUpdateCartQuantity(item.cartKey, -1)} className="hover:text-rose-600">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => handleUpdateCartQuantity(item.cartKey, 1)} className="hover:text-rose-600">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <span className="font-bold text-neutral-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cooking Instructions Input */}
                            <input
                                type="text"
                                placeholder="Special cooking instructions (e.g. less spicy, extra lemon)..."
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Customization Modal */}
            {customizingDish && (
                <CustomizationModal
                    dish={customizingDish}
                    onClose={() => setCustomizingDish(null)}
                    onAddToCart={handleAddToCart}
                />
            )}
        </div>
    );
}
