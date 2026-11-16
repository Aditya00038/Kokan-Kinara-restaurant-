import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Truck,
    UtensilsCrossed,
    Users,
    Calendar,
    Award,
    Flame,
    Clock,
    AlertCircle,
    PackageCheck,
    CheckCircle2,
    PieChart,
    BarChart3,
    ArrowUpRight,
    Sparkles,
    ShieldCheck,
    Trash2,
    RotateCcw
} from 'lucide-react';

export default function AdminAnalytics() {
    const {
        orders,
        menu,
        tables,
        reservations,
        staff,
        clearAllOrders
    } = useRestaurant();

    // Active Analytics Tab: 'sales' | 'food' | 'customer' | 'restaurant' | 'inventory' | 'staff'
    const [activeTab, setActiveTab] = useState('sales');
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // -------------------------------------------------------------
    // REAL METRICS COMPUTATIONS (Calculated directly from real context data)
    // -------------------------------------------------------------

    // 1. Sales & Revenue Calculations
    const salesMetrics = useMemo(() => {
        let totalRevenue = 0;
        let onlineDeliveryRev = 0;
        let onlineTakeawayRev = 0;
        let dineInRev = 0;

        let onlineDeliveryCount = 0;
        let onlineTakeawayCount = 0;
        let dineInCount = 0;

        orders.forEach(order => {
            const amount = Number(order.totalAmount || order.total || order.subtotal || 0);
            totalRevenue += amount;

            const source = (order.orderSource || '').toUpperCase();
            const type = (order.orderType || '').toLowerCase();

            const isDelivery = source === 'ONLINE_DELIVERY' || type === 'delivery';
            const isTakeaway = source === 'ONLINE_TAKEAWAY' || type === 'takeaway';
            const isDineIn = source === 'STAFF_DINE_IN' || source === 'OFFLINE_DINE_IN_QR' || type === 'dine-in' || type === 'dine_in';

            if (isDelivery) {
                onlineDeliveryRev += amount;
                onlineDeliveryCount += 1;
            } else if (isTakeaway) {
                onlineTakeawayRev += amount;
                onlineTakeawayCount += 1;
            } else if (isDineIn) {
                dineInRev += amount;
                dineInCount += 1;
            } else {
                if (order.tableId || order.tableNumber) {
                    dineInRev += amount;
                    dineInCount += 1;
                } else {
                    onlineDeliveryRev += amount;
                    onlineDeliveryCount += 1;
                }
            }
        });

        const onlineRevenue = onlineDeliveryRev + onlineTakeawayRev;
        const offlineRevenue = dineInRev;
        const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

        return {
            totalRevenue: Math.round(totalRevenue),
            onlineRevenue: Math.round(onlineRevenue),
            offlineRevenue: Math.round(offlineRevenue),
            onlineDeliveryRev: Math.round(onlineDeliveryRev),
            onlineTakeawayRev: Math.round(onlineTakeawayRev),
            dineInRev: Math.round(dineInRev),
            onlineDeliveryCount,
            onlineTakeawayCount,
            dineInCount,
            averageOrderValue,
            totalOrders: orders.length
        };
    }, [orders]);

    // 2. Food & Menu Item Performance (From Actual Orders Only)
    const foodMetrics = useMemo(() => {
        const dishSalesMap = {};

        // Tally strictly from real orders
        orders.forEach(order => {
            order.items?.forEach(orderItem => {
                const dishKey = orderItem.name;
                if (!dishSalesMap[dishKey]) {
                    dishSalesMap[dishKey] = {
                        id: orderItem.id || orderItem.cartItemId || dishKey,
                        name: orderItem.name,
                        category: orderItem.category || 'Mains',
                        price: Number(orderItem.price) || 0,
                        isVeg: orderItem.isVeg,
                        quantitySold: 0,
                        revenueGenerated: 0
                    };
                }
                const qty = Number(orderItem.quantity) || 1;
                const unitPrice = Number(orderItem.price) || 0;
                dishSalesMap[dishKey].quantitySold += qty;
                dishSalesMap[dishKey].revenueGenerated += qty * unitPrice;
            });
        });

        const dishList = Object.values(dishSalesMap).filter(d => d.quantitySold > 0);
        const topSellingDishes = [...dishList].sort((a, b) => b.quantitySold - a.quantitySold);
        const leastSellingDishes = [...dishList].sort((a, b) => a.quantitySold - b.quantitySold);

        // Category breakdown from real sales
        const categoryMap = {};
        dishList.forEach(dish => {
            if (!categoryMap[dish.category]) {
                categoryMap[dish.category] = { category: dish.category, quantity: 0, revenue: 0 };
            }
            categoryMap[dish.category].quantity += dish.quantitySold;
            categoryMap[dish.category].revenue += dish.revenueGenerated;
        });

        const categoryStats = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

        return {
            topSellingDishes,
            leastSellingDishes,
            categoryStats,
            totalDishesSold: dishList.reduce((s, d) => s + d.quantitySold, 0)
        };
    }, [orders]);

    // 3. Customer Analytics (Real customer order history)
    const customerMetrics = useMemo(() => {
        const customerMap = {};

        orders.forEach(order => {
            const phone = order.customerPhone || order.customer?.phone || (order.customerName ? `name-${order.customerName}` : null);
            if (phone) {
                const name = order.customerName || order.customer?.name || 'Customer';
                if (!customerMap[phone]) {
                    customerMap[phone] = { 
                        name, 
                        phone: phone.startsWith('name-') ? 'N/A' : phone,
                        orderCount: 0, 
                        totalSpend: 0,
                        lastOrderDate: order.createdAt || new Date().toISOString()
                    };
                }
                customerMap[phone].orderCount += 1;
                customerMap[phone].totalSpend += Number(order.totalAmount || order.total || order.subtotal || 0);
                if (order.createdAt && new Date(order.createdAt) > new Date(customerMap[phone].lastOrderDate)) {
                    customerMap[phone].lastOrderDate = order.createdAt;
                }
            }
        });

        const customerList = Object.values(customerMap);
        const totalTrackedCustomers = customerList.length;
        const repeatCustomers = customerList.filter(c => c.orderCount > 1).length;
        const newCustomers = totalTrackedCustomers - repeatCustomers;
        const repeatRate = totalTrackedCustomers > 0 ? Math.round((repeatCustomers / totalTrackedCustomers) * 100) : 0;

        return {
            totalTrackedCustomers,
            repeatCustomers,
            newCustomers,
            repeatRate,
            customerList: customerList.sort((a, b) => b.totalSpend - a.totalSpend)
        };
    }, [orders]);

    // 4. Restaurant Operations Analytics (Real tables & reservations)
    const restaurantMetrics = useMemo(() => {
        const occupiedCount = tables.filter(t => t.status === 'occupied').length;
        const reservedCount = tables.filter(t => t.status === 'reserved').length;
        const availableCount = tables.filter(t => t.status === 'available').length;
        const tableUtilizationRate = tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0;

        const totalGuestsReserved = reservations.reduce((s, r) => s + (Number(r.guestCount || r.guests) || 0), 0);
        const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN').length;
        const pendingReservations = reservations.filter(r => r.status === 'PENDING').length;

        return {
            tableUtilizationRate,
            occupiedCount,
            reservedCount,
            availableCount,
            totalTables: tables.length,
            totalReservations: reservations.length,
            confirmedReservations,
            pendingReservations,
            totalGuestsReserved
        };
    }, [tables, reservations]);

    // 5. Stock & Inventory Analytics (Real live portion stock from catalog)
    const inventoryMetrics = useMemo(() => {
        const lowStock = menu.filter(m => m.stockCount <= 3);
        const outOfStock = menu.filter(m => !m.inStock || m.stockCount === 0);
        const totalPortions = menu.reduce((s, m) => s + (Number(m.stockCount) || 0), 0);

        return {
            lowStock,
            outOfStock,
            totalPortions,
            totalItems: menu.length
        };
    }, [menu]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-neutral-800 font-sans">
            {/* Header Banner */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                        <BarChart3 size={26} strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                Live Business Intelligence (Real Data)
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                            Admin Analytics & Insights
                        </h1>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                            Real financial performance, sales channels, dish velocity & restaurant operations
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-neutral-100 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Authorized Executive View</span>
                    </div>

                    {orders.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="Reset order records to clean real state"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Orders</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Clear Orders Confirmation Dialog */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-neutral-200">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-neutral-900">Reset Order History?</h3>
                                <p className="text-xs text-neutral-500">This clears recorded orders to a clean 0-order state.</p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setShowClearConfirm(false)}
                                className="px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    clearAllOrders();
                                    setShowClearConfirm(false);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                            >
                                Confirm Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-200 mb-6 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                {[
                    { id: 'sales', label: 'Sales & Channel Revenue', icon: DollarSign },
                    { id: 'food', label: 'Food & Category Intelligence', icon: Flame },
                    { id: 'customer', label: 'Customer Retention', icon: Users },
                    { id: 'restaurant', label: 'Restaurant & Tables', icon: UtensilsCrossed },
                    { id: 'inventory', label: 'Stock Health', icon: PackageCheck },
                    { id: 'staff', label: `Staff & Chefs (${staff?.length || 0})`, icon: ShieldCheck }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                                isActive
                                    ? 'border-neutral-900 text-neutral-900'
                                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ============================================================ */}
            {/* TAB 1: SALES & CHANNEL REVENUE BREAKDOWN                     */}
            {/* ============================================================ */}
            {activeTab === 'sales' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Total Recorded Sales</span>
                            <div className="text-3xl font-black text-neutral-900 font-mono">₹{salesMetrics.totalRevenue}</div>
                            <span className="text-xs text-neutral-500 block">Across {salesMetrics.totalOrders} total orders</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Online Revenue</span>
                            <div className="text-3xl font-black text-red-700 font-mono">₹{salesMetrics.onlineRevenue}</div>
                            <span className="text-xs text-neutral-500 block">
                                {salesMetrics.totalRevenue > 0 ? Math.round((salesMetrics.onlineRevenue / salesMetrics.totalRevenue) * 100) : 0}% of all revenue
                            </span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Dine-In Revenue</span>
                            <div className="text-3xl font-black text-purple-700 font-mono">₹{salesMetrics.offlineRevenue}</div>
                            <span className="text-xs text-neutral-500 block">
                                {salesMetrics.totalRevenue > 0 ? Math.round((salesMetrics.offlineRevenue / salesMetrics.totalRevenue) * 100) : 0}% in-house dining
                            </span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Average Order Value (AOV)</span>
                            <div className="text-3xl font-black text-emerald-700 font-mono">₹{salesMetrics.averageOrderValue}</div>
                            <span className="text-xs text-neutral-500 block">Average spend per ticket</span>
                        </div>
                    </div>

                    {/* Channel Breakdown Comparison */}
                    <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-5">
                        <div>
                            <h3 className="font-extrabold text-base text-neutral-900">Revenue by Fulfillment Channel</h3>
                            <p className="text-xs text-neutral-500">Live split between Doorstep Delivery, Counter Takeaway, and Dine-In Dining.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Online Delivery Channel */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="flex items-center gap-1.5 text-red-700">
                                        <Truck className="w-4 h-4" /> Online Doorstep Delivery
                                    </span>
                                    <span className="font-mono text-neutral-900">
                                        ₹{salesMetrics.onlineDeliveryRev} ({salesMetrics.onlineDeliveryCount} orders)
                                    </span>
                                </div>
                                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-600 rounded-full transition-all duration-500"
                                        style={{ width: `${salesMetrics.totalRevenue > 0 ? (salesMetrics.onlineDeliveryRev / salesMetrics.totalRevenue) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Online Takeaway Channel */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="flex items-center gap-1.5 text-amber-700">
                                        <ShoppingBag className="w-4 h-4" /> Self Takeaway Counter
                                    </span>
                                    <span className="font-mono text-neutral-900">
                                        ₹{salesMetrics.onlineTakeawayRev} ({salesMetrics.onlineTakeawayCount} orders)
                                    </span>
                                </div>
                                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${salesMetrics.totalRevenue > 0 ? (salesMetrics.onlineTakeawayRev / salesMetrics.totalRevenue) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Dine-In Channel */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="flex items-center gap-1.5 text-purple-700">
                                        <UtensilsCrossed className="w-4 h-4" /> In-House Dine-In (Tables)
                                    </span>
                                    <span className="font-mono text-neutral-900">
                                        ₹{salesMetrics.dineInRev} ({salesMetrics.dineInCount} orders)
                                    </span>
                                </div>
                                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                        style={{ width: `${salesMetrics.totalRevenue > 0 ? (salesMetrics.dineInRev / salesMetrics.totalRevenue) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {salesMetrics.totalOrders === 0 && (
                            <div className="text-center py-6 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                                <p className="text-xs text-neutral-500">
                                    No orders recorded yet. Placing a delivery, takeaway, or in-house order will update channel metrics live.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: FOOD & CATEGORY INTELLIGENCE                         */}
            {/* ============================================================ */}
            {activeTab === 'food' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Selling Dishes */}
                        <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                <div>
                                    <h3 className="font-extrabold text-base text-neutral-900 flex items-center gap-2">
                                        <Flame className="w-4 h-4 text-red-600" /> Top Selling Dishes by Volume
                                    </h3>
                                    <p className="text-xs text-neutral-500">Highest order quantities recorded</p>
                                </div>
                                {foodMetrics.totalDishesSold > 0 && (
                                    <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                                        {foodMetrics.totalDishesSold} total dishes sold
                                    </span>
                                )}
                            </div>

                            {foodMetrics.topSellingDishes.length === 0 ? (
                                <div className="text-center py-12 text-neutral-400 text-xs">
                                    <UtensilsCrossed className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                                    No dish sales recorded yet. Dishes will rank here as customer orders are placed.
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100 space-y-2">
                                    {foodMetrics.topSellingDishes.slice(0, 8).map((dish, idx) => (
                                        <div key={dish.id} className="pt-2 flex items-center justify-between text-xs sm:text-sm">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-6 h-6 rounded-full bg-neutral-100 font-bold text-xs flex items-center justify-center text-neutral-700">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <h4 className="font-bold text-neutral-900">{dish.name}</h4>
                                                    <p className="text-[11px] text-neutral-400">{dish.category} • ₹{dish.price}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="font-mono font-bold text-neutral-900">{dish.quantitySold} sold</span>
                                                <span className="text-[11px] text-neutral-500 block font-mono">₹{dish.revenueGenerated}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category Revenue Breakdown */}
                        <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                                <div>
                                    <h3 className="font-extrabold text-base text-neutral-900 flex items-center gap-2">
                                        <PieChart className="w-4 h-4 text-amber-500" /> Category Performance
                                    </h3>
                                    <p className="text-xs text-neutral-500">Revenue split across food groups</p>
                                </div>
                            </div>

                            {foodMetrics.categoryStats.length === 0 ? (
                                <div className="text-center py-12 text-neutral-400 text-xs">
                                    <PieChart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                                    No category revenue recorded yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {foodMetrics.categoryStats.map(cat => (
                                        <div key={cat.category} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                                            <div>
                                                <span className="font-bold text-neutral-900 block text-sm">{cat.category}</span>
                                                <span className="text-neutral-500 text-[11px]">{cat.quantity} portions ordered</span>
                                            </div>
                                            <span className="font-mono font-bold text-neutral-900 text-sm">
                                                ₹{cat.revenue}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: CUSTOMER RETENTION & METRICS                         */}
            {/* ============================================================ */}
            {activeTab === 'customer' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Tracked Customers</span>
                            <div className="text-3xl font-black text-neutral-900 mt-1">{customerMetrics.totalTrackedCustomers}</div>
                            <span className="text-xs text-neutral-500 mt-0.5 block">Unique diners with order history</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Repeat Diners</span>
                            <div className="text-3xl font-black text-emerald-700 mt-1">{customerMetrics.repeatCustomers}</div>
                            <span className="text-xs text-neutral-500 mt-0.5 block">{customerMetrics.repeatRate}% customer retention rate</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">New Diners</span>
                            <div className="text-3xl font-black text-blue-700 mt-1">{customerMetrics.newCustomers}</div>
                            <span className="text-xs text-neutral-500 mt-0.5 block">First-time customers</span>
                        </div>
                    </div>

                    {/* Customer Roster Table */}
                    <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                        <h3 className="font-extrabold text-base text-neutral-900">Recorded Customer Order Profiles</h3>
                        {customerMetrics.customerList.length === 0 ? (
                            <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                                <Users className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                <h4 className="font-bold text-neutral-700 text-sm">No Customer Records Yet</h4>
                                <p className="text-neutral-500 text-xs mt-1">Customer profiles and retention rates will be recorded from real order receipts.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {customerMetrics.customerList.map((cust, idx) => (
                                    <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                                        <div>
                                            <h4 className="font-bold text-neutral-900">{cust.name}</h4>
                                            <p className="text-[11px] text-neutral-400 font-mono">{cust.phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-neutral-900 block">{cust.orderCount} orders</span>
                                            <span className="text-[11px] text-emerald-600 font-mono font-semibold">Total ₹{cust.totalSpend}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: RESTAURANT OPERATIONS & TABLES                       */}
            {/* ============================================================ */}
            {activeTab === 'restaurant' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Table Utilization</span>
                            <div className="text-3xl font-black text-neutral-900 mt-1">{restaurantMetrics.tableUtilizationRate}%</div>
                            <span className="text-xs text-neutral-500 mt-0.5 block">{restaurantMetrics.occupiedCount} of {restaurantMetrics.totalTables} tables occupied</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Confirmed Reservations</span>
                            <div className="text-3xl font-black text-amber-700 mt-1">{restaurantMetrics.confirmedReservations}</div>
                            <span className="text-xs text-neutral-500 mt-0.5 block">{restaurantMetrics.totalGuestsReserved} total booked guests</span>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
                            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Available Tables</span>
                            <div className="text-3xl font-black text-purple-700 mt-1">{restaurantMetrics.availableCount}</div>
                            <span className="text-xs text-neutral-500 mt-0.5 block">Ready for seating</span>
                        </div>
                    </div>

                    {/* Table Status Grid */}
                    <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                        <h3 className="font-extrabold text-base text-neutral-900">Current Dining Room Layout</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {tables.map(t => (
                                <div key={t.id} className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col justify-between space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-sm text-neutral-900">Table {t.number}</span>
                                        <span className={`w-2 h-2 rounded-full ${
                                            t.status === 'available' ? 'bg-emerald-500' : t.status === 'occupied' ? 'bg-purple-600' : 'bg-amber-500'
                                        }`} />
                                    </div>
                                    <div className="text-[11px] text-neutral-500">
                                        <p>{t.section} • {t.capacity} seats</p>
                                        <p className="font-semibold capitalize text-neutral-700 mt-0.5">{t.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 5: STOCK HEALTH & INVENTORY                             */}
            {/* ============================================================ */}
            {activeTab === 'inventory' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                        <h3 className="font-extrabold text-base text-neutral-900">Inventory Health Summary</h3>
                        <p className="text-xs text-neutral-500">Live portion counts across all menu items.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800 mb-2">
                                    Low Stock Alerts ({inventoryMetrics.lowStock.length})
                                </h4>
                                {inventoryMetrics.lowStock.length === 0 ? (
                                    <p className="text-xs text-rose-600">All portions currently stocked above warning threshold.</p>
                                ) : (
                                    <div className="space-y-1.5 text-xs text-rose-900">
                                        {inventoryMetrics.lowStock.map(item => (
                                            <div key={item.id} className="flex justify-between">
                                                <span>{item.name}</span>
                                                <span className="font-bold">{item.stockCount} portions left</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-2">
                                    Catalog Stock Capacity
                                </h4>
                                <div className="text-2xl font-black text-neutral-900">{inventoryMetrics.totalPortions} portions</div>
                                <p className="text-xs text-neutral-500 mt-1">Available across {inventoryMetrics.totalItems} distinct recipes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 6: STAFF ROSTER & EFFICIENCY                            */}
            {/* ============================================================ */}
            {activeTab === 'staff' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                            <div>
                                <h3 className="font-extrabold text-base text-neutral-900">Authorized Restaurant Staff & Chefs Roster</h3>
                                <p className="text-xs text-neutral-500">Live operational team registered and managed by the Restaurant Manager.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Manager Roster ({staff?.length || 0})
                            </span>
                        </div>

                        {staff && staff.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                {staff.map(member => (
                                    <div key={member.id} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300 transition-all flex flex-col justify-between text-xs space-y-3 shadow-2xs">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-neutral-900 text-sm">{member.name}</h4>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
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
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                member.status === 'active' || member.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                                            }`}>
                                                {member.status || (member.isActive ? 'active' : 'inactive')}
                                            </span>
                                        </div>

                                        <div className="text-[11px] text-neutral-500 space-y-0.5 pt-2 border-t border-neutral-200/60">
                                            {member.phone && <p>📞 {member.phone}</p>}
                                            {member.email && <p>✉️ {member.email}</p>}
                                            {member.shift && <p className="text-neutral-400">⏱️ {member.shift}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 space-y-3">
                                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto text-xl">
                                    👨‍🍳
                                </div>
                                <div className="max-w-md mx-auto space-y-1">
                                    <h4 className="font-bold text-sm text-neutral-900">No Staff or Chefs Added Yet</h4>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Staff members and chefs are added directly by the Restaurant Manager. Once registered in the Manager Portal, they will appear here in real time.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
