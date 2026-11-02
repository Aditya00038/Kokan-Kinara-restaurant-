import React, { useState, useEffect } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './components/Landing/LandingPage';
import AuthPage from './components/Auth/AuthPage';
import CustomerPortal from './components/Customer/CustomerPortal';
import KitchenDisplay from './components/Kitchen/KitchenDisplay';
import CashierPOS from './components/Cashier/CashierPOS';
import SystemManager from './components/System/SystemManager';
import PWABadge from './PWABadge.jsx';

function MainApp() {
  const { setCurrentView } = useRestaurant();
  const { currentUser, loading } = useAuth();

  // Primary page mode: 'landing' | 'auth' | 'app'
  const [viewMode, setViewMode] = useState('landing');
  const [targetRoleForAuth, setTargetRoleForAuth] = useState('customer');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Strict route protection: user cannot be in 'app' without being logged in
  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        setViewMode('app');
        if (currentUser.defaultView) {
          setCurrentView(currentUser.defaultView);
        }
      } else {
        if (viewMode === 'app') {
          setViewMode('auth');
        }
      }
    }
  }, [currentUser, loading]);

  // When user clicks Get Started or a role card from landing page
  const handleOpenAuth = (role = 'customer') => {
    setTargetRoleForAuth(role);
    setViewMode('auth');
  };

  // When auth succeeds with a real registered user, go directly to their dedicated dashboard
  const handleAuthSuccess = (user) => {
    setViewMode('app');
    if (user && user.defaultView) {
      setCurrentView(user.defaultView);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
      
      {/* 1. Full Landing Page */}
      {viewMode === 'landing' && (
        <LandingPage
          onGetStarted={() => handleOpenAuth('customer')}
          onSelectRole={(role) => handleOpenAuth(role)}
        />
      )}

      {/* 2. Full Authentication Page (Requires Registration / Login) */}
      {viewMode === 'auth' && (
        <AuthPage
          initialRole={targetRoleForAuth}
          onBackToHome={() => setViewMode('landing')}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* 3. Main Restaurant Workstations (STRICTLY for Authenticated Registered Users) */}
      {viewMode === 'app' && currentUser && (
        <>
          {/* Top Dedicated Navigation Header */}
          <Navbar 
            onOpenCart={() => setIsCartOpen(true)} 
            onOpenAuth={() => setViewMode('auth')}
            onGoToLanding={() => setViewMode('landing')}
          />

          {/* Dedicated Department Workspace strictly matching user's role */}
          <main className="flex-1 pb-10">
            {currentUser.role === 'customer' && (
              <CustomerPortal isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
            )}
            {currentUser.role === 'kitchen' && <KitchenDisplay />}
            {currentUser.role === 'cashier' && <CashierPOS />}
            {currentUser.role === 'system' && <SystemManager />}
          </main>
        </>
      )}

      <PWABadge />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <MainApp />
      </RestaurantProvider>
    </AuthProvider>
  );
}
