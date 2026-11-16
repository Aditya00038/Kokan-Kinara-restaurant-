import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { VegNonVegIcon } from '../Common/VegNonVegBadge';
import {
    Crown,
    UtensilsCrossed,
    Search,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    Clock,
    Printer,
    RotateCcw,
    AlertCircle,
    Activity,
    User,
    MessageSquare,
    PackageCheck,
    Sparkles,
    Flame,
    Trophy,
    Truck,
    ShoppingBag,
    Calendar,
    Users,
    Shield,
    X,
    Filter,
    Layers,
    Check,
    HelpCircle,
    Phone,
    MapPin,
    AlertTriangle,
    Eye,
    QrCode
} from 'lucide-react';
import ReceiptModal from '../Common/ReceiptModal';
import QRCodeModal from '../Common/QRCodeModal';

export default function SystemManager() {
    const {
        tables,
        menu,
        orders,
        reservations,
        staff,
        serviceRequests,
        systemLogs,
        diningSessions,
        startDiningSession,
        getActiveSessionForTable,
        generateSessionBill,
        settleSessionPayment,
        completeTableCleaning,
        toggleItemStock,
        toggleTopDish,
        advanceFulfillmentStatus,
        dispatchDeliveryOrder,
        markOrderDelivered,
        markTakeawayPickedUp,
        updateReservationStatus,
        updateTableStatus,
        resolveServiceRequest,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addStaffMember,
        updateStaffMember,
        toggleStaffStatus,
        deleteStaffMember,
        processPayment,
        resetToDemoState
    } = useRestaurant();

    // Active Manager Module Tab
    // 'overview' | 'orders' | 'reservations' | 'tables' | 'sessions' | 'menu' | 'stock' | 'staff' | 'support' | 'logs'
    const [activeTab, setActiveTab] = useState('overview');

    // QR & Seating Modal States
    const [selectedTableForQR, setSelectedTableForQR] = useState(null);
    const [seatModalTable, setSeatModalTable] = useState(null);
    const [seatCustomerName, setSeatCustomerName] = useState('');
    const [seatGuestCount, setSeatGuestCount] = useState(2);

    // Orders Filter State
    const [orderSourceFilter, setOrderSourceFilter] = useState('ALL');
    const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
    const [orderSearch, setOrderSearch] = useState('');

    // Cancel Order Dialog State
    const [cancelModalOrder, setCancelModalOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState('Customer requested cancellation');

    // Reservations Hub State
    const [resFilter, setResFilter] = useState('ALL');
    const [rejectModalRes, setRejectModalRes] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('Fully booked at this requested time slot');
    const [assignTableModalRes, setAssignTableModalRes] = useState(null);
    const [targetAssignTableId, setTargetAssignTableId] = useState(1);

    // Menu Management Add Item Modal State
    const [showAddDishModal, setShowAddDishModal] = useState(false);
    const [newDishName, setNewDishName] = useState('');
    const [newDishPrice, setNewDishPrice] = useState(250);
    const [newDishCategory, setNewDishCategory] = useState('Thalis');
    const [newDishDesc, setNewDishDesc] = useState('');
    const [newDishIsVeg, setNewDishIsVeg] = useState(false);
    const [newDishPrepTime, setNewDishPrepTime] = useState(25);
    const [newDishStock, setNewDishStock] = useState(15);
    const [newDishImage, setNewDishImage] = useState('');

    // Staff Management Add Staff Modal State
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffRole, setNewStaffRole] = useState('kitchen');
    const [newStaffShift, setNewStaffShift] = useState('Full Day');
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffPhone, setNewStaffPhone] = useState('');

    // Top Dishes Curation State
    const [topDishesCurationFilter, setTopDishesCurationFilter] = useState('all'); // 'all' | 'special'
    const [curationSearch, setCurationSearch] = useState('');
    const [curationCategory, setCurationCategory] = useState('All');

    // Receipt Modal State
    const [viewingReceiptOrder, setViewingReceiptOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('UPI');

    // Extract unique categories
    const categories = useMemo(() => {
        return ['All', ...new Set(menu.map(item => item.category))];
    }, [menu]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter(order => {
            // Source Filter
            if (orderSourceFilter !== 'ALL') {
                if (orderSourceFilter === 'ONLINE_DELIVERY' && order.orderSource !== 'ONLINE_DELIVERY' && order.orderType !== 'delivery') return false;
                if (orderSourceFilter === 'ONLINE_TAKEAWAY' && order.orderSource !== 'ONLINE_TAKEAWAY' && order.orderType !== 'takeaway') return false;
                if (orderSourceFilter === 'OFFLINE_DINE_IN_QR' && order.orderSource !== 'OFFLINE_DINE_IN_QR') return false;
                if (orderSourceFilter === 'STAFF_DINE_IN' && order.orderSource !== 'STAFF_DINE_IN') return false;
                if (orderSourceFilter === 'DINE_IN' && order.orderSource !== 'OFFLINE_DINE_IN_QR' && order.orderSource !== 'STAFF_DINE_IN' && order.orderType !== 'dine-in') return false;
            }

            // Status Filter
            const fStatus = order.fulfillmentStatus || order.status;
            if (orderStatusFilter !== 'ALL' && fStatus !== orderStatusFilter) {
                return false;
            }

            // Search Filter
            if (orderSearch.trim()) {
                const q = orderSearch.toLowerCase();
                const matchId = String(order.id).toLowerCase().includes(q);
                const matchCust = (order.customer?.name || order.customerName || '').toLowerCase().includes(q);
                return matchId || matchCust;
            }

            return true;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [orders, orderSourceFilter, orderStatusFilter, orderSearch]);

    // Filtered Reservations
    const filteredReservations = useMemo(() => {
        if (!reservations) return [];
        return reservations.filter(res => {
            if (resFilter === 'ALL') return true;
            return res.status === resFilter;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [reservations, resFilter]);

    // Curated Menu List
    const curatedFilteredMenu = useMemo(() => {
        return menu.filter(dish => {
            const isSpecial = dish.isTodaysSpecial || dish.isWeeklyBest || dish.isMonthlyBest;
            const matchPeriod =
                topDishesCurationFilter === 'all' ||
                (topDishesCurationFilter === 'special' && isSpecial) ||
                (topDishesCurationFilter === 'weekly' && isSpecial) ||
                (topDishesCurationFilter === 'monthly' && isSpecial);
            const matchCat = curationCategory === 'All' || dish.category === curationCategory;
            const q = curationSearch.trim().toLowerCase();
            const matchSearch = !q || dish.name.toLowerCase().includes(q) || dish.category.toLowerCase().includes(q);
            return matchPeriod && matchCat && matchSearch;
        });
    }, [menu, topDishesCurationFilter, curationCategory, curationSearch]);

    // Overview Statistics
    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => !['DELIVERED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'].includes(o.fulfillmentStatus || o.status)).length;
        const activeDeliveries = orders.filter(o => (o.orderSource === 'ONLINE_DELIVERY' || o.orderType === 'delivery') && !['DELIVERED', 'CANCELLED'].includes(o.fulfillmentStatus || o.status)).length;
        const activeTakeaways = orders.filter(o => (o.orderSource === 'ONLINE_TAKEAWAY' || o.orderType === 'takeaway') && !['PICKED_UP', 'CANCELLED'].includes(o.fulfillmentStatus || o.status)).length;
        const occupiedTables = tables.filter(t => t.status === 'occupied').length;
        const pendingReservations = reservations.filter(r => r.status === 'PENDING').length;
        const pendingServiceCalls = serviceRequests.filter(s => s.status === 'PENDING').length;
        const lowStockItems = menu.filter(m => m.stockCount <= 3).length;

        return {
            totalOrders,
            pendingOrders,
            activeDeliveries,
            activeTakeaways,
            occupiedTables,
            pendingReservations,
            pendingServiceCalls,
            lowStockItems
        };
    }, [orders, tables, reservations, serviceRequests, menu]);

    // Handlers
    const handleConfirmReservation = (resId, assignedTableId) => {
        updateReservationStatus(resId, 'CONFIRMED', {
            assignedTableId: assignedTableId || 1
        });
    };

    const handleRejectReservation = (e) => {
        e.preventDefault();
        if (rejectModalRes) {
            updateReservationStatus(rejectModalRes.id, 'REJECTED', {
                rejectionReason
            });
            setRejectModalRes(null);
        }
    };

    const handleAssignTableSubmit = (e) => {
        e.preventDefault();
        if (assignTableModalRes) {
            updateReservationStatus(assignTableModalRes.id, 'CONFIRMED', {
                assignedTableId: parseInt(targetAssignTableId, 10)
            });
            updateTableStatus(parseInt(targetAssignTableId, 10), 'reserved');
            setAssignTableModalRes(null);
        }
    };

    const handleCancelOrderSubmit = (e) => {
        e.preventDefault();
        if (cancelModalOrder) {
            advanceFulfillmentStatus(cancelModalOrder.id, 'CANCELLED', {
                cancelReason,
                cancelledBy: 'Manager'
            });
            setCancelModalOrder(null);
        }
    };

    const handleAddDishSubmit = (e) => {
        e.preventDefault();
        addMenuItem({
            name: newDishName.trim(),
            category: newDishCategory,
            price: parseFloat(newDishPrice),
            description: newDishDesc.trim(),
            isVeg: newDishIsVeg,
            dietary: newDishIsVeg ? 'Veg' : 'Non-Veg',
            prepTime: parseInt(newDishPrepTime, 10),
            stockCount: parseInt(newDishStock, 10),
            image: newDishImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
        });
        setShowAddDishModal(false);
        setNewDishName('');
        setNewDishDesc('');
    };

    const handleAddStaffSubmit = (e) => {
        e.preventDefault();
        if (!newStaffName.trim()) return;
        addStaffMember({
            name: newStaffName.trim(),
            role: newStaffRole,
            shift: newStaffShift,
            email: newStaffEmail.trim(),
            phone: newStaffPhone.trim()
        });
        setShowAddStaffModal(false);
        setNewStaffName('');
        setNewStaffEmail('');
        setNewStaffPhone('');
        setNewStaffShift('Full Day');
    };

    const handleSettleBill = (orderId, method) => {
        processPayment(orderId, method, true);
        const updated = orders.find(o => o.id === orderId);
        if (updated) {
            setViewingReceiptOrder({
                ...updated,
                status: 'COMPLETED',
                fulfillmentStatus: 'COMPLETED',
                paymentStatus: 'PAID',
                paymentMethod: method,
                receiptNumber: 'RCP-' + Math.floor(100000 + Math.random() * 900000)
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-neutral-800 font-sans">
            {/* Header Banner */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <Crown size={26} strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                General Manager Command
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                            Operations & System Manager
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                            Order dispatch, reservations hub, menu curation, inventory & staff management
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={resetToDemoState}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-all cursor-pointer"
                        title="Reset all orders and tables to initial clean state"
                    >
                        <RotateCcw size={13} />
                        <span>Reset Demo Data</span>
                    </button>
                </div>
            </div>

            {/* Manager Module Navigation Tabs */}
            <div className="flex border-b border-neutral-200 mb-6 gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                {[
                    { id: 'overview', label: 'Overview', icon: Crown },
                    { id: 'orders', label: `Orders (${stats.pendingOrders})`, icon: Clock },
                    { id: 'reservations', label: `Reservations (${stats.pendingReservations})`, icon: Calendar },
                    { id: 'tables', label: `Tables (${stats.occupiedTables} Occ)`, icon: Layers },
                    { id: 'sessions', label: `Dine-In Sessions (${(diningSessions || []).filter(s => s.status !== 'CLOSED').length})`, icon: UtensilsCrossed },
                    { id: 'menu', label: 'Menu & Curation', icon: Sparkles },
                    { id: 'stock', label: `Stock (${stats.lowStockItems} Low)`, icon: PackageCheck },
                    { id: 'staff', label: `Staff (${staff?.length || 0})`, icon: Users },
                    { id: 'support', label: `Service Calls (${stats.pendingServiceCalls})`, icon: HelpCircle },
                    { id: 'logs', label: 'Audit Trail', icon: Activity }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                                isActive
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                            }`}
                        >
                            <Icon size={15} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ============================================================ */}
            {/* MODULE 1: OPERATIONS OVERVIEW DASHBOARD                     */}
            {/* ============================================================ */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Live Metric Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Today's Orders</span>
                            <div className="text-2xl font-black text-neutral-900 mt-1">{stats.totalOrders}</div>
                            <span className="text-[11px] text-neutral-500 mt-0.5 block">{stats.pendingOrders} currently active</span>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Active Deliveries</span>
                            <div className="text-2xl font-black text-red-700 mt-1">{stats.activeDeliveries}</div>
                            <span className="text-[11px] text-neutral-500 mt-0.5 block">Doorstep dispatch</span>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Advance Reservations</span>
                            <div className="text-2xl font-black text-amber-700 mt-1">{stats.pendingReservations}</div>
                            <span className="text-[11px] text-neutral-500 mt-0.5 block">Pending confirmation</span>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Dining Room</span>
                            <div className="text-2xl font-black text-purple-700 mt-1">{stats.occupiedTables} / {tables.length}</div>
                            <span className="text-[11px] text-neutral-500 mt-0.5 block">Tables occupied</span>
                        </div>
                    </div>

                    {/* Quick Action Shortcuts */}
                    <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <Crown className="w-5 h-5 text-amber-400" />
                                Manager Priority Actions
                            </h3>
                            <p className="text-xs text-neutral-300">
                                Review unconfirmed table bookings, dispatch prepared delivery orders, or curate this week's top dishes.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveTab('reservations')}
                                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                            >
                                <Calendar className="w-4 h-4" /> Review Reservations ({stats.pendingReservations})
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                            >
                                <Truck className="w-4 h-4" /> Dispatch Deliveries
                            </button>
                            <button
                                onClick={() => setActiveTab('menu')}
                                className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 border border-white/20"
                            >
                                <Sparkles className="w-4 h-4 text-amber-400" /> Curate Dishes
                            </button>
                        </div>
                    </div>

                    {/* Pending Service Requests & Delays Banner */}
                    {stats.pendingServiceCalls > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500 text-white rounded-xl">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-neutral-900">
                                        {stats.pendingServiceCalls} Dining Room Service Calls Need Attention
                                    </h4>
                                    <p className="text-xs text-neutral-600">Guests have requested water, napkins, or table assistance.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('support')}
                                className="bg-amber-600 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs hover:bg-amber-700"
                            >
                                Attend Calls
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 2: CENTRAL ORDER ENGINE & DISPATCH                   */}
            {/* ============================================================ */}
            {activeTab === 'orders' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by Order ID or customer name..."
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        {/* Source Filter */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                            <span className="text-[11px] font-bold text-neutral-400 uppercase">Source:</span>
                            {[
                                { id: 'ALL', label: 'All Sources' },
                                { id: 'ONLINE_DELIVERY', label: 'Delivery' },
                                { id: 'ONLINE_TAKEAWAY', label: 'Takeaway' },
                                { id: 'OFFLINE_DINE_IN_QR', label: '📱 QR Dine-In' },
                                { id: 'STAFF_DINE_IN', label: '📝 Staff Dine-In' }
                            ].map(sf => (
                                <button
                                    key={sf.id}
                                    onClick={() => setOrderSourceFilter(sf.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        orderSourceFilter === sf.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {sf.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orders Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrders.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-neutral-200">
                                <p className="text-neutral-500 text-sm">No orders match the selected filters.</p>
                            </div>
                        ) : (
                            filteredOrders.map(order => {
                                const fStatus = order.fulfillmentStatus || order.status;
                                const isDelivery = order.orderSource === 'ONLINE_DELIVERY' || order.orderType === 'delivery';
                                const isTakeaway = order.orderSource === 'ONLINE_TAKEAWAY' || order.orderType === 'takeaway';
                                const isDineIn = !isDelivery && !isTakeaway;
                                const isPaid = order.paymentStatus === 'PAID';

                                return (
                                    <div key={order.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex items-start justify-between pb-2 border-b border-neutral-100">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-bold text-neutral-900 text-sm">#{order.id}</span>
                                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                                                            order.orderSource === 'OFFLINE_DINE_IN_QR' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                                                            order.orderSource === 'STAFF_DINE_IN' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' :
                                                            isDelivery ? 'bg-red-100 text-red-700' :
                                                            isTakeaway ? 'bg-amber-100 text-amber-800' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {order.orderSource === 'OFFLINE_DINE_IN_QR' ? `📱 QR • Table #${order.tableId || order.tableNumber || '?'}` :
                                                             order.orderSource === 'STAFF_DINE_IN' ? `📝 Staff • Table #${order.tableId || order.tableNumber || '?'}` :
                                                             isDelivery ? 'Delivery' : isTakeaway ? 'Takeaway' : `Table #${order.tableId || order.tableNumber || '?'}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 mt-0.5">
                                                        {order.customer?.name || order.customerName || 'Customer'}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-sm text-neutral-900 block">₹{order.totalAmount || order.total}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                                        isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                                                    }`}>
                                                        {isPaid ? 'PAID' : 'UNPAID'} ({order.paymentMethod || 'UPI'})
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Kitchen Delay Notice */}
                                            {order.preparationDelayMinutes > 0 && (
                                                <div className="my-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                                    <span><strong>Delay Reported:</strong> +{order.preparationDelayMinutes}m ({order.delayReason})</span>
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="my-2 flex items-center justify-between text-xs">
                                                <span className="text-neutral-500">Status:</span>
                                                <span className="font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px]">
                                                    {fStatus}
                                                </span>
                                            </div>

                                            {/* Items List */}
                                            <div className="divide-y divide-neutral-100 max-h-32 overflow-y-auto text-xs py-1">
                                                {order.items?.map((it, idx) => (
                                                    <div key={idx} className="py-1 flex justify-between">
                                                        <span>{it.quantity}x {it.name}</span>
                                                        <span className="font-mono text-neutral-500">₹{it.price * it.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Delivery Address / Pick-up Info */}
                                            {isDelivery && order.deliveryAddress && (
                                                <p className="text-[11px] text-neutral-500 mt-2 bg-neutral-50 p-2 rounded-lg line-clamp-2">
                                                    📍 {order.deliveryAddress}
                                                </p>
                                            )}
                                        </div>

                                        {/* Manager Controls: Dispatch, Handover, Settle Bill, Cancel */}
                                        <div className="pt-2 border-t border-neutral-100 space-y-2">
                                            {/* Online Delivery Dispatch Controls */}
                                            {isDelivery && fStatus === 'READY' && (
                                                <button
                                                    onClick={() => dispatchDeliveryOrder(order.id, 'Standard Delivery Agent')}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                                                >
                                                    <Truck className="w-4 h-4" />
                                                    <span>Dispatch Delivery Partner</span>
                                                </button>
                                            )}
                                            {isDelivery && fStatus === 'OUT_FOR_DELIVERY' && (
                                                <button
                                                    onClick={() => markOrderDelivered(order.id)}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>Confirm Delivered to Doorstep</span>
                                                </button>
                                            )}

                                            {/* Online Takeaway Handover Controls */}
                                            {isTakeaway && (fStatus === 'READY' || fStatus === 'READY_FOR_PICKUP') && (
                                                <button
                                                    onClick={() => markTakeawayPickedUp(order.id)}
                                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                                                >
                                                    <ShoppingBag className="w-4 h-4" />
                                                    <span>Handover to Customer (Picked Up)</span>
                                                </button>
                                            )}

                                            {/* Bill Settlement */}
                                            {!isPaid && (
                                                <button
                                                    onClick={() => handleSettleBill(order.id, 'UPI')}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Mark Bill Paid (Settle)
                                                </button>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setViewingReceiptOrder(order)}
                                                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1"
                                                >
                                                    <Printer className="w-3.5 h-3.5" /> Bill
                                                </button>
                                                {fStatus !== 'CANCELLED' && fStatus !== 'COMPLETED' && (
                                                    <button
                                                        onClick={() => setCancelModalOrder(order)}
                                                        className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 rounded-xl text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 3: RESERVATIONS HUB                                   */}
            {/* ============================================================ */}
            {activeTab === 'reservations' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Advance Table Bookings</h2>
                            <p className="text-xs text-neutral-500">Confirm, reject with reason, or assign seating tables for arriving diners.</p>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
                            {['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'REJECTED'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setResFilter(st)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        resFilter === st ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredReservations.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-neutral-200">
                                <p className="text-neutral-500 text-sm">No reservations found matching this filter.</p>
                            </div>
                        ) : (
                            filteredReservations.map(res => (
                                <div key={res.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-bold text-neutral-500">#{res.id}</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                                res.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                                                res.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                                res.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {res.status}
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-black text-sm text-neutral-900">{res.customerName}</h4>
                                            <p className="text-xs text-neutral-500">{res.phone} • {res.email || 'No email'}</p>
                                        </div>

                                        <div className="bg-neutral-50 rounded-xl p-3 text-xs space-y-1 text-neutral-700">
                                            <div className="flex justify-between">
                                                <span>Date & Time:</span>
                                                <span className="font-bold">{res.date} at {res.timeSlot}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Guests:</span>
                                                <span className="font-bold">{res.guests} ({res.seatingPreference})</span>
                                            </div>
                                            {res.assignedTableId && (
                                                <div className="flex justify-between text-emerald-700 font-bold">
                                                    <span>Assigned Table:</span>
                                                    <span>Table #{res.assignedTableId}</span>
                                                </div>
                                            )}
                                            {res.rejectionReason && (
                                                <div className="text-rose-700 bg-rose-50 p-2 rounded mt-1">
                                                    Reason: {res.rejectionReason}
                                                </div>
                                            )}
                                            {res.specialRequests && (
                                                <div className="text-amber-800 bg-amber-50 p-2 rounded mt-1">
                                                    Note: {res.specialRequests}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2 border-t border-neutral-100 space-y-2">
                                        {res.status === 'PENDING' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setAssignTableModalRes(res)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Confirm & Table
                                                </button>
                                                <button
                                                    onClick={() => setRejectModalRes(res)}
                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 rounded-xl text-xs"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {res.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => {
                                                    updateReservationStatus(res.id, 'CHECKED_IN');
                                                    if (res.assignedTableId) updateTableStatus(res.assignedTableId, 'occupied');
                                                }}
                                                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-1.5 rounded-xl text-xs"
                                            >
                                                Mark Customer Arrived (Check-In)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 4: FLOOR & TABLE CONTROLS                             */}
            {/* ============================================================ */}
            {activeTab === 'tables' && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Dining Room Table Floor Plan</h2>
                            <p className="text-xs text-neutral-500">Manage table statuses: Available, Occupied, Reserved, Cleaning, Inactive.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-neutral-500 font-bold">
                                {(diningSessions || []).filter(s => s.status !== 'CLOSED').length} Active Sessions
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tables.map(table => {
                            const activeSess = (diningSessions || []).find(s => (s.tableId === table.id || s.tableNumber === table.tableNumber) && s.status !== 'CLOSED');

                            return (
                                <div key={table.id} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 space-y-3 flex flex-col justify-between hover:border-neutral-300 transition-all shadow-2xs">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-black text-base text-neutral-900">Table #{table.tableNumber}</span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                table.status === 'occupied' ? 'bg-rose-100 text-rose-800' :
                                                table.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                                                table.status === 'cleaning' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                                'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {table.status}
                                            </span>
                                        </div>

                                        <div className="text-xs text-neutral-500">
                                            <p>Capacity: <strong className="text-neutral-800">{table.capacity} diners</strong></p>
                                            <p>Section: {table.section || 'Main Dining Hall'}</p>
                                        </div>

                                        {/* Active Session Snippet */}
                                        {activeSess && (
                                            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                                                <div className="flex justify-between font-bold">
                                                    <span>Diner: {activeSess.customerName || 'Guest'}</span>
                                                    <span>{activeSess.guestCount}p</span>
                                                </div>
                                                <div className="flex justify-between text-[11px] text-purple-700 font-mono">
                                                    <span>{activeSess.orderIds?.length || 0} order rounds</span>
                                                    <span className="font-bold">₹{activeSess.total?.toFixed(2) || '0.00'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 pt-2 border-t border-neutral-200/60">
                                        {/* Table QR Button */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedTableForQR(table)}
                                            className="w-full py-1.5 px-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                                        >
                                            <QrCode size={13} className="text-purple-600" />
                                            <span>Table QR Code</span>
                                        </button>

                                        {/* Dynamic Table Lifecycle Button */}
                                        {table.status === 'cleaning' ? (
                                            <button
                                                type="button"
                                                onClick={() => completeTableCleaning(table.id)}
                                                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                                            >
                                                <CheckCircle2 size={13} />
                                                <span>Mark Sanitized & Available</span>
                                            </button>
                                        ) : table.status === 'available' ? (
                                            <button
                                                type="button"
                                                onClick={() => setSeatModalTable(table)}
                                                className="w-full py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                                            >
                                                <UtensilsCrossed size={13} />
                                                <span>Seat & Start Session</span>
                                            </button>
                                        ) : table.status === 'occupied' ? (
                                            <div className="grid grid-cols-2 gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('sessions')}
                                                    className="py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                                                >
                                                    Session
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateTableStatus(table.id, 'cleaning')}
                                                    className="py-1.5 px-2 bg-neutral-200 hover:bg-blue-100 text-neutral-700 hover:text-blue-800 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                                                >
                                                    Clean
                                                </button>
                                            </div>
                                        ) : (
                                            <select
                                                value={table.status}
                                                onChange={(e) => updateTableStatus(table.id, e.target.value)}
                                                className="w-full px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold bg-white"
                                            >
                                                <option value="available">Available</option>
                                                <option value="occupied">Occupied</option>
                                                <option value="reserved">Reserved</option>
                                                <option value="cleaning">Cleaning</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 4B: DINE-IN DINING SESSIONS                           */}
            {/* ============================================================ */}
            {activeTab === 'sessions' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                                Active & Closed Table Dining Sessions
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Monitor table ordering rounds, consolidated bills, payment collection, and turnover to cleaning.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                                {(diningSessions || []).filter(s => s.status !== 'CLOSED').length} Active Sessions
                            </span>
                        </div>
                    </div>

                    {/* Sessions Grid */}
                    {(diningSessions || []).length === 0 ? (
                        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                            <UtensilsCrossed size={36} className="text-neutral-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-neutral-700">No Dining Sessions Found</h3>
                            <p className="text-xs text-neutral-400 mt-1">
                                Seat guests from the Tables tab or Waiter station to start a dining session.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {(diningSessions || []).map(sess => {
                                const isClosed = sess.status === 'CLOSED';
                                const isBillReq = sess.status === 'BILL_REQUESTED';
                                const sessionOrders = orders.filter(o => o.diningSessionId === sess.id);

                                return (
                                    <div
                                        key={sess.id}
                                        className={`bg-white rounded-3xl border p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                                            isBillReq ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-neutral-200'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-lg text-neutral-900 font-mono">
                                                            Table #{sess.tableNumber}
                                                        </span>
                                                        <span className="text-xs text-neutral-500 font-mono">({sess.section || 'Hall'})</span>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                            isClosed ? 'bg-emerald-100 text-emerald-800' :
                                                            isBillReq ? 'bg-amber-500 text-white font-extrabold animate-bounce' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {isClosed ? 'CLOSED' : isBillReq ? '🔔 BILL REQUESTED' : sess.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-600 mt-0.5">
                                                        Guest: <strong>{sess.customerName || 'Table Guest'}</strong> ({sess.guestCount} persons)
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <div className="font-mono font-black text-lg text-neutral-900">
                                                        ₹{sess.total?.toFixed(2) || '0.00'}
                                                    </div>
                                                    <span className="text-[10px] font-mono text-neutral-400 block">
                                                        Opened: {new Date(sess.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Order Tickets in this session */}
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                                                    Order Rounds ({sessionOrders.length} placed)
                                                </span>
                                                {sessionOrders.length > 0 ? (
                                                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                                        {sessionOrders.map((ord, oIdx) => (
                                                            <div key={ord.id} className="p-2 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-bold text-[11px] text-neutral-800">
                                                                        R{oIdx + 1} #{ord.id}
                                                                    </span>
                                                                    <span className="text-neutral-500">
                                                                        {ord.items?.length || 0} items
                                                                    </span>
                                                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                                                        ord.fulfillmentStatus === 'SERVED' ? 'bg-emerald-100 text-emerald-700' :
                                                                        ord.fulfillmentStatus === 'READY' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-neutral-200 text-neutral-700'
                                                                    }`}>
                                                                        {ord.fulfillmentStatus || ord.status}
                                                                    </span>
                                                                </div>
                                                                <span className="font-mono font-bold text-neutral-900">
                                                                    ₹{ord.total?.toFixed(2) || '0.00'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-neutral-400 italic">No food tickets ordered yet.</div>
                                                )}
                                            </div>

                                            {/* Financial Totals */}
                                            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs space-y-1">
                                                <div className="flex justify-between text-neutral-600">
                                                    <span>Subtotal:</span>
                                                    <span className="font-mono font-semibold">₹{sess.subtotal?.toFixed(2) || '0.00'}</span>
                                                </div>
                                                <div className="flex justify-between text-neutral-600">
                                                    <span>GST (5%):</span>
                                                    <span className="font-mono font-semibold">₹{sess.tax?.toFixed(2) || '0.00'}</span>
                                                </div>
                                                <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-200 pt-1">
                                                    <span>Grand Total:</span>
                                                    <span className="font-mono text-red-600">₹{sess.total?.toFixed(2) || '0.00'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="pt-2 border-t border-neutral-100 space-y-2">
                                            {!isClosed ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const bill = generateSessionBill(sess.id);
                                                            if (bill) {
                                                                setViewingReceiptOrder({
                                                                    id: sess.id,
                                                                    receiptNumber: `PRE-BILL-${sess.id.slice(-6)}`,
                                                                    orderType: 'dine-in',
                                                                    tableNumber: sess.tableNumber,
                                                                    customerName: sess.customerName || `Table ${sess.tableNumber} Guest`,
                                                                    createdAt: sess.openedAt,
                                                                    items: bill.items,
                                                                    subtotal: bill.subtotal,
                                                                    taxAmount: bill.tax,
                                                                    total: bill.total
                                                                });
                                                                setShowReceiptModal(true);
                                                            }
                                                        }}
                                                        className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all text-center cursor-pointer"
                                                    >
                                                        Review Bill
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            settleSessionPayment(sess.id, 'UPI', true);
                                                        }}
                                                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center cursor-pointer shadow-xs"
                                                    >
                                                        Settle & Close
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                                                    <span>Settled via {sess.paymentMethod || 'UPI'}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const bill = generateSessionBill(sess.id);
                                                            setViewingReceiptOrder({
                                                                id: sess.id,
                                                                receiptNumber: sess.receiptNumber || `RCP-${sess.id.slice(-6)}`,
                                                                orderType: 'dine-in',
                                                                tableNumber: sess.tableNumber,
                                                                customerName: sess.customerName || `Table ${sess.tableNumber} Guest`,
                                                                createdAt: sess.openedAt,
                                                                paidAt: sess.closedAt || new Date().toISOString(),
                                                                paymentMethod: sess.paymentMethod || 'UPI',
                                                                items: bill?.items || [],
                                                                subtotal: sess.subtotal,
                                                                taxAmount: sess.tax,
                                                                total: sess.total
                                                            });
                                                            setShowReceiptModal(true);
                                                        }}
                                                        className="text-red-600 hover:underline font-bold"
                                                    >
                                                        View Receipt
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 5: MENU MANAGEMENT & CURATION CRUD                    */}
            {/* ============================================================ */}
            {activeTab === 'menu' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                Menu Catalog & Manager Curation
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Add dishes, modify prices, toggle in/out of stock, or designate Today's Specials.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAddDishModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add New Dish
                        </button>
                    </div>

                    {/* Filter and Curation Toolbar */}
                    <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search dishes (Surmai, Pomfret, Modak)..."
                                value={curationSearch}
                                onChange={(e) => setCurationSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm"
                            />
                        </div>

                        <div className="flex bg-neutral-100 p-1 rounded-xl shrink-0">
                            <button
                                onClick={() => setTopDishesCurationFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    topDishesCurationFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                                }`}
                            >
                                All ({menu.length})
                            </button>
                            <button
                                onClick={() => setTopDishesCurationFilter('special')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    topDishesCurationFilter === 'special' ? 'bg-red-600 text-white shadow-xs' : 'text-neutral-600'
                                }`}
                            >
                                ✨ Today's Special ({menu.filter(m => m.isTodaysSpecial || m.isWeeklyBest || m.isMonthlyBest).length})
                            </button>
                        </div>
                    </div>

                    {/* Dishes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {curatedFilteredMenu.map(dish => (
                            <div key={dish.id} className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={dish.image}
                                            alt={dish.name}
                                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <VegNonVegIcon isVeg={dish.isVeg} size={13} />
                                                    <h4 className="font-bold text-sm text-neutral-900 truncate">{dish.name}</h4>
                                                </div>
                                                <button
                                                    onClick={() => deleteMenuItem(dish.id)}
                                                    className="text-neutral-300 hover:text-rose-600 p-1"
                                                    title="Delete dish"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-neutral-500">{dish.category} • <strong className="text-neutral-900">₹{dish.price}</strong></p>
                                            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{dish.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock & Curation Controls */}
                                <div className="pt-2 border-t border-neutral-100 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={`font-semibold ${dish.stockCount <= 3 ? 'text-rose-600' : 'text-neutral-600'}`}>
                                            Stock: {dish.stockCount} portions
                                        </span>
                                        <button
                                            onClick={() => toggleItemStock(dish.id)}
                                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                                dish.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}
                                        >
                                            {dish.inStock ? 'In Stock' : 'Out of Stock'}
                                        </button>
                                    </div>

                                    {/* Today's Special Manager Toggle */}
                                    <div>
                                        <button
                                            onClick={() => toggleTopDish(dish.id, 'todaysSpecial')}
                                            className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                (dish.isTodaysSpecial || dish.isWeeklyBest || dish.isMonthlyBest) 
                                                    ? 'bg-red-600 text-white shadow-2xs' 
                                                    : 'bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-600'
                                            }`}
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>
                                                {(dish.isTodaysSpecial || dish.isWeeklyBest || dish.isMonthlyBest) 
                                                    ? "Today's Special (Active)" 
                                                    : "+ Mark Today's Special"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 6: INVENTORY & STOCK TRACKING                         */}
            {/* ============================================================ */}
            {activeTab === 'stock' && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Portion Inventory & Deductions</h2>
                            <p className="text-xs text-neutral-500">Track remaining kitchen portion supplies across both online and offline channels.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {menu.map(dish => (
                            <div key={dish.id} className="p-3.5 rounded-xl border border-neutral-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                                <div>
                                    <h4 className="font-bold text-xs sm:text-sm text-neutral-900">{dish.name}</h4>
                                    <p className="text-[11px] text-neutral-500">{dish.category} • ₹{dish.price}</p>
                                    <p className="text-xs font-semibold text-neutral-700 mt-1">
                                        Portions Remaining: <strong className={dish.stockCount <= 3 ? 'text-rose-600' : 'text-neutral-900'}>{dish.stockCount}</strong>
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1.5 shrink-0">
                                    <button
                                        onClick={() => toggleItemStock(dish.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            dish.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                        }`}
                                    >
                                        {dish.inStock ? 'In Stock' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 7: STAFF MANAGEMENT                                   */}
            {/* ============================================================ */}
            {activeTab === 'staff' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Restaurant Staff & Kitchen Chef Roster</h2>
                            <p className="text-xs text-neutral-500">Onboard kitchen chefs, floor waitstaff, and billing operators.</p>
                        </div>
                        <button
                            onClick={() => setShowAddStaffModal(true)}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                        >
                            <Plus className="w-4 h-4" /> Add Staff / Chef
                        </button>
                    </div>

                    {staff && staff.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {staff.map(member => (
                                <div key={member.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3 hover:border-neutral-300 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-sm text-neutral-900">{member.name}</h4>
                                            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                                member.role === 'kitchen' ? 'bg-rose-100 text-rose-700' :
                                                member.role === 'waiter' ? 'bg-amber-100 text-amber-700' :
                                                member.role === 'cashier' ? 'bg-blue-100 text-blue-700' :
                                                member.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                                                'bg-neutral-100 text-neutral-700'
                                            }`}>
                                                {member.role === 'kitchen' ? '👨‍🍳 Kitchen Chef' :
                                                 member.role === 'waiter' ? '🛎️ Floor Waiter' :
                                                 member.role === 'cashier' ? '💵 Cashier / POS' :
                                                 member.role === 'manager' ? '👔 Manager' :
                                                 member.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => toggleStaffStatus(member.id)}
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-colors ${
                                                    member.status === 'active' || member.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                                                }`}
                                            >
                                                {member.status || (member.isActive ? 'active' : 'inactive')}
                                            </button>
                                            <button
                                                onClick={() => deleteStaffMember(member.id)}
                                                title="Remove Staff Member"
                                                className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-xs text-neutral-500 space-y-0.5 pt-1">
                                        <p>Email: <span className="text-neutral-700 font-medium">{member.email}</span></p>
                                        <p>Phone: <span className="text-neutral-700 font-medium">{member.phone}</span></p>
                                        {member.shift && <p className="text-neutral-400">Shift: {member.shift}</p>}
                                    </div>

                                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                                        <span className="text-[11px] text-neutral-400">Role:</span>
                                        <select
                                            value={member.role}
                                            onChange={(e) => updateStaffMember(member.id, { role: e.target.value })}
                                            className="text-xs font-bold px-2 py-1 border border-neutral-300 rounded-lg bg-neutral-50"
                                        >
                                            <option value="kitchen">Kitchen Chef</option>
                                            <option value="waiter">Floor Waiter</option>
                                            <option value="cashier">Cashier</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-neutral-300 text-center space-y-4 shadow-xs">
                            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                                👨‍🍳
                            </div>
                            <div className="max-w-md mx-auto space-y-1">
                                <h3 className="font-bold text-base text-neutral-900">No Staff or Chefs Added Yet</h3>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    As the Restaurant Manager, you can onboard kitchen chefs, waitstaff, and billing operators. Once added here, they will appear in real time across the Kitchen, Waiter, and Admin dashboards.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddStaffModal(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add First Staff Member / Chef
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 8: CUSTOMER SUPPORT & ASSISTANCE                      */}
            {/* ============================================================ */}
            {activeTab === 'support' && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Customer Assistance & Floor Calls</h2>
                            <p className="text-xs text-neutral-500">Service requests submitted by seated diners or front-of-house staff.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {serviceRequests.length === 0 ? (
                            <div className="text-center py-12 text-neutral-400 text-xs">
                                No active customer service requests.
                            </div>
                        ) : (
                            serviceRequests.map(req => (
                                <div key={req.id} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between gap-3 shadow-2xs">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs bg-white px-2 py-0.5 rounded border border-neutral-200">
                                                Table #{req.tableId}
                                            </span>
                                            <span className="font-bold text-xs text-amber-800 uppercase">{req.type}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                                req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-700 mt-1">{req.description}</p>
                                    </div>

                                    {req.status === 'PENDING' && (
                                        <button
                                            onClick={() => resolveServiceRequest(req.id)}
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs shrink-0"
                                        >
                                            Resolve Call
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODULE 9: SYSTEM AUDIT TRAIL                                */}
            {/* ============================================================ */}
            {activeTab === 'logs' && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs animate-fadeIn">
                    <h2 className="text-base font-bold text-neutral-900 mb-3">Live Restaurant System Logs</h2>
                    <div className="space-y-2">
                        {systemLogs.map(log => (
                            <div key={log.id} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs flex items-center justify-between gap-3">
                                <div>
                                    <span className="font-bold text-neutral-900 mr-2">[{log.sender}]</span>
                                    <span className="text-neutral-700">{log.message}</span>
                                </div>
                                <span className="text-[11px] text-neutral-400 font-mono shrink-0">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Dish Modal */}
            {showAddDishModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={handleAddDishSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-base text-neutral-900">Add New Dish to Kokan Menu</h3>
                            <button type="button" onClick={() => setShowAddDishModal(false)} className="text-neutral-400 hover:text-neutral-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Dish Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Kokan Fried Crab Masala"
                                value={newDishName}
                                onChange={(e) => setNewDishName(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Category *</label>
                                <select
                                    value={newDishCategory}
                                    onChange={(e) => setNewDishCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                                >
                                    {categories.filter(c => c !== 'All').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Price (₹) *</label>
                                <input
                                    type="number"
                                    min="10"
                                    value={newDishPrice}
                                    onChange={(e) => setNewDishPrice(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Description</label>
                            <textarea
                                rows="2"
                                placeholder="Fresh crab tossed in roasted coconut and Malvani masala..."
                                value={newDishDesc}
                                onChange={(e) => setNewDishDesc(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newDishIsVeg}
                                    onChange={(e) => setNewDishIsVeg(e.target.checked)}
                                    className="rounded text-red-600"
                                />
                                <span>Pure Vegetarian</span>
                            </label>

                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs font-bold text-neutral-600">Stock:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={newDishStock}
                                    onChange={(e) => setNewDishStock(e.target.value)}
                                    className="w-20 px-2 py-1 rounded border border-neutral-300 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAddDishModal(false)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
                            >
                                Add Dish
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add Staff Modal */}
            {showAddStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={handleAddStaffSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-neutral-900">Add Staff Member / Chef</h3>
                                <p className="text-[11px] text-neutral-500">Managed directly by the Restaurant Manager</p>
                            </div>
                            <button type="button" onClick={() => setShowAddStaffModal(false)} className="text-neutral-400 hover:text-neutral-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Full Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Chef Anand or Mahesh"
                                value={newStaffName}
                                onChange={(e) => setNewStaffName(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Role *</label>
                            <select
                                value={newStaffRole}
                                onChange={(e) => setNewStaffRole(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-neutral-900"
                            >
                                <option value="kitchen">👨‍🍳 Kitchen / Head Chef</option>
                                <option value="waiter">🛎️ Waiter / Floor Staff</option>
                                <option value="cashier">💵 Cashier / POS Billing</option>
                                <option value="manager">👔 Restaurant Manager</option>
                                <option value="admin">🛡️ Restaurant Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Shift</label>
                            <select
                                value={newStaffShift}
                                onChange={(e) => setNewStaffShift(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-semibold focus:outline-none focus:border-neutral-900"
                            >
                                <option value="Full Day">Full Day (All Day Service)</option>
                                <option value="Morning Shift">Morning Shift (10:00 AM - 4:00 PM)</option>
                                <option value="Evening Shift">Evening Shift (4:00 PM - 11:30 PM)</option>
                                <option value="Night Prep Shift">Night Prep Shift</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="staff@kokankinara.com"
                                value={newStaffEmail}
                                onChange={(e) => setNewStaffEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Phone</label>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={newStaffPhone}
                                onChange={(e) => setNewStaffPhone(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-neutral-900"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowAddStaffModal(false)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-xs"
                            >
                                Add to Staff Roster
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reject Reservation Modal */}
            {rejectModalRes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={handleRejectReservation} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
                        <h3 className="font-bold text-sm text-neutral-900">Reject Table Reservation (#{rejectModalRes.id})</h3>
                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Reason for Rejection *</label>
                            <textarea
                                rows="3"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setRejectModalRes(null)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Assign Table & Confirm Modal */}
            {assignTableModalRes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={handleAssignTableSubmit} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
                        <h3 className="font-bold text-sm text-neutral-900">
                            Confirm & Assign Seating Table (#{assignTableModalRes.id})
                        </h3>
                        <p className="text-xs text-neutral-500">
                            Party of {assignTableModalRes.guests} guests requesting {assignTableModalRes.seatingPreference}.
                        </p>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Assign Table</label>
                            <select
                                value={targetAssignTableId}
                                onChange={(e) => setTargetAssignTableId(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-semibold"
                            >
                                {tables.map(t => (
                                    <option key={t.id} value={t.id}>
                                        Table #{t.tableNumber} ({t.status} - {t.capacity} seats)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setAssignTableModalRes(null)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Cancel Order Modal */}
            {cancelModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form onSubmit={handleCancelOrderSubmit} className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
                        <h3 className="font-bold text-sm text-neutral-900">Cancel Order #{cancelModalOrder.id}</h3>
                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Reason for Order Cancellation *</label>
                            <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setCancelModalOrder(null)}
                                className="px-3.5 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Keep Order
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table QR Code Modal */}
            {selectedTableForQR && (
                <QRCodeModal
                    table={selectedTableForQR}
                    onClose={() => setSelectedTableForQR(null)}
                />
            )}

            {/* Seat & Launch Dining Session Modal */}
            {seatModalTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-2xs p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            startDiningSession({
                                tableId: seatModalTable.id,
                                guestCount: parseInt(seatGuestCount, 10),
                                customerName: seatCustomerName.trim() || `Table ${seatModalTable.tableNumber} Guest`,
                                openedBy: 'Manager'
                            });
                            setSeatModalTable(null);
                            setSeatCustomerName('');
                            setSeatGuestCount(2);
                            setActiveTab('sessions');
                        }}
                        className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-neutral-200"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                            <div>
                                <h3 className="font-extrabold text-base text-neutral-900">Seat Guests: Table #{seatModalTable.tableNumber}</h3>
                                <p className="text-xs text-neutral-500">Capacity: {seatModalTable.capacity} guests • {seatModalTable.section || 'Hall'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSeatModalTable(null)}
                                className="text-neutral-400 hover:text-neutral-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Diner / Group Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Deshmukh Family"
                                value={seatCustomerName}
                                onChange={(e) => setSeatCustomerName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Guest Count</label>
                            <input
                                type="number"
                                min="1"
                                max={seatModalTable.capacity * 2}
                                value={seatGuestCount}
                                onChange={(e) => setSeatGuestCount(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm font-mono font-bold"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setSeatModalTable(null)}
                                className="flex-1 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-xs"
                            >
                                Activate Session
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Receipt Modal */}
            {viewingReceiptOrder && (
                <ReceiptModal
                    order={viewingReceiptOrder}
                    onClose={() => setViewingReceiptOrder(null)}
                />
            )}
        </div>
    );
}
