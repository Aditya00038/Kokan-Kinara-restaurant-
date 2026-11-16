import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  UtensilsCrossed, 
  Flame, 
  Trophy, 
  UserCheck,
  QrCode,
  CreditCard,
  ChefHat
} from 'lucide-react';

export default function Navbar({ currentPath = '/online', onNavigate, onOpenAuth, onGoToLanding }) {
  const { 
    customerSection, 
    setCustomerSection
  } = useRestaurant();
  const { currentUser, logout, loginAsDemoRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isCustomer = !currentUser || currentUser.role === 'customer';

  const handleNav = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Top Primary Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Wordmark (Zomato style) */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none shrink-0" 
          onClick={() => handleNav('/')}
          title="Kokan Kinara Home"
        >
          <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-slate-900 font-heading">
            kokan kinara
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-mono">
            Malvan Coastal
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => handleNav('/')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              currentPath === '/' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('/online')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              currentPath === '/online' ? 'bg-rose-600 text-white' : 'text-neutral-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            Online Ordering
          </button>
          <button
            onClick={() => handleNav('/dine-in')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentPath === '/dine-in' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Dine-In QR Menu (Accessible at table)"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Table Dine-In (QR)</span>
          </button>
        </nav>

        {/* Spacer */}
        <div className="flex-1 md:hidden" />

        {/* Right Actions: User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl hover:bg-slate-50 border border-transparent sm:border-slate-200 transition-all text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[110px] leading-tight">
                    {currentUser.displayName || 'User'}
                  </div>
                  <div className="text-[10px] font-bold text-rose-600 capitalize">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown size={13} className="text-slate-400 hidden sm:inline" />
              </button>

              {/* User Dropdown with 1-Click Role Switcher */}
              {showUserMenu && (
                <div className="absolute right-0 top-11 w-64 p-3 z-50 shadow-xl bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 animate-in fade-in">
                  <div className="p-2 border-b border-slate-100 mb-2">
                    <div className="font-bold text-slate-900">{currentUser.displayName || 'User'}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                        {currentUser.roleLabel || currentUser.role}
                      </span>
                    </div>
                  </div>

                  {/* Quick Role Switcher for Testing All Stations */}
                  <div className="mb-2 pb-2 border-b border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2 font-mono">
                      Switch Workspace / Station
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { r: 'customer', path: '/online', label: 'Online Customer', icon: UserCheck },
                        { r: 'waiter', path: '/waiter', label: 'Waitstaff Station', icon: UtensilsCrossed },
                        { r: 'kitchen', path: '/kitchen', label: 'Kitchen Display (KDS)', icon: Flame },
                        { r: 'manager', path: '/manager', label: 'Manager Operations', icon: ShieldCheck },
                        { r: 'cashier', path: '/cashier', label: 'Cashier POS & Billing', icon: CreditCard },
                        { r: 'admin', path: '/admin', label: 'Admin Analytics', icon: Trophy }
                      ].map(item => (
                        <button
                          key={item.r}
                          type="button"
                          onClick={() => {
                            loginAsDemoRole(item.r);
                            setShowUserMenu(false);
                            handleNav(item.path);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                            currentUser.role === item.r 
                              ? 'bg-rose-50 text-rose-700 font-bold' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 text-xs">
                            <item.icon size={13} />
                            <span>{item.label}</span>
                          </span>
                          {currentUser.role === item.r && (
                            <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded font-mono">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      if (onOpenAuth) onOpenAuth();
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold px-3.5 py-1.5 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-all shadow-2xs"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
