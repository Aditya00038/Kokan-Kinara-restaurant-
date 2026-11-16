import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
    ChefHat,
    Clock,
    CheckCircle2,
    Flame,
    Filter,
    Truck,
    UtensilsCrossed,
    ShoppingBag,
    AlertCircle,
    User,
    AlertTriangle,
    MessageSquare,
    Check,
    ArrowRight,
    HelpCircle
} from 'lucide-react';

export default function KitchenDisplay() {
    const {
        orders,
        menu,
        advanceFulfillmentStatus,
        reportPreparationDelay,
        reportItemUnavailable,
        requestOrderClarification,
        setCurrentView
    } = useRestaurant();

    // Source Filter: 'ALL', 'DINE_IN', 'DELIVERY', 'TAKEAWAY'
    const [sourceFilter, setSourceFilter] = useState('ALL');
    // Status Filter: 'ACTIVE', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY'
    const [statusFilter, setStatusFilter] = useState('ACTIVE');

    // Dialog state for Kitchen Actions
    const [delayModalOrder, setDelayModalOrder] = useState(null);
    const [delayMinutes, setDelayMinutes] = useState(15);
    const [delayReason, setDelayReason] = useState('Rush hour rush / fresh seafood preparation');

    const [clarifyModalOrder, setClarifyModalOrder] = useState(null);
    const [clarifyQuestion, setClarifyQuestion] = useState('');

    const [unavailModalOrder, setUnavailModalOrder] = useState(null);
    const [unavailItemId, setUnavailItemId] = useState('');
    const [unavailReason, setUnavailReason] = useState('Morning catch ran out');

    // Formatters
    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const getElapsedMinutes = (isoString) => {
        if (!isoString) return '';
        try {
            const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
            if (diff <= 0) return 'Just now';
            if (diff === 1) return '1m ago';
            if (diff < 60) return `${diff}m ago`;
            const hours = Math.floor(diff / 60);
            return `${hours}h ago`;
        } catch {
            return '';
        }
    };

    // Filter orders relevant to Kitchen
    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter(order => {
            // Exclude delivered, picked up, fully served or cancelled from main kitchen display unless specifically filtered
            const fStatus = order.fulfillmentStatus || order.status;
            if (['DELIVERED', 'PICKED_UP', 'SERVED', 'CANCELLED'].includes(fStatus)) {
                return false;
            }

            // Source Filter
            if (sourceFilter === 'DINE_IN') {
                if (order.orderSource !== 'OFFLINE_DINE_IN_QR' && order.orderSource !== 'STAFF_DINE_IN' && order.orderType !== 'dine-in') {
                    return false;
                }
            } else if (sourceFilter === 'DELIVERY') {
                if (order.orderSource !== 'ONLINE_DELIVERY' && order.orderType !== 'delivery') {
                    return false;
                }
            } else if (sourceFilter === 'TAKEAWAY') {
                if (order.orderSource !== 'ONLINE_TAKEAWAY' && order.orderType !== 'takeaway') {
                    return false;
                }
            }

            // Status Filter
            if (statusFilter === 'ACTIVE') {
                return ['PLACED', 'NEW', 'ACCEPTED', 'PREPARING', 'KITCHEN_PREPARING', 'READY', 'ORDER_READY', 'READY_FOR_PICKUP'].includes(fStatus);
            }
            if (statusFilter === 'PLACED') return fStatus === 'PLACED' || fStatus === 'NEW';
            if (statusFilter === 'ACCEPTED') return fStatus === 'ACCEPTED';
            if (statusFilter === 'PREPARING') return fStatus === 'PREPARING' || fStatus === 'KITCHEN_PREPARING';
            if (statusFilter === 'READY') return fStatus === 'READY' || fStatus === 'ORDER_READY' || fStatus === 'READY_FOR_PICKUP';

            return true;
        }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // FIFO: oldest orders first
    }, [orders, sourceFilter, statusFilter]);

    // Counters
    const countDineIn = useMemo(() => orders.filter(o =>
        ['PLACED', 'ACCEPTED', 'PREPARING', 'KITCHEN_PREPARING'].includes(o.fulfillmentStatus || o.status) &&
        (o.orderSource === 'OFFLINE_DINE_IN_QR' || o.orderSource === 'STAFF_DINE_IN' || o.orderType === 'dine-in')
    ).length, [orders]);

    const countDelivery = useMemo(() => orders.filter(o =>
        ['PLACED', 'ACCEPTED', 'PREPARING', 'KITCHEN_PREPARING'].includes(o.fulfillmentStatus || o.status) &&
        (o.orderSource === 'ONLINE_DELIVERY' || o.orderType === 'delivery')
    ).length, [orders]);

    const countTakeaway = useMemo(() => orders.filter(o =>
        ['PLACED', 'ACCEPTED', 'PREPARING', 'KITCHEN_PREPARING'].includes(o.fulfillmentStatus || o.status) &&
        (o.orderSource === 'ONLINE_TAKEAWAY' || o.orderType === 'takeaway')
    ).length, [orders]);

    const countNew = useMemo(() => orders.filter(o =>
        ['PLACED', 'NEW'].includes(o.fulfillmentStatus || o.status)
    ).length, [orders]);

    const countPreparing = useMemo(() => orders.filter(o =>
        ['PREPARING', 'KITCHEN_PREPARING', 'ACCEPTED'].includes(o.fulfillmentStatus || o.status)
    ).length, [orders]);

    const countReady = useMemo(() => orders.filter(o =>
        ['READY', 'ORDER_READY', 'READY_FOR_PICKUP'].includes(o.fulfillmentStatus || o.status)
    ).length, [orders]);

    // Handle Chef Actions
    const handleAcceptTicket = (orderId) => {
        advanceFulfillmentStatus(orderId, 'ACCEPTED', { chefNote: 'Ticket accepted by Chef' });
    };

    const handleStartCooking = (orderId) => {
        advanceFulfillmentStatus(orderId, 'PREPARING', { chefNote: 'Cooking started' });
    };

    const handleMarkReady = (orderId, orderSource) => {
        const target = orderSource === 'ONLINE_TAKEAWAY' ? 'READY_FOR_PICKUP' : 'READY';
        advanceFulfillmentStatus(orderId, target, { chefNote: 'Dishes plated and placed on pass' });
    };

    const submitDelay = (e) => {
        e.preventDefault();
        if (delayModalOrder) {
            reportPreparationDelay(delayModalOrder.id, parseInt(delayMinutes, 10), delayReason);
            setDelayModalOrder(null);
        }
    };

    const submitClarification = (e) => {
        e.preventDefault();
        if (clarifyModalOrder && clarifyQuestion.trim()) {
            requestOrderClarification(clarifyModalOrder.id, clarifyQuestion.trim());
            setClarifyModalOrder(null);
            setClarifyQuestion('');
        }
    };

    const submitItemUnavailable = (e) => {
        e.preventDefault();
        if (unavailModalOrder && unavailItemId) {
            reportItemUnavailable(unavailModalOrder.id, unavailItemId, unavailReason);
            setUnavailModalOrder(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-neutral-800 font-sans">
            {/* Header Banner */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <ChefHat size={26} strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                                Kitchen Display System (KDS)
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                            Chef Production Rail
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                            Unified live queue for Online Delivery, Takeaway, and In-House Dining orders
                        </p>
                    </div>
                </div>

                {/* Live Channel Counters */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl text-center min-w-[85px]">
                        <div className="text-xl font-black text-red-700 font-mono leading-tight">{countNew}</div>
                        <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider">New</div>
                    </div>
                    <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-center min-w-[85px]">
                        <div className="text-xl font-black text-amber-700 font-mono leading-tight">{countPreparing}</div>
                        <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Cooking</div>
                    </div>
                    <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center min-w-[85px]">
                        <div className="text-xl font-black text-emerald-700 font-mono leading-tight">{countReady}</div>
                        <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">On Pass</div>
                    </div>
                </div>
            </div>

            {/* Channels & Categories Navigation Tabs */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-3 mb-6 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Channel Filter (Dine-In, Delivery, Takeaway) */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 shrink-0">Channel:</span>
                    {[
                        { id: 'ALL', label: 'All Orders', count: filteredOrders.length },
                        { id: 'DINE_IN', label: 'Dine-In Tables', count: countDineIn, icon: UtensilsCrossed },
                        { id: 'DELIVERY', label: 'Online Delivery', count: countDelivery, icon: Truck },
                        { id: 'TAKEAWAY', label: 'Takeaway Counter', count: countTakeaway, icon: ShoppingBag }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = sourceFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSourceFilter(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'bg-neutral-900 text-white shadow-xs'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                            >
                                {Icon && <Icon className="w-3.5 h-3.5" />}
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                        isActive ? 'bg-red-500 text-white' : 'bg-neutral-200 text-neutral-800'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Workflow Status Filter */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl shrink-0">
                    {[
                        { id: 'ACTIVE', label: 'All Cooking' },
                        { id: 'PLACED', label: 'New' },
                        { id: 'PREPARING', label: 'In Kitchen' },
                        { id: 'READY', label: 'Ready' }
                    ].map(st => (
                        <button
                            key={st.id}
                            onClick={() => setStatusFilter(st.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                statusFilter === st.id ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets Grid */}
            {filteredOrders.length === 0 ? (
                <div className="py-20 px-6 text-center bg-white border border-neutral-200 rounded-3xl shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <CheckCircle2 size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">Kitchen Station Clear</h3>
                    <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto mb-5">
                        No pending tickets require cooking under the selected filter. Newly placed orders will ping here immediately.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredOrders.map(order => {
                        const fStatus = order.fulfillmentStatus || order.status;
                        const isPlaced = fStatus === 'PLACED' || fStatus === 'NEW';
                        const isAccepted = fStatus === 'ACCEPTED';
                        const isPreparing = fStatus === 'PREPARING' || fStatus === 'KITCHEN_PREPARING';
                        const isReady = fStatus === 'READY' || fStatus === 'ORDER_READY' || fStatus === 'READY_FOR_PICKUP';

                        const isDineIn = order.orderSource === 'OFFLINE_DINE_IN_QR' || order.orderSource === 'STAFF_DINE_IN' || order.orderType === 'dine-in';
                        const isDelivery = order.orderSource === 'ONLINE_DELIVERY' || order.orderType === 'delivery';
                        const isTakeaway = order.orderSource === 'ONLINE_TAKEAWAY' || order.orderType === 'takeaway';

                        const elapsed = getElapsedMinutes(order.createdAt);
                        const isDelayed = order.preparationDelayMinutes > 0;

                        return (
                            <div
                                key={order.id}
                                className={`rounded-2xl bg-white border p-5 flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${
                                    isPlaced
                                        ? 'border-red-300 ring-2 ring-red-500/10'
                                        : isPreparing || isAccepted
                                        ? 'border-amber-300 ring-2 ring-amber-500/10'
                                        : 'border-emerald-300 ring-2 ring-emerald-500/10'
                                }`}
                            >
                                <div>
                                    {/* Ticket Top bar */}
                                    <div className="flex items-start justify-between pb-3 border-b border-neutral-100 gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-base text-neutral-900">
                                                    #{order.id}
                                                </span>
                                                {/* Source Badge */}
                                                {order.orderSource === 'OFFLINE_DINE_IN_QR' ? (
                                                    <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                                        <UtensilsCrossed className="w-3 h-3 text-purple-700" /> 📱 QR Dine-In • Table #{order.tableId || order.tableNumber || '?'} {order.round ? `(R${order.round})` : ''}
                                                    </span>
                                                ) : order.orderSource === 'STAFF_DINE_IN' || (isDineIn && !order.orderSource) ? (
                                                    <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                                        <UtensilsCrossed className="w-3 h-3 text-indigo-700" /> 📝 Staff Dine-In • Table #{order.tableId || order.tableNumber || '?'}
                                                    </span>
                                                ) : isDelivery ? (
                                                    <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                                        <Truck className="w-3 h-3" /> Online Delivery
                                                    </span>
                                                ) : isTakeaway ? (
                                                    <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                                        <ShoppingBag className="w-3 h-3" /> Online Takeaway
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                                <span className="font-medium">{order.customer?.name || order.customerName || 'Customer'}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-0.5">
                                                    <Clock className="w-3 h-3 text-neutral-400" />
                                                    {elapsed}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Chip */}
                                        <div className="text-right">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md inline-block ${
                                                isPlaced ? 'bg-red-500 text-white animate-pulse' :
                                                isAccepted ? 'bg-blue-100 text-blue-800' :
                                                isPreparing ? 'bg-amber-100 text-amber-800' :
                                                'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {fStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delay Notification Banner if any */}
                                    {isDelayed && (
                                        <div className="my-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                            <span><strong>Delay Reported:</strong> +{order.preparationDelayMinutes} mins ({order.delayReason})</span>
                                        </div>
                                    )}

                                    {/* Customer / Service Notes */}
                                    {(order.specialInstructions || order.deliveryNotes) && (
                                        <div className="my-2 p-2.5 bg-yellow-50/80 border border-yellow-200 rounded-xl text-xs text-yellow-900 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold text-[10px] uppercase tracking-wider block text-yellow-800">Instructions:</span>
                                                <span>{order.specialInstructions || order.deliveryNotes}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items List */}
                                    <div className="mt-3 bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-2">
                                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex justify-between">
                                            <span>Dishes to Cook</span>
                                            <span>Portions</span>
                                        </div>

                                        <div className="divide-y divide-neutral-200/60">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-md bg-neutral-900 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                                                            {item.quantity}x
                                                        </span>
                                                        <span className="font-bold text-neutral-900">{item.name}</span>
                                                        {item.selectedPortion && (
                                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                                                                {item.selectedPortion}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-neutral-500">
                                                        {item.quantity} {item.quantity === 1 ? 'plate' : 'plates'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Clarifications / Item Flags */}
                                    {order.clarificationQuestions?.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {order.clarificationQuestions.map((q, qIdx) => (
                                                <div key={qIdx} className="text-[11px] bg-blue-50 text-blue-900 p-2 rounded-lg border border-blue-200 flex items-center gap-1.5">
                                                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                                    <span><strong>Clarification Asked:</strong> "{q.question}"</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Chef Actions Panel */}
                                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                                    {/* Step 1: Accept Ticket */}
                                    {isPlaced && (
                                        <button
                                            onClick={() => handleAcceptTicket(order.id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Accept Ticket</span>
                                        </button>
                                    )}

                                    {/* Step 2: Start Cooking */}
                                    {isAccepted && (
                                        <button
                                            onClick={() => handleStartCooking(order.id)}
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                                        >
                                            <Flame className="w-4 h-4" />
                                            <span>Start Cooking (In Kitchen)</span>
                                        </button>
                                    )}

                                    {/* Step 3: Mark Ready (Place on pass) */}
                                    {isPreparing && (
                                        <button
                                            onClick={() => handleMarkReady(order.id, order.orderSource)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Mark Dishes as Ready</span>
                                        </button>
                                    )}

                                    {/* Step 4: When READY */}
                                    {isReady && (
                                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                                            {isDineIn && "✓ On Pass — Waiting for Waiter to serve Table #" + (order.tableId || order.tableNumber || '')}
                                            {isDelivery && "✓ Packed — Waiting for Delivery Dispatch"}
                                            {isTakeaway && "✓ Packed — Waiting at Counter for Customer"}
                                        </div>
                                    )}

                                    {/* Secondary Chef Controls: Delay, Out of Stock, Clarification */}
                                    <div className="grid grid-cols-3 gap-1 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setDelayModalOrder(order)}
                                            className="px-2 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 flex items-center justify-center gap-1"
                                            title="Notify prep delay"
                                        >
                                            <Clock className="w-3 h-3 text-amber-600" />
                                            Delay
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClarifyModalOrder(order)}
                                            className="px-2 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 flex items-center justify-center gap-1"
                                            title="Ask for order clarification"
                                        >
                                            <HelpCircle className="w-3 h-3 text-blue-600" />
                                            Clarify
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUnavailModalOrder(order);
                                                if (order.items?.[0]) setUnavailItemId(order.items[0].id);
                                            }}
                                            className="px-2 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 flex items-center justify-center gap-1"
                                            title="Flag an item out of stock"
                                        >
                                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                                            Stock
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delay Modal */}
            {delayModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={submitDelay} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <h3>Report Kitchen Delay (#{delayModalOrder.id})</h3>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Additional Minutes Required</label>
                            <input
                                type="number"
                                min="5"
                                max="60"
                                step="5"
                                value={delayMinutes}
                                onChange={(e) => setDelayMinutes(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Reason for Delay</label>
                            <input
                                type="text"
                                value={delayReason}
                                onChange={(e) => setDelayReason(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDelayModalOrder(null)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
                            >
                                Notify Station & Waiter
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Clarification Modal */}
            {clarifyModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={submitClarification} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                            <h3>Ask Question / Clarify (#{clarifyModalOrder.id})</h3>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Question for Waiter / Manager</label>
                            <textarea
                                rows="3"
                                placeholder="e.g. Please confirm if guest wants Solkadhi without chili or coconut..."
                                value={clarifyQuestion}
                                onChange={(e) => setClarifyQuestion(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setClarifyModalOrder(null)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                            >
                                Send Clarification Alert
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Item Unavailable Modal */}
            {unavailModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={submitItemUnavailable} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
                        <div className="flex items-center gap-2 text-neutral-900 font-bold">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                            <h3>Report Unavailable Dish (#{unavailModalOrder.id})</h3>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Select Item Out of Stock</label>
                            <select
                                value={unavailItemId}
                                onChange={(e) => setUnavailItemId(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                                required
                            >
                                {unavailModalOrder.items?.map(it => (
                                    <option key={it.id} value={it.id}>{it.name} (Qty: {it.quantity})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Stock Reason</label>
                            <input
                                type="text"
                                value={unavailReason}
                                onChange={(e) => setUnavailReason(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setUnavailModalOrder(null)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                            >
                                Flag Unavailable
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
