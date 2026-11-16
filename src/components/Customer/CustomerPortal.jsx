import React, { useState, useMemo, useRef } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import VegNonVegBadge, { VegNonVegIcon } from '../Common/VegNonVegBadge';
import CustomizationModal from './CustomizationModal';
import StickyOrderBar from './StickyOrderBar';
import {
    Search,
    ShoppingBag,
    Calendar,
    Clock,
    Users,
    MapPin,
    CheckCircle2,
    Truck,
    Flame,
    Award,
    UtensilsCrossed,
    Plus,
    Minus,
    X,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    ArrowRight,
    Bike,
    Sparkles,
    Check
} from 'lucide-react';

export default function CustomerPortal() {
    const {
        menu,
        orders,
        reservations,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        createOnlineOrder,
        createReservation,
        updateReservationStatus
    } = useRestaurant();

    const { currentUser } = useAuth();

    // Primary Tab: Exactly 'delivery' (default) and 'reservation'
    const [activeTab, setActiveTab] = useState('delivery'); // 'delivery' | 'reservation'

    // Dish customization / portion modal state (Image 1)
    const [customizingDish, setCustomizingDish] = useState(null);

    // Cart calculations (Image 2)
    const computedSubtotal = useMemo(() => {
        if (cartTotal !== undefined && cartTotal !== null && cartTotal > 0) return cartTotal;
        return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    }, [cart, cartTotal]);

    const computedCount = useMemo(() => {
        if (cartCount !== undefined && cartCount !== null && cartCount > 0) return cartCount;
        return cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }, [cart, cartCount]);

    // Horizontal Scroll Refs
    const todaysSpecialScrollRef = useRef(null);
    const recommendedScrollRef = useRef(null);

    const scrollTodaysSpecial = (direction) => {
        if (todaysSpecialScrollRef.current) {
            todaysSpecialScrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
        }
    };

    const scrollRecommended = (direction) => {
        if (recommendedScrollRef.current) {
            recommendedScrollRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
        }
    };

    // Circular Recommended Dishes (Zomato-style Inspiration)
    const inspirationDishes = [
        {
            name: 'Surmai',
            keyword: 'Surmai',
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Pomfret',
            keyword: 'Pomfret',
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Prawns',
            keyword: 'Prawns',
            image: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Biryani',
            keyword: 'Biryani',
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Chicken',
            keyword: 'Chicken',
            image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Mutton',
            keyword: 'Mutton',
            image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Solkadhi',
            keyword: 'Solkadhi',
            image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Modak',
            keyword: 'Modak',
            image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Thali',
            keyword: 'Thali',
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
        },
        {
            name: 'Bhakri',
            keyword: 'Bhakri',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
        }
    ];

    // Orders modal / tracking view toggle
    const [showOrdersModal, setShowOrdersModal] = useState(false);

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [dietFilter, setDietFilter] = useState('ALL'); // 'ALL', 'VEG', 'NON_VEG'
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Online Order State
    const [orderType, setOrderType] = useState('DELIVERY'); // 'DELIVERY' or 'TAKEAWAY'
    const [customerName, setCustomerName] = useState(currentUser?.name || '');
    const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'CARD', 'COD'
    const [orderSuccessId, setOrderSuccessId] = useState(null);
    const [orderError, setOrderError] = useState('');

    // Reservation State
    const [resDate, setResDate] = useState('');
    const [resTime, setResTime] = useState('19:30');
    const [resGuests, setResGuests] = useState(2);
    const [resSeating, setResSeating] = useState('Any Available');
    const [resName, setResName] = useState(currentUser?.name || '');
    const [resPhone, setResPhone] = useState(currentUser?.phone || '');
    const [resEmail, setResEmail] = useState(currentUser?.email || '');
    const [resSpecialRequests, setResSpecialRequests] = useState('');
    const [reservationSuccess, setReservationSuccess] = useState(null);
    const [reservationError, setReservationError] = useState('');

    // Extract unique categories
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

    // Manager Curated Today's Special Dishes
    const todaysSpecialDishes = useMemo(() => {
        return menu.filter(item => item.isTodaysSpecial || item.isWeeklyBest || item.isMonthlyBest);
    }, [menu]);

    // Customer's Orders
    const myOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter(o => {
            if (currentUser?.email && o.customer?.email === currentUser.email) return true;
            if (currentUser?.phone && o.customer?.phone === currentUser.phone) return true;
            if (customerPhone && o.customer?.phone === customerPhone) return true;
            return o.orderSource === 'ONLINE_DELIVERY' || o.orderSource === 'ONLINE_TAKEAWAY';
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [orders, currentUser, customerPhone]);

    // Active order currently in kitchen or delivery
    const activeOrder = useMemo(() => {
        return myOrders.find(o => !['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(o.fulfillmentStatus || o.status));
    }, [myOrders]);

    // Customer's Reservations
    const myReservations = useMemo(() => {
        if (!reservations) return [];
        return reservations.filter(r => {
            if (currentUser?.email && r.email === currentUser.email) return true;
            if (currentUser?.phone && r.phone === currentUser.phone) return true;
            if (resPhone && r.phone === resPhone) return true;
            return true;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [reservations, currentUser, resPhone]);

    // Handle Order Submission
    const handlePlaceOrder = (e) => {
        e.preventDefault();
        setOrderError('');

        if (cart.length === 0) {
            setOrderError('Your cart is empty. Add delicious Kokan dishes first!');
            return;
        }
        if (!customerName.trim() || !customerPhone.trim()) {
            setOrderError('Please provide your name and valid contact phone number.');
            return;
        }
        if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
            setOrderError('Delivery address is required for doorstep delivery.');
            return;
        }

        try {
            const newOrder = createOnlineOrder({
                orderType,
                customer: {
                    name: customerName.trim(),
                    phone: customerPhone.trim(),
                    email: currentUser?.email || ''
                },
                deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
                deliveryNotes: deliveryNotes.trim(),
                paymentMethod
            });

            setOrderSuccessId(newOrder.id);
            clearCart();
            setIsCartOpen(false);
            setShowOrdersModal(true);
        } catch (err) {
            setOrderError(err.message || 'Failed to place order. Please try again.');
        }
    };

    // Handle Table Reservation Submission
    const handleReserveTable = (e) => {
        e.preventDefault();
        setReservationError('');
        setReservationSuccess(null);

        if (!resDate || !resTime) {
            setReservationError('Please choose a valid reservation date and time.');
            return;
        }
        const selectedDate = new Date(`${resDate}T${resTime}`);
        if (selectedDate < new Date()) {
            setReservationError('Cannot reserve a table in the past. Please select an upcoming slot.');
            return;
        }
        if (!resName.trim() || !resPhone.trim()) {
            setReservationError('Full name and mobile number are mandatory.');
            return;
        }
        if (resGuests < 1 || resGuests > 20) {
            setReservationError('Please enter party size between 1 and 20 guests.');
            return;
        }

        try {
            const res = createReservation({
                date: resDate,
                timeSlot: resTime,
                guests: parseInt(resGuests, 10),
                seatingPreference: resSeating,
                customerName: resName.trim(),
                phone: resPhone.trim(),
                email: resEmail.trim(),
                specialRequests: resSpecialRequests.trim()
            });

            setReservationSuccess(res);
            setResSpecialRequests('');
        } catch (err) {
            setReservationError(err.message || 'Could not complete reservation.');
        }
    };

    // Helper: Render Order Status Stepper
    const renderFulfillmentStepper = (order) => {
        const isDelivery = order.orderSource === 'ONLINE_DELIVERY';
        const steps = isDelivery ? [
            { key: 'PLACED', label: 'Placed' },
            { key: 'ACCEPTED', label: 'Accepted' },
            { key: 'PREPARING', label: 'In Kitchen' },
            { key: 'READY', label: 'Ready' },
            { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
            { key: 'DELIVERED', label: 'Delivered' }
        ] : [
            { key: 'PLACED', label: 'Placed' },
            { key: 'ACCEPTED', label: 'Accepted' },
            { key: 'PREPARING', label: 'In Kitchen' },
            { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
            { key: 'PICKED_UP', label: 'Picked Up' }
        ];

        const currentIndex = steps.findIndex(s => s.key === order.fulfillmentStatus);
        const isCancelled = order.fulfillmentStatus === 'CANCELLED';

        if (isCancelled) {
            return (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Order Cancelled: {order.cancelReason || 'Contact support for details.'}</span>
                </div>
            );
        }

        return (
            <div className="w-full my-3">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-red-600 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
                    />
                    {steps.map((step, idx) => {
                        const isDone = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;
                        return (
                            <div key={step.key} className="relative z-10 flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                    isCurrent ? 'bg-red-600 text-white ring-4 ring-red-100 scale-110' :
                                    isDone ? 'bg-red-600 text-white' : 'bg-white border-2 border-neutral-300 text-neutral-400'
                                }`}>
                                    {isDone ? '✓' : idx + 1}
                                </div>
                                <span className={`text-[10px] mt-1 font-semibold text-center hidden sm:block ${
                                    isCurrent ? 'text-red-700 font-bold' : isDone ? 'text-neutral-700' : 'text-neutral-400'
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white pb-20 font-sans">
            {/* Zomato-Style Primary Tab Selector: ONLY DELIVERY and RESERVATION */}
            <div className="bg-white border-b border-neutral-200 sticky top-16 z-30 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-18">
                        {/* Two Primary Mode Tabs: Delivery and Reservation */}
                        <div className="flex items-center gap-6 sm:gap-10">
                            {/* 1. Delivery Tab (Default) */}
                            <button
                                onClick={() => setActiveTab('delivery')}
                                className={`flex items-center gap-3 py-3 border-b-2 transition-all cursor-pointer group ${
                                    activeTab === 'delivery'
                                        ? 'border-red-600 text-red-600'
                                        : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                    activeTab === 'delivery'
                                        ? 'bg-red-50 text-red-600 shadow-2xs'
                                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                                }`}>
                                    <Bike className="w-5 h-5" />
                                </div>
                                <span className={`text-base sm:text-lg font-bold tracking-tight ${
                                    activeTab === 'delivery' ? 'text-red-600' : 'text-neutral-700'
                                }`}>
                                    Delivery
                                </span>
                            </button>

                            {/* 2. Table Reservation Tab */}
                            <button
                                onClick={() => setActiveTab('reservation')}
                                className={`flex items-center gap-3 py-3 border-b-2 transition-all cursor-pointer group ${
                                    activeTab === 'reservation'
                                        ? 'border-red-600 text-red-600'
                                        : 'border-transparent text-neutral-600 hover:text-neutral-900'
                                }`}
                            >
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                                    activeTab === 'reservation'
                                        ? 'bg-red-50 text-red-600 shadow-2xs'
                                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                                }`}>
                                    <UtensilsCrossed className="w-5 h-5" />
                                </div>
                                <span className={`text-base sm:text-lg font-bold tracking-tight ${
                                    activeTab === 'reservation' ? 'text-red-600' : 'text-neutral-700'
                                }`}>
                                    Dining Out & Reservation
                                </span>
                            </button>
                        </div>

                        {/* Right Quick Actions: My Orders button & Cart Pill */}
                        <div className="flex items-center gap-3">
                            {myOrders.length > 0 && (
                                <button
                                    onClick={() => setShowOrdersModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all cursor-pointer"
                                >
                                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                    <span>My Orders</span>
                                    <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                        {myOrders.length}
                                    </span>
                                </button>
                            )}

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                            >
                                <ShoppingBag className="w-4 h-4 text-amber-400" />
                                <span>Cart</span>
                                {computedCount > 0 && (
                                    <span className="bg-red-600 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                                        {computedCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 ${computedCount > 0 ? 'pb-28' : 'pb-12'}`}>

                {/* ============================================================ */}
                {/* 1. DELIVERY VIEW (DEFAULT)                                   */}
                {/* ============================================================ */}
                {activeTab === 'delivery' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Active Live Order Tracking Banner if currently preparing */}
                        {activeOrder && (
                            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-xs font-bold text-neutral-900">
                                            Live Order #{activeOrder.id} is {activeOrder.fulfillmentStatus}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">
                                        {activeOrder.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowOrdersModal(true)}
                                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                                >
                                    <span>Track Live Progress</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Search and Filters Bar */}
                        <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search for Surmai, Pomfret, Solkadhi, Thali..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Pure Veg / Non-Veg Toggle Filter */}
                                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setDietFilter('ALL')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            dietFilter === 'ALL' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDietFilter('VEG')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            dietFilter === 'VEG' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-neutral-600 hover:bg-neutral-50'
                                        }`}
                                    >
                                        <VegNonVegIcon isVeg={true} size={14} /> Pure Veg
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDietFilter('NON_VEG')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            dietFilter === 'NON_VEG' ? 'bg-rose-600 text-white shadow-2xs' : 'text-neutral-600 hover:bg-neutral-50'
                                        }`}
                                    >
                                        <VegNonVegIcon isVeg={false} size={14} /> Non-Veg
                                    </button>
                                </div>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                            selectedCategory === cat
                                                ? 'bg-neutral-900 text-white shadow-2xs'
                                                : 'bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recommended (Circular Dishes Carousel) */}
                        <section className="pt-2">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                                    Recommended
                                </h2>
                                <div className="flex items-center gap-1.5 sm:hidden">
                                    <button
                                        type="button"
                                        onClick={() => scrollRecommended('left')}
                                        className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-all cursor-pointer shadow-2xs"
                                        aria-label="Scroll left"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => scrollRecommended('right')}
                                        className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-all cursor-pointer shadow-2xs"
                                        aria-label="Scroll right"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div
                                    ref={recommendedScrollRef}
                                    className="flex items-center gap-6 sm:gap-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2 scroll-smooth"
                                >
                                    {inspirationDishes.map(item => {
                                        const isSelected = searchQuery.toLowerCase() === item.keyword.toLowerCase();
                                        return (
                                            <div
                                                key={item.name}
                                                onClick={() => {
                                                    setSearchQuery(isSelected ? '' : item.keyword);
                                                }}
                                                className="flex flex-col items-center group cursor-pointer shrink-0 select-none"
                                            >
                                                <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-sm transition-all duration-300 relative bg-neutral-100 ${
                                                    isSelected
                                                        ? 'ring-4 ring-red-500 scale-105 shadow-md'
                                                        : 'group-hover:scale-105 group-hover:shadow-md'
                                                }`}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                                                        }}
                                                    />
                                                </div>
                                                <span className={`text-sm sm:text-base font-semibold mt-3 text-center transition-colors truncate max-w-[120px] ${
                                                    isSelected
                                                        ? 'text-red-600 font-bold'
                                                        : 'text-neutral-800 group-hover:text-red-600'
                                                }`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Floating Right Arrow (Matching reference image) */}
                                <button
                                    type="button"
                                    onClick={() => scrollRecommended('right')}
                                    className="hidden md:flex absolute -right-3 top-1/2 -translate-y-8 w-9 h-9 rounded-full bg-white shadow-md border border-neutral-200 items-center justify-center text-neutral-700 hover:bg-neutral-50 z-10 transition-all cursor-pointer hover:scale-105"
                                    aria-label="Next dishes"
                                >
                                    <ChevronRight className="w-5 h-5 text-neutral-700" />
                                </button>
                            </div>
                        </section>

                        {/* Today's Special (HORIZONTAL RAIL) */}
                        {todaysSpecialDishes.length > 0 && (
                            <section className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-neutral-900 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-red-600" />
                                            Today's Special
                                        </h3>
                                        <p className="text-xs text-neutral-500">Fresh harbor catch & chef handpicked coastal delicacies for today</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                                            {todaysSpecialDishes.length} Specials
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => scrollTodaysSpecial('left')}
                                            className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-all cursor-pointer shadow-2xs"
                                            aria-label="Scroll left"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => scrollTodaysSpecial('right')}
                                            className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition-all cursor-pointer shadow-2xs"
                                            aria-label="Scroll right"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div
                                    ref={todaysSpecialScrollRef}
                                    className="flex gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-3 pt-1 scroll-smooth"
                                >
                                    {todaysSpecialDishes.map(dish => (
                                        <div key={`special-${dish.id}`} className="w-64 sm:w-72 shrink-0 flex flex-col">
                                            <DishCard dish={dish} onAdd={() => setCustomizingDish(dish)} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Full Menu Catalog */}
                        <section className="space-y-4 pt-2">
                            <div>
                                <h3 className="text-lg font-black text-neutral-900">
                                    {selectedCategory === 'All' ? 'All Dishes' : `${selectedCategory}`}
                                </h3>
                                <p className="text-xs text-neutral-500">Fresh Malvani seafood, coastal thalis, starters, curries and bhakri</p>
                            </div>

                            {filteredMenu.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-neutral-300">
                                    <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                                    <h4 className="font-bold text-neutral-700">No dishes match your filter</h4>
                                    <p className="text-neutral-400 text-xs mt-1">Try resetting the search keywords or category.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredMenu.map(dish => (
                                        <DishCard key={dish.id} dish={dish} onAdd={() => setCustomizingDish(dish)} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {/* ============================================================ */}
                {/* 2. TABLE RESERVATION VIEW                                   */}
                {/* ============================================================ */}
                {activeTab === 'reservation' && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                        <div className="text-center space-y-2">
                            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                <Calendar className="w-3.5 h-3.5" /> Book Your Table Online
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                                Dining Out & Table Reservations
                            </h2>
                            <p className="text-neutral-500 text-xs sm:text-sm max-w-lg mx-auto">
                                Reserve your table in advance for guaranteed seating. (Food ordering for dine-in is handled upon arrival).
                            </p>
                        </div>

                        {reservationSuccess && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    <h4 className="font-bold text-sm">Reservation Request Submitted Successfully!</h4>
                                </div>
                                <p className="text-xs text-emerald-800">
                                    Booking ID: <span className="font-mono font-bold">{reservationSuccess.id}</span> for <strong>{reservationSuccess.guests} guests</strong> on <strong>{reservationSuccess.date}</strong> at <strong>{reservationSuccess.timeSlot}</strong>.
                                    Our restaurant manager will confirm your table shortly.
                                </p>
                            </div>
                        )}

                        {reservationError && (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                                <span>{reservationError}</span>
                            </div>
                        )}

                        {/* Booking Form Card */}
                        <form onSubmit={handleReserveTable} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={resDate}
                                        onChange={(e) => setResDate(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Time Slot *
                                    </label>
                                    <select
                                        value={resTime}
                                        onChange={(e) => setResTime(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden font-semibold"
                                    >
                                        <option value="12:30">12:30 PM (Lunch)</option>
                                        <option value="13:15">01:15 PM (Lunch)</option>
                                        <option value="14:00">02:00 PM (Lunch)</option>
                                        <option value="19:00">07:00 PM (Dinner)</option>
                                        <option value="19:45">07:45 PM (Dinner)</option>
                                        <option value="20:30">08:30 PM (Dinner)</option>
                                        <option value="21:15">09:15 PM (Dinner)</option>
                                        <option value="22:00">10:00 PM (Dinner)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Number of Guests *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-neutral-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={resGuests}
                                            onChange={(e) => setResGuests(e.target.value)}
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Seating Preference
                                    </label>
                                    <select
                                        value={resSeating}
                                        onChange={(e) => setResSeating(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden font-semibold"
                                    >
                                        <option value="Any Available">Any Available Table</option>
                                        <option value="Indoor AC">Indoor AC Hall</option>
                                        <option value="Window View">Window View (Garden Facing)</option>
                                        <option value="Family Private">Family Quiet Corner</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Your Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ramesh Kadam"
                                        value={resName}
                                        onChange={(e) => setResName(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Mobile Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="9876543210"
                                        value={resPhone}
                                        onChange={(e) => setResPhone(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={resEmail}
                                        onChange={(e) => setResEmail(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                                    Special Notes or Dietary Requests
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="e.g. High chair for baby, quiet table, birthday celebration..."
                                    value={resSpecialRequests}
                                    onChange={(e) => setResSpecialRequests(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition-all cursor-pointer"
                            >
                                Confirm & Book Table Reservation
                            </button>
                        </form>

                        {/* Customer's Existing Reservations List */}
                        {myReservations.length > 0 && (
                            <section className="space-y-4 pt-4">
                                <h3 className="font-extrabold text-lg text-neutral-900">Your Table Bookings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myReservations.map(res => (
                                        <div key={res.id} className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                                                    res.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                    res.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                    res.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    'bg-rose-100 text-rose-800 border-rose-200'
                                                }`}>
                                                    {res.status}
                                                </span>
                                                <span className="font-mono text-xs text-neutral-400">ID: {res.id}</span>
                                            </div>

                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2 font-bold text-neutral-900">
                                                    <Calendar className="w-4 h-4 text-red-600" />
                                                    <span>{res.date} at {res.timeSlot}</span>
                                                </div>
                                                <p className="text-xs text-neutral-600">
                                                    {res.guests} Guests • {res.seatingPreference}
                                                </p>
                                                {res.assignedTableId && (
                                                    <p className="text-xs font-bold text-emerald-700">
                                                        Table Assigned: Table #{res.assignedTableId}
                                                    </p>
                                                )}
                                                {res.rejectionReason && (
                                                    <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">
                                                        Reason: {res.rejectionReason}
                                                    </p>
                                                )}
                                            </div>

                                            {res.status === 'PENDING' && (
                                                <div className="pt-2 border-t border-neutral-100">
                                                    <button
                                                        onClick={() => updateReservationStatus(res.id, 'CANCELLED', { cancelReason: 'Cancelled by customer' })}
                                                        className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                                                    >
                                                        Cancel Booking
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            {/* ============================================================ */}
            {/* ORDERS & TRACKING MODAL (View past orders & live tracking)   */}
            {/* ============================================================ */}
            {showOrdersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-2xs p-4">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-red-600" />
                                <h3 className="font-black text-base text-neutral-900">My Food Orders</h3>
                            </div>
                            <button
                                onClick={() => setShowOrdersModal(false)}
                                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-4">
                            {myOrders.length === 0 ? (
                                <div className="text-center py-12 text-neutral-400 text-xs">
                                    No food orders placed yet.
                                </div>
                            ) : (
                                myOrders.map(order => (
                                    <div key={order.id} className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-xs">#{order.id}</span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-red-100 text-red-700">
                                                    {order.orderSource === 'ONLINE_DELIVERY' ? 'Delivery' : 'Takeaway'}
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold text-sm">₹{order.totalAmount}</span>
                                        </div>

                                        {renderFulfillmentStepper(order)}

                                        <div className="text-xs text-neutral-600 space-y-1">
                                            {order.items?.map((it, idx) => (
                                                <div key={idx} className="flex justify-between">
                                                    <span>{it.quantity}x {it.name}</span>
                                                    <span>₹{it.price * it.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {order.deliveryAddress && (
                                            <p className="text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded-lg">
                                                📍 {order.deliveryAddress}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* ONLINE CART & CHECKOUT SLIDE-OVER DRAWER                     */}
            {/* ============================================================ */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-2xs transition-opacity"
                        onClick={() => setIsCartOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                            {/* Drawer Header */}
                            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-red-600" />
                                    <h3 className="font-extrabold text-neutral-900 text-base">Your Online Cart</h3>
                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {cartCount} items
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                                {orderError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{orderError}</span>
                                    </div>
                                )}

                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                                        <p className="text-neutral-500 font-semibold text-sm">Your cart is currently empty</p>
                                        <p className="text-neutral-400 text-xs mt-1">Explore our fresh coastal menu to add items.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Order Type Toggle: Delivery or Takeaway */}
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                                                Fulfillment Type *
                                            </label>
                                            <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => setOrderType('DELIVERY')}
                                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                                        orderType === 'DELIVERY'
                                                            ? 'bg-red-600 text-white shadow-xs'
                                                            : 'text-neutral-600 hover:text-neutral-900'
                                                    }`}
                                                >
                                                    <Truck className="w-4 h-4" />
                                                    Doorstep Delivery
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setOrderType('TAKEAWAY')}
                                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                                        orderType === 'TAKEAWAY'
                                                            ? 'bg-amber-600 text-white shadow-xs'
                                                            : 'text-neutral-600 hover:text-neutral-900'
                                                    }`}
                                                >
                                                    <ShoppingBag className="w-4 h-4" />
                                                    Self Takeaway
                                                </button>
                                            </div>
                                        </div>

                                        {/* Cart Items List */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                                <span>Dishes</span>
                                                <button onClick={clearCart} className="text-red-600 hover:underline">
                                                    Clear All
                                                </button>
                                            </div>

                                            <div className="divide-y divide-neutral-100">
                                                {cart.map(item => {
                                                    const itemKey = item.cartItemId || item.id;
                                                    return (
                                                        <div key={itemKey} className="py-2.5 flex items-center justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <VegNonVegIcon isVeg={item.isVeg} size={13} />
                                                                    <h4 className="text-xs font-bold text-neutral-900 truncate">{item.name}</h4>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {item.selectedPortion && (
                                                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                                                                            {item.selectedPortion}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-xs text-neutral-500">₹{item.price} each</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
                                                                <button
                                                                    onClick={() => removeFromCart(itemKey)}
                                                                    className="w-6 h-6 rounded-md bg-white text-neutral-700 flex items-center justify-center hover:bg-neutral-200 cursor-pointer"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => addToCart(item, 1, item.notes || '', item.selectedPortion, item.price)}
                                                                    className="w-6 h-6 rounded-md bg-white text-neutral-700 flex items-center justify-center hover:bg-neutral-200 cursor-pointer"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>

                                                            <span className="text-xs font-bold text-neutral-900 w-14 text-right">
                                                                ₹{item.price * item.quantity}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Customer Details Form */}
                                        <div className="space-y-3 pt-3 border-t border-neutral-200">
                                            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                                                Contact & Delivery Details
                                            </h4>

                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Your Name *"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number *"
                                                    value={customerPhone}
                                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                                    required
                                                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                                />
                                            </div>

                                            {orderType === 'DELIVERY' && (
                                                <div>
                                                    <textarea
                                                        rows="2"
                                                        placeholder="Complete Delivery Address (Flat/House, Street, Landmark) *"
                                                        value={deliveryAddress}
                                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                                        required
                                                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Cooking/delivery instructions (optional)"
                                                    value={deliveryNotes}
                                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                                />
                                            </div>

                                            {/* Payment Method */}
                                            <div>
                                                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                                                    Payment Method
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['UPI', 'CARD', 'COD'].map(method => (
                                                        <button
                                                            key={method}
                                                            type="button"
                                                            onClick={() => setPaymentMethod(method)}
                                                            className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                                paymentMethod === method
                                                                    ? 'border-red-600 bg-red-50 text-red-700'
                                                                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                                            }`}
                                                        >
                                                            {method === 'COD' ? 'Cash on Delivery' : method}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bill Summary */}
                                        <div className="bg-neutral-50 rounded-xl p-3 space-y-1.5 text-xs text-neutral-600 border border-neutral-200">
                                            <div className="flex justify-between">
                                                <span>Items Total</span>
                                                <span>₹{computedSubtotal}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>GST (5%)</span>
                                                <span>₹{Math.round(computedSubtotal * 0.05)}</span>
                                            </div>
                                            {orderType === 'DELIVERY' && (
                                                <div className="flex justify-between">
                                                    <span>Delivery Partner Fee</span>
                                                    <span className="text-emerald-600 font-semibold">FREE</span>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-900">
                                                <span>Grand Total</span>
                                                <span>₹{computedSubtotal + Math.round(computedSubtotal * 0.05)}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            {cart.length > 0 && (
                                <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white space-y-2">
                                    <button
                                        type="button"
                                        onClick={handlePlaceOrder}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Confirm Order • ₹{computedSubtotal + Math.round(computedSubtotal * 0.05)}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <p className="text-[11px] text-center text-neutral-400">
                                        Safe and contactless delivery guaranteed.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Bottom Order Bar (Image 2) */}
            {!isCartOpen && computedCount > 0 && (
                <StickyOrderBar
                    cartCount={computedCount}
                    cartSubtotal={computedSubtotal}
                    onOpenCart={() => setIsCartOpen(true)}
                />
            )}

            {/* Dish Customization & Portion Modal (Image 1) */}
            {customizingDish && (
                <CustomizationModal
                    dish={customizingDish}
                    onClose={() => setCustomizingDish(null)}
                    onAddToCart={(dish, qty, notes, portionName, portionPrice) => {
                        addToCart(dish, qty, notes, portionName, portionPrice);
                    }}
                />
            )}
        </div>
    );
}

// Subcomponent: Dish Card
function DishCard({ dish, onAdd }) {
    return (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group">
            {/* Image & Badges */}
            <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                    }}
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                    <VegNonVegBadge isVeg={dish.isVeg} />

                    {(dish.isTodaysSpecial || dish.isWeeklyBest || dish.isMonthlyBest) && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" /> Today's Special
                        </span>
                    )}
                </div>

                {dish.prepTime && (
                    <span className="absolute bottom-2.5 right-2.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-300" /> {dish.prepTime}m
                    </span>
                )}
            </div>

            {/* Info Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-neutral-900 text-sm leading-snug">{dish.name}</h3>
                        <span className="font-bold text-sm text-neutral-900">₹{dish.price}</span>
                    </div>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {dish.description}
                    </p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-400 capitalize">
                        {dish.category}
                    </span>
                    <button
                        onClick={() => onAdd(dish)}
                        className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
