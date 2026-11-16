import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { VegNonVegIcon } from '../Common/VegNonVegBadge';
import {
    UtensilsCrossed,
    Users,
    CheckCircle2,
    Bell,
    Clock,
    Sparkles,
    Plus,
    X,
    Calendar,
    AlertCircle,
    UserCheck,
    Coffee,
    Search,
    ChevronRight,
    Check,
    GlassWater,
    QrCode,
    Receipt
} from 'lucide-react';
import QRCodeModal from '../Common/QRCodeModal';

export default function WaiterDashboard() {
    const {
        tables,
        orders,
        reservations,
        serviceRequests,
        menu,
        diningSessions,
        startDiningSession,
        completeTableCleaning,
        markFoodServed,
        resolveServiceRequest,
        createServiceRequest,
        updateTableStatus,
        updateReservationStatus,
        createOnlineOrder
    } = useRestaurant();

    const { currentUser } = useAuth();

    // Sub-view: 'FLOOR' (tables & ready to serve), 'WALK_IN' (take walk-in order), 'RESERVATIONS' (check-in arriving guests)
    const [activeTab, setActiveTab] = useState('FLOOR');

    // Table QR and Seating Modal State
    const [qrModalTable, setQrModalTable] = useState(null);
    const [seatModalTable, setSeatModalTable] = useState(null);
    const [seatingGuests, setSeatingGuests] = useState(2);
    const [seatingName, setSeatingName] = useState('');

    // POS Walk-in Order State
    const [walkInTableId, setWalkInTableId] = useState(tables[0]?.id || 1);
    const [walkInGuestCount, setWalkInGuestCount] = useState(2);
    const [walkInCart, setWalkInCart] = useState([]);
    const [walkInNotes, setWalkInNotes] = useState('');
    const [walkInSuccess, setWalkInSuccess] = useState('');
    const [posSearch, setPosSearch] = useState('');

    // Service request modal
    const [newServiceModal, setNewServiceModal] = useState(false);
    const [serviceTableId, setServiceTableId] = useState(1);
    const [serviceType, setServiceType] = useState('WATER');
    const [serviceNote, setServiceNote] = useState('');

    // Ready-to-serve orders (Dine-in only where status is READY)
    const readyToServeOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter(o => {
            const fStatus = o.fulfillmentStatus || o.status;
            const isDineIn = o.orderSource === 'OFFLINE_DINE_IN_QR' || o.orderSource === 'STAFF_DINE_IN' || o.orderType === 'dine-in';
            return isDineIn && (fStatus === 'READY' || fStatus === 'ORDER_READY');
        });
    }, [orders]);

    // Active in-progress dine-in orders
    const activeDineInOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter(o => {
            const fStatus = o.fulfillmentStatus || o.status;
            const isDineIn = o.orderSource === 'OFFLINE_DINE_IN_QR' || o.orderSource === 'STAFF_DINE_IN' || o.orderType === 'dine-in';
            return isDineIn && ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(fStatus);
        });
    }, [orders]);

    // Active Service Requests
    const pendingServiceRequests = useMemo(() => {
        if (!serviceRequests) return [];
        return serviceRequests.filter(s => s.status === 'PENDING')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [serviceRequests]);

    // Reservations awaiting arrival today
    const arrivingReservations = useMemo(() => {
        if (!reservations) return [];
        return reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING');
    }, [reservations]);

    // Add to Walk-in POS Cart
    const addWalkInItem = (dish) => {
        setWalkInCart(prev => {
            const existing = prev.find(item => item.id === dish.id);
            if (existing) {
                return prev.map(item =>
                    item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...dish, quantity: 1 }];
        });
    };

    const removeWalkInItem = (dishId) => {
        setWalkInCart(prev => {
            const existing = prev.find(item => item.id === dishId);
            if (existing && existing.quantity > 1) {
                return prev.map(item =>
                    item.id === dishId ? { ...item, quantity: item.quantity - 1 } : item
                );
            }
            return prev.filter(item => item.id !== dishId);
        });
    };

    const submitWalkInOrder = (e) => {
        e.preventDefault();
        if (walkInCart.length === 0) {
            alert('Please select at least one dish for the table.');
            return;
        }

        const itemsTotal = walkInCart.reduce((s, i) => s + (i.price * i.quantity), 0);
        const tax = Math.round(itemsTotal * 0.05);

        // Ensure table has an active dining session
        let session = diningSessions.find(s => (s.tableId === walkInTableId || s.tableNumber === parseInt(walkInTableId, 10)) && s.status !== 'CLOSED');
        if (!session) {
            const res = startDiningSession({
                tableId: walkInTableId,
                guestCount: walkInGuestCount,
                customerName: `Walk-In Guests`,
                openedBy: currentUser?.name || 'Waiter Staff'
            });
            if (res.success) session = res.session;
        }

        const newOrder = {
            id: `KK-DINE-${Date.now().toString().slice(-4)}`,
            orderSource: 'STAFF_DINE_IN',
            orderType: 'dine-in',
            tableId: session?.tableId || walkInTableId,
            tableNumber: session?.tableNumber || parseInt(walkInTableId, 10),
            diningSessionId: session?.id || null,
            customer: {
                name: `Table ${walkInTableId} Walk-In`,
                phone: 'N/A'
            },
            items: walkInCart,
            subtotal: itemsTotal,
            tax,
            totalAmount: itemsTotal + tax,
            specialInstructions: walkInNotes,
            paymentStatus: 'UNPAID',
            paymentMethod: 'CASH',
            fulfillmentStatus: 'PLACED',
            status: 'PLACED',
            createdAt: new Date().toISOString()
        };

        // Create order via context method
        createOnlineOrder(newOrder);

        setWalkInSuccess(`Order #${newOrder.id} successfully sent to kitchen for Table #${walkInTableId}!`);
        setWalkInCart([]);
        setWalkInNotes('');
        setTimeout(() => setWalkInSuccess(''), 5000);
    };

    const handleCreateServiceRequest = (e) => {
        e.preventDefault();
        createServiceRequest({
            tableId: parseInt(serviceTableId, 10),
            type: serviceType,
            description: serviceNote || `${serviceType} requested by waiter`
        });
        setNewServiceModal(false);
        setServiceNote('');
    };

    const handleCheckInGuest = (resId, assignedTableId) => {
        const tableToUse = assignedTableId || 1;
        updateReservationStatus(resId, 'CHECKED_IN', { assignedTableId: tableToUse });
        updateTableStatus(tableToUse, 'occupied');
        alert(`Guest checked in and seated at Table #${tableToUse}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-neutral-800 font-sans">
            {/* Header Banner */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                        <UtensilsCrossed size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                Dining Room Floor Service
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-neutral-900">
                            Waitstaff Station
                        </h1>
                        <p className="text-xs text-neutral-500">
                            On-duty: <span className="font-semibold text-neutral-800">{currentUser?.name || 'Staff Waiter'}</span> • Tables, ready-to-serve food, customer assistance & reservations
                        </p>
                    </div>
                </div>

                {/* Sub-view Navigation Tabs */}
                <div className="flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-2xl self-start md:self-center">
                    <button
                        onClick={() => setActiveTab('FLOOR')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'FLOOR'
                                ? 'bg-white text-neutral-900 shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>Floor & Tables</span>
                        {readyToServeOrders.length > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-bounce">
                                {readyToServeOrders.length} Ready
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('WALK_IN')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'WALK_IN'
                                ? 'bg-white text-neutral-900 shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Take Order (POS)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('RESERVATIONS')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'RESERVATIONS'
                                ? 'bg-white text-neutral-900 shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Arriving Guests</span>
                        {arrivingReservations.length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                                {arrivingReservations.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ============================================================ */}
            {/* SUBVIEW 1: FLOOR & TABLES (Ready-to-serve, Assistance, Tables) */}
            {/* ============================================================ */}
            {activeTab === 'FLOOR' && (
                <div className="space-y-6">
                    {/* Top Row: Ready to Serve Rail & Active Service Requests */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Ready to Serve Pass Rail */}
                        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm text-neutral-900">Ready to Serve on Pass</h3>
                                            <p className="text-[11px] text-neutral-500">Food ready in kitchen waiting for waiter to run</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        {readyToServeOrders.length} pending
                                    </span>
                                </div>

                                <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                                    {readyToServeOrders.length === 0 ? (
                                        <div className="text-center py-8 text-neutral-400 text-xs">
                                            <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-emerald-400 opacity-60" />
                                            <span>No dishes waiting on pass right now.</span>
                                        </div>
                                    ) : (
                                        readyToServeOrders.map(order => (
                                            <div key={order.id} className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3 shadow-2xs">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-xs text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                                                            Table #{order.tableId || order.tableNumber}
                                                        </span>
                                                        <span className="font-mono text-xs text-neutral-500">#{order.id}</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-800 font-semibold mt-1 truncate">
                                                        {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => markFoodServed(order.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span>Mark Served</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Customer Service & Assistance Requests */}
                        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm text-neutral-900">Table Assistance Requests</h3>
                                            <p className="text-[11px] text-neutral-500">Water, napkins, bill and service calls</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setNewServiceModal(true)}
                                        className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> New Request
                                    </button>
                                </div>

                                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                    {pendingServiceRequests.length === 0 ? (
                                        <div className="text-center py-8 text-neutral-400 text-xs">
                                            <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-neutral-300" />
                                            <span>All customer assistance calls attended.</span>
                                        </div>
                                    ) : (
                                        pendingServiceRequests.map(req => (
                                            <div key={req.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-3 shadow-2xs">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-xs text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                                                            Table #{req.tableId}
                                                        </span>
                                                        <span className="font-bold text-xs text-amber-800 uppercase tracking-wide">
                                                            {req.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-700 mt-0.5 truncate">
                                                        {req.description}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => resolveServiceRequest(req.id)}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs shrink-0 transition-all"
                                                >
                                                    Attend Done
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dining Room Table Grid */}
                    <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="font-extrabold text-base text-neutral-900">Dining Room Table Status</h3>
                                <p className="text-xs text-neutral-500">Monitor table occupancy, clean after checkout, or seat arriving guests.</p>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-3 text-xs flex-wrap">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reserved
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Cleaning
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                            {tables.map(table => {
                                const activeSession = diningSessions?.find(s => s.tableId === table.id && s.status !== 'CLOSED');
                                const statusColors = {
                                    available: 'border-emerald-300 bg-emerald-50/40 text-emerald-900',
                                    occupied: 'border-rose-300 bg-rose-50/40 text-rose-900',
                                    billed: 'border-amber-300 bg-amber-50/40 text-amber-900',
                                    reserved: 'border-amber-300 bg-amber-50/40 text-amber-900',
                                    cleaning: 'border-blue-300 bg-blue-50/40 text-blue-900',
                                    inactive: 'border-neutral-300 bg-neutral-100 text-neutral-500'
                                };

                                const badgeColors = {
                                    available: 'bg-emerald-600 text-white',
                                    occupied: 'bg-rose-600 text-white',
                                    billed: 'bg-amber-600 text-white',
                                    reserved: 'bg-amber-600 text-white',
                                    cleaning: 'bg-blue-600 text-white',
                                    inactive: 'bg-neutral-500 text-white'
                                };

                                return (
                                    <div
                                        key={table.id}
                                        className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all shadow-2xs hover:shadow-xs ${
                                            statusColors[table.status] || 'border-neutral-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-black text-lg">#{table.tableNumber}</span>
                                                    <span className="text-[10px] text-neutral-500">({table.section || 'Hall'})</span>
                                                </div>
                                                <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {table.capacity} seats max
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                badgeColors[table.status] || 'bg-neutral-200'
                                            }`}>
                                                {table.status}
                                            </span>
                                        </div>

                                        {/* Session Details if Occupied */}
                                        {activeSession && (
                                            <div className="p-2.5 bg-white/80 rounded-xl border border-neutral-200/80 text-xs space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-neutral-900 truncate max-w-[130px]">
                                                        {activeSession.customerName}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-500">
                                                        {activeSession.guestCount} guests
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-neutral-500">Orders: {activeSession.orderIds?.length || 0}</span>
                                                    <span className="font-bold text-neutral-900">₹{activeSession.total}</span>
                                                </div>
                                                {activeSession.status === 'BILL_REQUESTED' && (
                                                    <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-center">
                                                        🧾 Bill Requested
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Quick Table Action Buttons */}
                                        <div className="space-y-1.5 pt-2 border-t border-neutral-200/60">
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => setQrModalTable(table)}
                                                    className="flex-1 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-bold py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                                >
                                                    <QrCode className="w-3.5 h-3.5" />
                                                    <span>Table QR</span>
                                                </button>

                                                {table.status === 'available' && (
                                                    <button
                                                        onClick={() => {
                                                            setSeatModalTable(table);
                                                            setSeatingGuests(table.capacity > 2 ? 4 : 2);
                                                            setSeatingName('');
                                                        }}
                                                        className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                                                    >
                                                        <span>Seat & Activate</span>
                                                    </button>
                                                )}
                                            </div>

                                            {table.status === 'cleaning' && (
                                                <button
                                                    onClick={() => completeTableCleaning(table.id)}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-xl text-xs shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Mark Sanitized & Available
                                                </button>
                                            )}

                                            {(table.status === 'occupied' || table.status === 'billed') && (
                                                <button
                                                    onClick={() => updateTableStatus(table.id, 'cleaning')}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-xl text-xs shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                >
                                                    Move Table to Cleaning
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* SUBVIEW 2: WALK-IN CUSTOMER POS (Waitstaff Order Pad) */}
            {/* ============================================================ */}
            {activeTab === 'WALK_IN' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-amber-500 text-neutral-950 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-neutral-950/10 px-2.5 py-0.5 rounded-full">
                                Walk-in Table Ordering
                            </span>
                            <h2 className="text-xl font-black mt-1">Staff Dine-In Order Entry</h2>
                            <p className="text-xs text-amber-950 mt-0.5">Punch items directly for guests seated at restaurant tables.</p>
                        </div>
                        {walkInSuccess && (
                            <div className="bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs animate-pulse">
                                {walkInSuccess}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Dishes Selection (Left 2 cols) */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="relative">
                                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search dish to punch (Surmai, Thali, Solkadhi...)"
                                    value={posSearch}
                                    onChange={(e) => setPosSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                                {menu
                                    .filter(m => m.name.toLowerCase().includes(posSearch.toLowerCase()) || m.category.toLowerCase().includes(posSearch.toLowerCase()))
                                    .map(dish => (
                                        <div key={dish.id} className="bg-white p-3 rounded-xl border border-neutral-200 flex items-center justify-between gap-2 shadow-2xs hover:border-amber-300 transition-all">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <VegNonVegIcon isVeg={dish.isVeg} size={13} />
                                                    <span className="font-bold text-xs text-neutral-900 truncate">{dish.name}</span>
                                                </div>
                                                <p className="text-xs text-neutral-500">₹{dish.price} • {dish.category}</p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => addWalkInItem(dish)}
                                                className="bg-neutral-900 hover:bg-neutral-800 text-white p-1.5 rounded-lg text-xs font-bold transition-all shrink-0"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Order Pad & Ticket Summary (Right Col) */}
                        <form onSubmit={submitWalkInOrder} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                            <div>
                                <h3 className="font-black text-sm text-neutral-900 pb-3 border-b border-neutral-100 flex items-center justify-between">
                                    <span>Table Order Pad</span>
                                    <span className="text-xs font-normal text-neutral-500">{walkInCart.length} items</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-2 my-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Table #</label>
                                        <select
                                            value={walkInTableId}
                                            onChange={(e) => setWalkInTableId(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold"
                                        >
                                            {tables.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    Table #{t.tableNumber} ({t.status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">Guests</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={walkInGuestCount}
                                            onChange={(e) => setWalkInGuestCount(e.target.value)}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Cart list */}
                                <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                                    {walkInCart.length === 0 ? (
                                        <div className="text-center py-6 text-neutral-400 text-xs">
                                            No items added yet. Click '+' on any dish to add.
                                        </div>
                                    ) : (
                                        walkInCart.map(item => (
                                            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                                                <div>
                                                    <span className="font-bold text-neutral-900">{item.name}</span>
                                                    <span className="text-neutral-500 block">₹{item.price} each</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeWalkInItem(item.id)}
                                                        className="w-5 h-5 bg-neutral-200 rounded flex items-center justify-center font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => addWalkInItem(item)}
                                                        className="w-5 h-5 bg-neutral-900 text-white rounded flex items-center justify-center font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-3">
                                    <input
                                        type="text"
                                        placeholder="Special chef instructions (less oil, extra spicy...)"
                                        value={walkInNotes}
                                        onChange={(e) => setWalkInNotes(e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={walkInCart.length === 0}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <UtensilsCrossed className="w-4 h-4" />
                                <span>Fire Order to Kitchen</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* SUBVIEW 3: ARRIVING GUESTS / RESERVATIONS VERIFICATION */}
            {/* ============================================================ */}
            {activeTab === 'RESERVATIONS' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-neutral-900">Arriving Guest Verification</h2>
                            <p className="text-xs text-neutral-500">Verify online table reservations when customers reach the restaurant.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {arrivingReservations.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-neutral-200">
                                <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                                <p className="text-neutral-500 text-xs">No pending or confirmed reservations waiting for check-in.</p>
                            </div>
                        ) : (
                            arrivingReservations.map(res => (
                                <div key={res.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs font-bold text-neutral-500">#{res.id}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                            res.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {res.status}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="font-black text-sm text-neutral-900">{res.customerName}</h4>
                                        <p className="text-xs text-neutral-500">{res.phone} • {res.email || 'No email'}</p>
                                    </div>

                                    <div className="bg-neutral-50 rounded-xl p-2.5 text-xs text-neutral-700 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span>Date & Slot:</span>
                                            <span className="font-bold">{res.date} at {res.timeSlot}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Party:</span>
                                            <span className="font-bold">{res.guests} Guests ({res.seatingPreference})</span>
                                        </div>
                                        {res.specialRequests && (
                                            <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1">
                                                Note: {res.specialRequests}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleCheckInGuest(res.id, res.assignedTableId)}
                                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                                    >
                                        <UserCheck className="w-4 h-4 text-emerald-400" />
                                        <span>Seat Guest ({res.assignedTableId ? `Table #${res.assignedTableId}` : 'Assign Table'})</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Create Service Request Modal */}
            {newServiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={handleCreateServiceRequest} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                                <GlassWater className="w-4 h-4 text-blue-600" />
                                Create Service Call
                            </h3>
                            <button type="button" onClick={() => setNewServiceModal(false)} className="text-neutral-400 hover:text-neutral-700">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Table Number</label>
                            <select
                                value={serviceTableId}
                                onChange={(e) => setServiceTableId(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                            >
                                {tables.map(t => (
                                    <option key={t.id} value={t.id}>Table #{t.tableNumber}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Service Type</label>
                            <select
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                            >
                                <option value="WATER">Water Refill</option>
                                <option value="NAPKINS">Extra Napkins / Cutlery</option>
                                <option value="CLEANING">Table Spill / Cleaning</option>
                                <option value="BILL">Bill Request</option>
                                <option value="CALL_WAITER">General Waiter Assistance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Note (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Bottled water preferred"
                                value={serviceNote}
                                onChange={(e) => setServiceNote(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setNewServiceModal(false)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs"
                            >
                                Log Request
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* QR Code Modal for Table */}
            {qrModalTable && (
                <QRCodeModal
                    table={qrModalTable}
                    onClose={() => setQrModalTable(null)}
                />
            )}

            {/* Seat Guest & Start Dining Session Modal */}
            {seatModalTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-fadeIn">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const res = startDiningSession({
                                tableId: seatModalTable.id,
                                guestCount: seatingGuests,
                                customerName: seatingName.trim() || `Table ${seatModalTable.number} Guests`,
                                openedBy: currentUser?.name || 'Waiter Staff'
                            });
                            const tableToOpen = seatModalTable;
                            setSeatModalTable(null);
                            if (res.success) {
                                setQrModalTable(tableToOpen);
                            }
                        }}
                        className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-neutral-200"
                    >
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <div>
                                <h3 className="font-black text-base text-neutral-900">Seat Diners at Table #{seatModalTable.number}</h3>
                                <p className="text-[11px] text-neutral-500">{seatModalTable.section} • Capacity {seatModalTable.capacity} guests</p>
                            </div>
                            <button type="button" onClick={() => setSeatModalTable(null)} className="text-neutral-400 hover:text-neutral-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Number of Diners *</label>
                            <input
                                type="number"
                                min="1"
                                max={seatModalTable.capacity + 2}
                                value={seatingGuests}
                                onChange={(e) => setSeatingGuests(parseInt(e.target.value, 10) || 1)}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Guest / Party Name (Optional)</label>
                            <input
                                type="text"
                                placeholder={`e.g. Deshmukh Family or Party of ${seatingGuests}`}
                                value={seatingName}
                                onChange={(e) => setSeatingName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                            />
                        </div>

                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
                            <p className="font-bold text-neutral-900">Dining Session Activation</p>
                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                                Activating this session will mark the table as occupied and enable the unique QR code on the table for live mobile ordering.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setSeatModalTable(null)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-xs"
                            >
                                Activate Session & Show QR
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
