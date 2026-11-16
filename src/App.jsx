import React, { useState, useEffect } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './components/Landing/LandingPage';
import AuthPage from './components/Auth/AuthPage';
import CustomerPortal from './components/Customer/CustomerPortal';
import DineInQRPortal from './components/Customer/DineInQRPortal';
import KitchenDisplay from './components/Kitchen/KitchenDisplay';
import WaiterDashboard from './components/Waiter/WaiterDashboard';
import SystemManager from './components/System/SystemManager';
import CashierPOS from './components/Cashier/CashierPOS';
import AdminAnalytics from './components/Admin/AdminAnalytics';
import PWABadge from './PWABadge.jsx';

function MainApp() {
  const { setCurrentView } = useRestaurant();
  const { currentUser, loading, loginAsDemoRole } = useAuth();

  // URL Path router supporting clean dedicated routes:
  // '/online', '/dine-in', '/kitchen', '/waiter', '/manager', '/cashier', '/admin', '/auth', '/'
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path && path !== '/') return path;
    }
    return '/';
  });

  const [targetRoleForAuth, setTargetRoleForAuth] = useState('customer');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with browser navigation (Back / Forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase() || '/';
      setCurrentPath(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      setCurrentPath(path.split('?')[0].toLowerCase() || '/');
    }
  };

  // If user signs in or changes, optionally navigate to role view if on auth
  useEffect(() => {
    if (!loading && currentUser) {
      if (currentPath === '/auth') {
        const rolePaths = {
          customer: '/online',
          waiter: '/waiter',
          kitchen: '/kitchen',
          manager: '/manager',
          cashier: '/cashier',
          admin: '/admin'
        };
        navigateTo(rolePaths[currentUser.role] || '/online');
      }
    }
  }, [currentUser, loading]);

  const handleOpenAuth = (role = 'customer') => {
    setTargetRoleForAuth(role);
    navigateTo('/auth');
  };

  const handleAuthSuccess = (user) => {
    const rolePaths = {
      customer: '/online',
      waiter: '/waiter',
      kitchen: '/kitchen',
      manager: '/manager',
      cashier: '/cashier',
      admin: '/admin'
    };
    navigateTo(rolePaths[user?.role] || '/online');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-red-600 selection:text-white">
      {/* 1. SEPARATE OFFLINE QR DINE-IN EXPERIENCE (/dine-in) */}
      {currentPath.startsWith('/dine-in') && (
        <DineInQRPortal
          onNavigateHome={() => navigateTo('/')}
        />
      )}

      {/* 2. AUTHENTICATION PAGE (/auth) */}
      {currentPath === '/auth' && (
        <AuthPage
          initialRole={targetRoleForAuth}
          onBackToHome={() => navigateTo('/')}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* 3. HOME LANDING PAGE (/ or /home) */}
      {(currentPath === '/' || currentPath === '/home') && (
        <LandingPage
          onGetStarted={() => navigateTo('/online')}
          onOpenDineIn={() => navigateTo('/dine-in')}
          onSelectRole={(role) => {
            loginAsDemoRole(role);
            const rolePaths = {
              customer: '/online',
              waiter: '/waiter',
              kitchen: '/kitchen',
              manager: '/manager',
              cashier: '/cashier',
              admin: '/admin'
            };
            navigateTo(rolePaths[role] || '/online');
          }}
        />
      )}

      {/* 4. WORKSPACE STATIONS & PAGES WITH NAVBAR */}
      {!currentPath.startsWith('/dine-in') && currentPath !== '/auth' && currentPath !== '/' && currentPath !== '/home' && (
        <>
          <Navbar
            currentPath={currentPath}
            onNavigate={navigateTo}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAuth={() => navigateTo('/auth')}
            onGoToLanding={() => navigateTo('/')}
          />

          <main className="flex-1 pb-10">
            {/* A. DEDICATED ONLINE ORDERING PAGE */}
            {currentPath === '/online' && (
              <CustomerPortal isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
            )}

            {/* B. STAFF STATIONS */}
            {currentPath === '/kitchen' && <KitchenDisplay />}
            {currentPath === '/waiter' && <WaiterDashboard />}
            {(currentPath === '/manager' || currentPath === '/system') && <SystemManager />}
            {currentPath === '/cashier' && <CashierPOS />}
            {currentPath === '/admin' && <AdminAnalytics />}
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
