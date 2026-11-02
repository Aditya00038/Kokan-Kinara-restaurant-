import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  ChefHat, 
  CreditCard, 
  Crown, 
  ShoppingBag, 
  LogOut,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ onOpenCart, onOpenAuth, onGoToLanding }) {
  const { 
    cart, 
    orders 
  } = useRestaurant();

  const { currentUser, logout } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const kitchenPending = orders.filter(o => o.status === 'PLACED' || o.status === 'KITCHEN_PREPARING').length;
  const cashierPending = orders.filter(o => o.status === 'ORDER_READY' && o.paymentStatus !== 'PAID').length;

  const getWorkspaceDetails = () => {
    switch (currentUser?.role) {
      case 'kitchen':
        return {
          label: 'Kitchen Station',
          badgeText: `${kitchenPending} pending`,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotColor: 'bg-rose-500',
          icon: ChefHat
        };
      case 'cashier':
        return {
          label: 'Cashier POS',
          badgeText: `${cashierPending} to settle`,
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dotColor: 'bg-blue-500',
          icon: CreditCard
        };
      case 'system':
        return {
          label: 'Admin Console',
          badgeText: 'System Active',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotColor: 'bg-purple-500',
          icon: Crown
        };
      default:
        return {
          label: 'Online Menu',
          badgeText: 'Order Online',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500',
          icon: UtensilsCrossed
        };
    }
  };

  const ws = getWorkspaceDetails();
  const WsIcon = ws.icon;

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 glass-nav shadow-xs bg-white/95 border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        
        {/* Left: Brand & Home Landing Link */}
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={onGoToLanding}
            title="Return to Home Landing Page"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <UtensilsCrossed size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                KOKAN KINARA
              </span>
              <p className="text-[10px] text-slate-500 m-0 font-mono">
                Authentic Malvani Cuisine
              </p>
            </div>
          </div>
        </div>

        {/* Center: Workspace Indicator (Staff terminal roles only) */}
        {currentUser && currentUser.role !== 'customer' && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${ws.dotColor} animate-pulse`} />
            <WsIcon size={16} className="text-amber-500" />
            <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide">
              {ws.label}
            </span>
            {ws.badgeText && (
              <span className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${ws.badgeClass}`}>
                {ws.badgeText}
              </span>
            )}
          </div>
        )}

        {/* Right Actions: Cart (for customer), User Profile, Notifications */}
        <div className="flex items-center gap-2.5">
          
          {/* Cart Trigger - only shown for Customers */}
          {(!currentUser || currentUser.role === 'customer') && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 border border-amber-400 hover:bg-amber-500/20 rounded-xl text-amber-800 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline font-black">Cart</span>
              {cartCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-mono font-black text-[11px] px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-left cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'kitchen' 
                    ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                    : currentUser.role === 'cashier' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : currentUser.role === 'system' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                }`}>
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono leading-none">
                    {currentUser.roleLabel}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 p-3 z-50 shadow-xl bg-white border border-slate-200 rounded-2xl text-xs text-slate-900">
                  <div className="p-2 border-b border-slate-100 mb-2">
                    <div className="font-bold text-slate-900">{currentUser.displayName}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-mono font-bold text-emerald-700">
                        Registered & Verified
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
              className="btn-primary text-xs py-2 px-4 shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
