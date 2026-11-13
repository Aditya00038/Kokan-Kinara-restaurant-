import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  Search
} from 'lucide-react';

export default function Navbar({ onOpenCart, onOpenAuth, onGoToLanding }) {
  const { cart, searchQuery, setSearchQuery } = useRestaurant();
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isCustomer = !currentUser || currentUser.role === 'customer';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Wordmark (Zomato style) */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none shrink-0" 
          onClick={onGoToLanding}
          title="Return to Home Landing Page"
        >
          <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 font-heading">
            kokan kinara
          </span>
        </div>

        {/* Center: Search Pill (For Customer View) */}
        {isCustomer ? (
          <div className="flex-1 max-w-xl mx-2 sm:mx-6 hidden md:flex items-center bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-sm focus-within:shadow-md focus-within:border-slate-300 transition-all h-12 px-4 gap-2.5">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search for cuisine or a dish"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none border-none truncate"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right Actions: Cart & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Cart Trigger - Customer Only */}
          {isCustomer && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 border border-amber-300 hover:bg-amber-500/20 rounded-xl text-amber-800 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              <ShoppingBag size={17} />
              <span className="hidden sm:inline font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="bg-amber-500 text-white font-mono font-bold text-[11px] px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl hover:bg-slate-50 border border-transparent sm:border-slate-200 transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'A'
                  )}
                </div>
                <span className="hidden md:inline text-sm font-semibold text-slate-800 truncate max-w-[120px]">
                  {currentUser.displayName || 'Aditya'}
                </span>
                <ChevronDown size={14} className="text-slate-400 hidden sm:inline" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-60 p-3 z-50 shadow-xl bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 animate-in fade-in">
                  <div className="p-2 border-b border-slate-100 mb-2">
                    <div className="font-bold text-slate-900">{currentUser.displayName || 'Aditya'}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700">
                        {currentUser.roleLabel || 'Diner'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold px-4 py-2 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
