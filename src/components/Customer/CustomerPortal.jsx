import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { 
  Search, 
  Star, 
  Plus, 
  Minus, 
  Leaf,
  UtensilsCrossed,
  Utensils,
  Bike,
  X,
  AlertTriangle, 
  Sparkles,
  XCircle
} from 'lucide-react';
import ReceiptModal from '../Common/ReceiptModal';

export default function CustomerPortal({ isCartOpen, setIsCartOpen }) {
  const { 
    menu, 
    tables, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    createOrder
  } = useRestaurant();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState('all'); // all, veg, non-veg

  // Order Placement Form state
  const [customerName, setCustomerName] = useState('Sushant Sawant');
  const [customerPhone, setCustomerPhone] = useState('+91 98201 45879');
  const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' | 'delivery'
  const [selectedTableId, setSelectedTableId] = useState('T1');
  const [deliveryAddress, setDeliveryAddress] = useState('Sea Breeze Apartments, Beach Road, Malvan');

  // Activity Diagram Validation Error / Alternatives Modal State
  const [validationModal, setValidationModal] = useState(null); // { errors, alternatives }

  // Receipt Modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState(null);

  const categories = [
    'All',
    'Thali Special',
    'Seafood',
    'Meat & Poultry',
    'Veg Mains',
    'Starters',
    'Biryani & Rice',
    'Bhakri & Breads',
    'Drinks & Desserts'
  ];

  // Helper to normalize category strings for resilient matching across versions
  const normalizeCategory = (cat) => {
    if (!cat) return '';
    const c = cat.toLowerCase();
    if (c.includes('thali') || c.includes('थाळी')) return 'thali';
    if (c.includes('seafood') || c.includes('सी-फूड') || c.includes('fish') || c.includes('prawns')) return 'seafood';
    if (c.includes('meat') || c.includes('poultry') || c.includes('chicken') || c.includes('mutton') || c.includes('मटन') || c.includes('चिकन')) return 'meat';
    if (c.includes('veg mains') || c.includes('व्हेज')) return 'veg';
    if (c.includes('starter') || c.includes('स्टार्टर्स') || c.includes('snack')) return 'starters';
    if (c.includes('biryani') || c.includes('rice') || c.includes('बिर्याणी') || c.includes('भात') || c.includes('राईस')) return 'biryani';
    if (c.includes('bhakri') || c.includes('roti') || c.includes('bread') || c.includes('भाकरी') || c.includes('रोटी') || c.includes('नान')) return 'breads';
    if (c.includes('drink') || c.includes('dessert') || c.includes('beverage') || c.includes('पेये') || c.includes('मिष्टान्न') || c.includes('डेझर्ट') || c.includes('सोलकडी')) return 'drinks';
    return c.replace(/[^a-z0-9]/g, '');
  };

  // Filter menu items
  const filteredMenu = menu.filter(item => {
    const matchesCategory = 
      selectedCategory === 'All' || 
      item.category === selectedCategory ||
      normalizeCategory(item.category) === normalizeCategory(selectedCategory);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      (item.name && item.name.toLowerCase().includes(q)) || 
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));

    const matchesDiet = 
      dietFilter === 'all' || 
      (dietFilter === 'veg' && item.dietary?.toLowerCase() === 'veg') ||
      (dietFilter === 'non-veg' && item.dietary?.toLowerCase().includes('non'));

    return matchesCategory && matchesSearch && matchesDiet;
  });

  const getCategoryCount = (cat) => {
    if (cat === 'All') return menu.length;
    return menu.filter(item => 
      item.category === cat || 
      normalizeCategory(item.category) === normalizeCategory(cat)
    ).length;
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = Number((cartSubtotal * 0.05).toFixed(2));
  const cartTotal = Number((cartSubtotal + cartTax).toFixed(2));

  // Handler for placing order
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const result = createOrder({
      customerName,
      customerPhone,
      orderType,
      tableId: selectedTableId,
      deliveryAddress,
      discountCode: null
    });

    if (!result.success) {
      setValidationModal(result.validation);
    } else {
      setIsCartOpen(false);
      setValidationModal(null);
      if (result.order) {
        setViewingReceiptOrder(result.order);
        setShowReceiptModal(true);
      }
    }
  };

  const handleAcceptAlternativeTable = (altTable) => {
    setSelectedTableId(altTable.id);
    setValidationModal(null);
  };

  const handleReplaceItemWithAlternative = (originalItem, suggestedDish) => {
    removeFromCart(originalItem.id);
    addToCart(suggestedDish, originalItem.quantity || 1);
    setValidationModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)] text-slate-800">
      
      {/* Menu Browsing & Filtering */}
      <div>
        {/* Controls: Search, Dietary toggle */}
        <div className="flex gap-3.5 mb-5 flex-wrap items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Surmai, Pomfret, Biryani, Bhakri, Solkadhi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all shadow-xs"
              />
            </div>

            {/* Diet toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setDietFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dietFilter === 'all' ? 'bg-white text-slate-900 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Diets
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('veg')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dietFilter === 'veg' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <Leaf size={13} className={dietFilter === 'veg' ? 'text-white' : 'text-emerald-600'} />
                <span>Pure Veg</span>
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('non-veg')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dietFilter === 'non-veg' ? 'bg-rose-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                <UtensilsCrossed size={13} className={dietFilter === 'non-veg' ? 'text-white' : 'text-rose-600'} />
                <span>Non-Veg</span>
              </button>
            </div>
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-slate-900 text-white shadow-sm border border-slate-900 font-extrabold' 
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white font-bold' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenu.map((item) => {
              const inCartItem = cart.find(c => c.id === item.id);
              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-3xl bg-white border flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${
                    !item.inStock ? 'border-rose-200 opacity-80' : 'border-slate-200/90 hover:border-amber-400'
                  }`}
                >
                  {/* Food Image with overlays */}
                  <div className="relative w-full h-44 overflow-hidden rounded-2xl mb-3 bg-slate-100">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    
                    {/* Dietary badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold text-white shadow-sm ${
                        item.dietary === 'Veg' ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}>
                        {item.dietary === 'Veg' ? 'VEG' : 'NON-VEG'}
                      </span>
                    </div>

                    {/* Stock status badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {item.inStock ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/95 text-emerald-800 border border-emerald-200 shadow-xs backdrop-blur-xs">
                          In Stock ({item.stockCount})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-600 text-white shadow-xs">
                          SOLD OUT
                        </span>
                      )}
                    </div>

                    {/* Rating badge */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded text-[11px] font-bold text-amber-700 border border-amber-200 shadow-xs backdrop-blur-xs">
                      <Star size={11} fill="#d97706" color="#d97706" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                        <span className="text-base font-black text-amber-600 font-mono">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div>
                      {/* Add to Cart Actions */}
                      {item.inStock ? (
                        inCartItem ? (
                          <div className="flex items-center justify-between bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                            <button 
                              onClick={() => updateCartQuantity(item.id, inCartItem.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                            >
                              <Minus size={13} strokeWidth={2.5} />
                            </button>
                            <span className="font-extrabold text-amber-900 text-xs font-mono">
                              {inCartItem.quantity} in Cart
                            </span>
                            <button 
                              onClick={() => updateCartQuantity(item.id, inCartItem.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                            >
                              <Plus size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item, 1)}
                            className="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer shadow-xs"
                          >
                            <Plus size={14} /> Add to Cart
                          </button>
                        )
                      ) : (
                        <div className="text-center py-2 bg-rose-50 rounded-xl text-rose-700 text-xs font-semibold border border-rose-200 font-mono">
                          Sold Out • Alternative Available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state when no items match filters */}
            {filteredMenu.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 my-4 shadow-xs">
                <UtensilsCrossed size={36} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No dishes match your filters</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Try choosing another category, switching to 'All Diets', or clearing your search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setDietFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>

      {/* ========================================================= */}
      {/* CHECKOUT DRAWER / MODAL: Place Order & Select Table */}
      {/* ========================================================= */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setIsCartOpen(false)}
        >
          <div 
            className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-6 sm:p-7 overflow-y-auto flex flex-col justify-between shadow-2xl text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Review & Place Order</h3>
                  <p className="text-xs text-slate-500">
                    Select dining table or delivery address
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Order Type Toggle: Dine-In vs Delivery */}
              <div className="mb-5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2 font-mono">
                  Dining Experience
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setOrderType('dine-in')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      orderType === 'dine-in' 
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Utensils size={14} className={orderType === 'dine-in' ? 'text-amber-700' : 'text-slate-500'} />
                    <span>Dine-In (Table)</span>
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      orderType === 'delivery' 
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Bike size={14} className={orderType === 'delivery' ? 'text-amber-700' : 'text-slate-500'} />
                    <span>Takeaway / Delivery</span>
                  </button>
                </div>
              </div>

              {/* Table Selector (If Dine-In) */}
              {orderType === 'dine-in' ? (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
                      Select Dining Table
                    </label>
                    <span className="text-[10px] text-amber-600 font-mono">
                      (Table 3 is Occupied to test alternatives)
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {tables.map(tbl => {
                      const isSel = selectedTableId === tbl.id;
                      const isAvail = tbl.status === 'available';
                      return (
                        <button
                          key={tbl.id}
                          onClick={() => setSelectedTableId(tbl.id)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSel 
                              ? 'border-amber-500 bg-amber-50 text-amber-900 font-extrabold shadow-xs' 
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="text-xs font-bold font-mono">
                            T{tbl.number}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {tbl.capacity} seats
                          </div>
                          <div className={`text-[9px] mt-0.5 font-bold uppercase font-mono ${
                            isAvail ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {tbl.status}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5 font-mono">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>
              )}

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1 font-mono">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1 font-mono">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Items in Cart breakdown */}
              <div className="mb-5 max-h-40 overflow-y-auto">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 font-mono">Cart Items ({cart.length})</div>
                <div className="space-y-1.5 divide-y divide-slate-100">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between pt-1 text-xs">
                      <span className="text-slate-700">{item.quantity}x {item.name}</span>
                      <span className="text-amber-700 font-mono font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div>
              <div className="bg-slate-50 p-4 rounded-2xl mb-3.5 text-xs space-y-1.5 border border-slate-200">
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-mono">
                  <span>Tax (5%)</span>
                  <span>₹{cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-2 mt-1">
                  <span>Grand Total</span>
                  <span className="text-amber-600 font-mono text-base font-black">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-extrabold shadow-md cursor-pointer"
              >
                Place Order (Trigger Validation)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTIVITY DIAGRAM NODE: Show error message (or suggest alternative) */}
      {/* ========================================================= */}
      {validationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-6 sm:p-7 border border-rose-200 bg-white rounded-3xl shadow-2xl text-slate-900">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Table or Item Unavailable
                </h3>
                <span className="badge badge-rose text-[9px]">
                  Activity Diagram: Validation Branch (No)
                </span>
              </div>
            </div>

            {/* Error Messages */}
            <div className="mb-4 space-y-2">
              {validationModal.errors.map((err, idx) => (
                <div 
                  key={idx} 
                  className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200"
                >
                  <XCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{err.message}</span>
                </div>
              ))}
            </div>

            {/* Suggested Alternatives */}
            {validationModal.alternatives.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                  <Sparkles size={13} /> System Suggested Alternatives:
                </div>

                <div className="space-y-2.5">
                  {validationModal.alternatives.map((alt, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-800"
                    >
                      {alt.type === 'table' && (
                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <div className="font-bold text-slate-900">
                              Switch to Table {alt.suggestedTable.number}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              {alt.reason}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAcceptAlternativeTable(alt.suggestedTable)}
                            className="btn-primary py-1.5 px-3 text-[11px] font-bold shrink-0 cursor-pointer"
                          >
                            Select Table {alt.suggestedTable.number}
                          </button>
                        </div>
                      )}

                      {alt.type === 'item' && (
                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <div className="font-bold text-slate-900">
                              Try {alt.suggestedDish.name}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              {alt.reason}
                            </div>
                          </div>
                          <button
                            onClick={() => handleReplaceItemWithAlternative(alt.originalItem, alt.suggestedDish)}
                            className="btn-primary py-1.5 px-3 text-[11px] font-bold shrink-0 cursor-pointer"
                          >
                            Replace Item
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setValidationModal(null)}
                className="btn-secondary text-xs px-4 py-2 font-semibold cursor-pointer"
              >
                Dismiss & Modify Cart
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Tax Receipt Modal */}
      {showReceiptModal && viewingReceiptOrder && (
        <ReceiptModal
          order={viewingReceiptOrder}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
}
