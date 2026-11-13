import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { 
  Crown,
  ChefHat,
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  RotateCcw,
  AlertCircle,
  Leaf,
  Layers,
  Activity,
  User,
  MessageSquare,
  PackageCheck
} from 'lucide-react';
import ReceiptModal from '../Common/ReceiptModal';

export default function SystemManager() {
  const { 
    tables, 
    toggleTableStatus, 
    menu, 
    toggleItemStock, 
    orders,
    createManagerOrder,
    processPayment,
    systemLogs, 
    resetToDemoState 
  } = useRestaurant();

  // Active Manager Tab
  const [activeTab, setActiveTab] = useState('take-order'); // 'take-order' | 'orders' | 'tables' | 'stock' | 'logs'

  // ==========================================
  // Manager Order Taking State
  // ==========================================
  const [selectedTableNumber, setSelectedTableNumber] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [orderInstructions, setOrderInstructions] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // [{ ...menuItem, quantity: 1, notes: '' }]

  // Menu filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');

  // Billing & Receipt State
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Categories list
  const categories = useMemo(() => {
    const cats = ['All'];
    menu.forEach(item => {
      if (item.category && !cats.includes(item.category)) {
        cats.push(item.category);
      }
    });
    return cats;
  }, [menu]);

  // Filtered menu items
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchDiet = dietaryFilter === 'all' || 
        (dietaryFilter === 'veg' && item.dietary === 'Veg') ||
        (dietaryFilter === 'non-veg' && item.dietary === 'Non-Veg');
      const matchSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchDiet && matchSearch;
    });
  }, [menu, selectedCategory, dietaryFilter, searchQuery]);

  // Selected table object
  const currentSelectedTable = tables.find(t => t.number === selectedTableNumber) || tables[0];

  // Add item to manager's current order builder
  const handleAddItem = (item) => {
    setOrderSuccessMsg('');
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, notes: '' }];
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId, change) => {
    setSelectedItems(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Update item-specific notes / customer instruction
  const handleItemNoteChange = (itemId, note) => {
    setSelectedItems(prev => prev.map(i => i.id === itemId ? { ...i, notes: note } : i));
  };

  // Remove item
  const handleRemoveItem = (itemId) => {
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Calculations for current order
  const orderSubtotal = selectedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const orderTax = Number((orderSubtotal * 0.05).toFixed(2));
  const orderTotal = Number((orderSubtotal + orderTax).toFixed(2));

  // Dispatch Order to Chef
  const handleSendToChef = () => {
    if (!selectedTableNumber) {
      alert('Please select a table number first.');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Please select at least one food item.');
      return;
    }

    const result = createManagerOrder({
      tableNumber: selectedTableNumber,
      tableId: currentSelectedTable?.id,
      items: selectedItems,
      customerName: guestName.trim() || `Table ${selectedTableNumber} Guest`,
      specialInstructions: orderInstructions.trim()
    });

    if (result.success) {
      setOrderSuccessMsg(`Order #${result.order.id} for Table #${selectedTableNumber} sent directly to Chef!`);
      // Reset order builder
      setSelectedItems([]);
      setOrderInstructions('');
      setGuestName('');
      setTimeout(() => setOrderSuccessMsg(''), 6000);
    }
  };

  // Handle bill settlement by Manager
  const handleSettleBill = (orderId, method) => {
    processPayment(orderId, method, true);
    const updated = orders.find(o => o.id === orderId);
    if (updated) {
      setViewingReceiptOrder({
        ...updated,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: method,
        receiptNumber: 'RCP-' + Math.floor(100000 + Math.random() * 900000)
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-slate-800 font-sans">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Crown size={26} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Manager Control Console
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Restaurant Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Take dine-in orders, dispatch to chef, oversee active tables, and manage billing
            </p>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDemoState}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors cursor-pointer"
            title="Reset to clean initial state"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto">
        {[
          { id: 'take-order', label: 'Take Dine-In Order', icon: UtensilsCrossed },
          { id: 'orders', label: `Active Orders & Billing (${orders.filter(o => o.status !== 'COMPLETED').length})`, icon: Clock },
          { id: 'tables', label: `Floor Tables (${tables.filter(t => t.status === 'occupied').length} Occupied)`, icon: Layers },
          { id: 'stock', label: 'Menu & Stock Inventory', icon: PackageCheck },
          { id: 'logs', label: 'Audit Logs', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive 
                  ? 'border-amber-500 text-amber-600 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Success Notification Alert */}
      {orderSuccessMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            View in Orders
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: TAKE DINE-IN ORDER (PRIMARY MANAGER WORKFLOW)     */}
      {/* ======================================================== */}
      {activeTab === 'take-order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 cols): Step 1 Table Selector + Step 2 Menu Browsing */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: Select Table Number */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Select Dining Table Number
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  Selected: <strong className="text-amber-600">Table #{selectedTableNumber}</strong> ({currentSelectedTable?.section})
                </span>
              </div>

              {/* Tables Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {tables.map(table => {
                  const isSelected = selectedTableNumber === table.number;
                  const isOccupied = table.status === 'occupied';
                  const isReserved = table.status === 'reserved';

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => setSelectedTableNumber(table.number)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900 font-mono">
                          Table #{table.number}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isOccupied 
                            ? 'bg-rose-100 text-rose-700' 
                            : isReserved 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {table.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {table.section} • {table.capacity} seats
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Select Food Items */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Select Food Items from Menu
                  </h2>
                </div>

                {/* Dietary Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setDietaryFilter('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      dietaryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietaryFilter('veg')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      dietaryFilter === 'veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-800'
                    }`}
                  >
                    <Leaf size={12} />
                    <span>Veg</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietaryFilter('non-veg')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      dietaryFilter === 'non-veg' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:text-rose-800'
                    }`}
                  >
                    <UtensilsCrossed size={12} />
                    <span>Non-Veg</span>
                  </button>
                </div>
              </div>

              {/* Search & Category Pills */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search dishes (e.g. Surmai Thali, Pomfret, Bhakri)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dishes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredMenu.map(dish => {
                  const orderedItem = selectedItems.find(i => i.id === dish.id);
                  const isVeg = dish.dietary === 'Veg';
                  const inStock = dish.inStock && dish.stockCount > 0;

                  return (
                    <div 
                      key={dish.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        orderedItem 
                          ? 'border-amber-400 bg-amber-50/30' 
                          : 'border-slate-200/90 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              isVeg ? 'border-emerald-600' : 'border-rose-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                              {dish.name}
                            </span>
                          </div>
                          <span className="font-bold text-xs font-mono text-slate-900 shrink-0">
                            ₹{dish.price}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                          {dish.description}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          inStock ? 'text-slate-500 bg-slate-100' : 'text-red-700 bg-red-50 font-bold'
                        }`}>
                          {inStock ? `Stock: ${dish.stockCount} left` : 'Out of stock'}
                        </span>

                        {orderedItem ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(dish.id, -1)}
                              className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center font-bold text-xs font-mono text-slate-900">
                              {orderedItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(dish.id, 1)}
                              className="w-6 h-6 rounded-md bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItem(dish)}
                            disabled={!inStock}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              inStock 
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Plus size={12} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Order Summary, Customer Instructions & Dispatch to Chef */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs uppercase font-bold text-amber-600 tracking-wider">
                    Dine-In Order Ticket
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Table #{selectedTableNumber}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">
                    {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Guest Name Input */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Customer / Guest Name (Optional)
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`e.g. Guest on Table ${selectedTableNumber}`}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Selected Items List with Notes */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Ordered Dishes & Item Instructions
                </label>

                {selectedItems.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No dishes selected yet. Pick items from the menu on the left!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="font-bold text-slate-900">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-slate-800">
                              ₹{item.price * item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Customer instruction input for this specific item */}
                        <div className="mt-1.5">
                          <input
                            type="text"
                            placeholder="Add item note (e.g. With Tandul Bhakri, less spicy)..."
                            value={item.notes}
                            onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                            className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-200 focus:border-amber-500 rounded-lg text-slate-800 placeholder-slate-400 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* General Order Instructions from Customer */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MessageSquare size={13} className="text-amber-600" />
                  <span>General Customer Instructions</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Serve starters first, customer has peanut allergy, extra water glasses..."
                  value={orderInstructions}
                  onChange={(e) => setOrderInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none resize-none"
                />
              </div>

              {/* Bill Summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">₹{orderSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax (5%):</span>
                  <span className="font-mono font-semibold">₹{orderTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1.5 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="font-mono text-amber-600">₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Send Order to Chef Button */}
              <button
                type="button"
                onClick={handleSendToChef}
                disabled={selectedItems.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  selectedItems.length > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ChefHat size={18} />
                <span>Send Order to Chef</span>
              </button>

            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACTIVE ORDERS & BILLING                           */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-900">
              Live Orders & Bill Settlement
            </h2>
            <span className="text-xs text-slate-500">
              {orders.length} total recorded orders
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {orders.map(order => {
              const isPaid = order.paymentStatus === 'PAID';
              const isReady = order.status === 'ORDER_READY';
              const isCooking = order.status === 'KITCHEN_PREPARING';

              return (
                <div 
                  key={order.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-900">
                            #{order.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isReady
                              ? 'bg-blue-100 text-blue-800'
                              : isCooking
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isPaid ? 'PAID' : isReady ? 'READY' : isCooking ? 'COOKING' : 'PLACED'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 font-semibold">
                          Table #{order.tableNumber || 'N/A'} • {order.customerName}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm font-mono text-slate-900">
                          ₹{order.total?.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {order.paymentMethod || 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Customer Instructions */}
                    {order.specialInstructions && (
                      <div className="mb-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900">
                        <strong className="block text-amber-800">Customer Instructions:</strong>
                        {order.specialInstructions}
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-1 mb-4 text-xs text-slate-700">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-mono text-slate-500">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Billing */}
                  <div className="pt-2 border-t border-slate-100">
                    {!isPaid ? (
                      <div className="space-y-2">
                        <div className="flex gap-1.5">
                          {['UPI', 'Card', 'Cash'].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setPaymentMethod(m)}
                              className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                paymentMethod === m
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSettleBill(order.id, paymentMethod)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 size={14} />
                          <span>Settle Bill & Release Table</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setViewingReceiptOrder(order)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Printer size={14} />
                        <span>View / Print Receipt</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: FLOOR TABLES                                      */}
      {/* ======================================================== */}
      {activeTab === 'tables' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Restaurant Dining Tables
              </h2>
              <p className="text-xs text-slate-500">
                Click a table to toggle between Available, Occupied, and Reserved
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tables.map(table => (
              <div 
                key={table.id}
                onClick={() => toggleTableStatus(table.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  table.status === 'occupied'
                    ? 'border-rose-300 bg-rose-50/60'
                    : table.status === 'reserved'
                    ? 'border-purple-300 bg-purple-50/60'
                    : 'border-emerald-300 bg-emerald-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 font-mono text-base">
                    Table #{table.number}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    table.status === 'occupied'
                      ? 'bg-rose-200 text-rose-800'
                      : table.status === 'reserved'
                      ? 'bg-purple-200 text-purple-800'
                      : 'bg-emerald-200 text-emerald-800'
                  }`}>
                    {table.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  {table.section}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Capacity: {table.capacity} diners
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MENU & STOCK INVENTORY                            */}
      {/* ======================================================== */}
      {activeTab === 'stock' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Menu & Real-Time Stock Inventory
              </h2>
              <p className="text-xs text-slate-500">
                Toggle stock availability to test chef inventory updates
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {menu.map(dish => (
              <div 
                key={dish.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    {dish.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {dish.category} • ₹{dish.price}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600 mt-0.5">
                    Remaining: <strong className={dish.stockCount <= 3 ? 'text-red-600' : 'text-slate-800'}>{dish.stockCount} portions</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleItemStock(dish.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dish.inStock 
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {dish.inStock ? 'In Stock' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: AUDIT LOGS                                        */}
      {/* ======================================================== */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-3">
            Live Restaurant Event Stream
          </h2>
          <div className="space-y-2">
            {systemLogs.map(log => (
              <div 
                key={log.id} 
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-slate-900 mr-2">[{log.sender}]</span>
                  <span className="text-slate-700">{log.message}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
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
