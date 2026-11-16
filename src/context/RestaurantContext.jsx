import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  INITIAL_MENU, 
  INITIAL_TABLES, 
  INITIAL_ORDERS, 
  PROMO_CODES,
  DEFAULT_TODAYS_SPECIAL_IDS,
  DEFAULT_WEEKLY_BEST_IDS,
  DEFAULT_MONTHLY_BEST_IDS,
  INITIAL_RESERVATIONS,
  INITIAL_STAFF,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_DINING_SESSIONS,
  DINING_SESSION_STATUSES,
  ORDER_SOURCES,
  RESERVATION_STATUSES
} from '../data/initialData';
import { 
  saveOrderToFirebase, 
  updateOrderInFirebase, 
  updateTableInFirebase, 
  addSystemLogToFirebase,
  subscribeOrders,
  subscribeDiningSessions,
  saveDiningSessionToFirebase
} from '../firebase/restaurantService';
import confetti from 'canvas-confetti';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const MENU_VERSION = 'kokan_kinara_v15_dining_sessions';

  const hasDevanagari = (str) => typeof str === 'string' && /[\u0900-\u097F]/.test(str);

  const [menu, setMenu] = useState(() => {
    const savedVer = localStorage.getItem('rm_menu_version');
    const saved = localStorage.getItem('rm_menu');
    if (saved && savedVer === MENU_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        const isOutdated = Array.isArray(parsed) && parsed.some(i => hasDevanagari(i.category) || hasDevanagari(i.name));
        if (!isOutdated && parsed.length > 0) {
          return parsed.map(item => ({
            ...item,
            isTodaysSpecial: item.isTodaysSpecial !== undefined ? item.isTodaysSpecial : (DEFAULT_TODAYS_SPECIAL_IDS && DEFAULT_TODAYS_SPECIAL_IDS.includes(item.id)),
            isWeeklyBest: item.isWeeklyBest !== undefined ? item.isWeeklyBest : DEFAULT_WEEKLY_BEST_IDS.includes(item.id),
            isMonthlyBest: item.isMonthlyBest !== undefined ? item.isMonthlyBest : DEFAULT_MONTHLY_BEST_IDS.includes(item.id)
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved menu', e);
      }
    }
    localStorage.setItem('rm_menu_version', MENU_VERSION);
    localStorage.setItem('rm_menu', JSON.stringify(INITIAL_MENU));
    return INITIAL_MENU;
  });

  const [tables, setTables] = useState(() => {
    const savedVer = localStorage.getItem('rm_menu_version');
    const saved = localStorage.getItem('rm_tables');
    if (saved && savedVer === MENU_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(t => {
            const init = INITIAL_TABLES.find(it => it.id === t.id);
            return {
              ...t,
              qrToken: t.qrToken || init?.qrToken || `kk-qr-${t.id.toLowerCase()}-sec`
            };
          });
        }
      } catch (e) {
        console.error('Failed to parse saved tables', e);
      }
    }
    localStorage.setItem('rm_tables', JSON.stringify(INITIAL_TABLES));
    return INITIAL_TABLES;
  });

  const [diningSessions, setDiningSessions] = useState(() => {
    const saved = localStorage.getItem('rm_dining_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved dining sessions', e);
      }
    }
    return INITIAL_DINING_SESSIONS;
  });

  const [orders, setOrders] = useState(() => {
    const savedVer = localStorage.getItem('rm_menu_version');
    const saved = localStorage.getItem('rm_orders');
    if (saved && savedVer === MENU_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove legacy mock dummy orders with hardcoded IDs
          return parsed.filter(o => !['ORD-1001', 'ORD-1002', 'ORD-1003'].includes(o.id));
        }
      } catch (e) {
        console.error('Failed to parse saved orders', e);
      }
    }
    localStorage.setItem('rm_menu_version', MENU_VERSION);
    localStorage.setItem('rm_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  });

  const [reservations, setReservations] = useState(() => {
    const savedVer = localStorage.getItem('rm_menu_version');
    const saved = localStorage.getItem('rm_reservations');
    if (saved && savedVer === MENU_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => !['RES-501', 'RES-502', 'RES-503'].includes(r.id));
        }
      } catch (e) {
        console.error('Failed to parse saved reservations', e);
      }
    }
    localStorage.setItem('rm_reservations', JSON.stringify(INITIAL_RESERVATIONS));
    return INITIAL_RESERVATIONS;
  });

  const [staff, setStaff] = useState(() => {
    const savedVer = localStorage.getItem('rm_menu_version');
    const saved = localStorage.getItem('rm_staff');
    if (saved && savedVer === MENU_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep only real staff added by manager, filter out mock seed IDs and dummy names
          return parsed.filter(s =>
            !['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'].includes(s.id) &&
            !['Chef Vithal Parab', 'Ganesh Patil', 'Sunil Jadhav', 'Omkar Suryawanshi', 'Rajesh Sawant'].includes(s.name)
          );
        }
      } catch (e) {
        console.error('Failed to parse saved staff', e);
      }
    }
    localStorage.setItem('rm_staff', JSON.stringify(INITIAL_STAFF));
    return INITIAL_STAFF;
  });

  const [serviceRequests, setServiceRequests] = useState(() => {
    const saved = localStorage.getItem('rm_service_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse service requests', e);
      }
    }
    return INITIAL_SERVICE_REQUESTS;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('rm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeOrderId, setActiveOrderId] = useState('ORD-1001');
  const [currentView, setCurrentView] = useState('customer'); // 'customer' | 'kitchen' | 'waiter' | 'system' | 'admin' | 'cashier'
  const [customerSection, setCustomerSection] = useState('home'); // 'home' | 'menu' | 'weekly' | 'monthly' | 'delivery' | 'takeaway' | 'reservation' | 'orders' | 'reservations' | 'contact'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Realtime System Audit Logs (Reflecting System Swimlane)
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: '25 min ago', sender: 'System', message: 'Order #ORD-1001 validated and dispatched to kitchen rail', type: 'success' },
    { id: 2, time: '22 min ago', sender: 'Kitchen Staff', message: 'Chef started preparation for Order #ORD-1001', type: 'info' },
    { id: 3, time: '4 min ago', sender: 'Kitchen Staff', message: 'Order #ORD-1001 flagged as READY by Chef', type: 'info' },
    { id: 4, time: 'Just now', sender: 'Reservations', message: 'Online booking #RES-501 confirmed for Table 6 (Mahesh Deshmukh)', type: 'success' }
  ]);

  // Notifications popup list
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'System Active', text: 'Central Order & Reservation Engine initialized', time: 'Just now' }
  ]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('rm_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('rm_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('rm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rm_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('rm_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('rm_service_requests', JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem('rm_dining_sessions', JSON.stringify(diningSessions));
  }, [diningSessions]);

  useEffect(() => {
    localStorage.setItem('rm_cart', JSON.stringify(cart));
  }, [cart]);

  // Active English migration for any existing active session
  useEffect(() => {
    setMenu(prev => {
      if (prev.some(i => hasDevanagari(i.category) || hasDevanagari(i.name))) {
        localStorage.setItem('rm_menu_version', MENU_VERSION);
        localStorage.setItem('rm_menu', JSON.stringify(INITIAL_MENU));
        return INITIAL_MENU;
      }
      return prev;
    });
    setTables(prev => {
      const needsTokens = prev.some(t => !t.qrToken || hasDevanagari(t.section));
      if (needsTokens) {
        const updated = prev.map(t => {
          const init = INITIAL_TABLES.find(it => it.id === t.id);
          return {
            ...t,
            section: hasDevanagari(t.section) ? (init?.section || 'Indoor AC') : t.section,
            qrToken: t.qrToken || init?.qrToken || `kk-qr-${t.id.toLowerCase()}-sec`
          };
        });
        localStorage.setItem('rm_tables', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
    setOrders(prev => {
      if (prev.some(o => hasDevanagari(o.customerName) || o.items?.some(i => hasDevanagari(i.name)))) {
        localStorage.setItem('rm_orders', JSON.stringify(INITIAL_ORDERS));
        return INITIAL_ORDERS;
      }
      return prev;
    });
    setStaff(prev => {
      const filtered = (prev || []).filter(s =>
        !['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'].includes(s.id) &&
        !['Chef Vithal Parab', 'Ganesh Patil', 'Sunil Jadhav', 'Omkar Suryawanshi', 'Rajesh Sawant'].includes(s.name)
      );
      if (filtered.length !== (prev || []).length) {
        localStorage.setItem('rm_staff', JSON.stringify(filtered));
        return filtered;
      }
      return prev;
    });
  }, []);

  // Subscribe to Firebase Real-time updates
  useEffect(() => {
    const unsubscribeOrders = subscribeOrders((firebaseOrders) => {
      if (firebaseOrders && firebaseOrders.length > 0) {
        setOrders(prev => {
          // Merge firebase orders with local state
          const merged = [...firebaseOrders];
          prev.forEach(p => {
            if (!merged.find(m => m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    });

    const unsubscribeSessions = subscribeDiningSessions((firebaseSessions) => {
      if (firebaseSessions && firebaseSessions.length > 0) {
        setDiningSessions(prev => {
          const merged = [...firebaseSessions];
          prev.forEach(p => {
            if (!merged.find(m => m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    });

    return () => {
      if (typeof unsubscribeOrders === 'function') unsubscribeOrders();
      if (typeof unsubscribeSessions === 'function') unsubscribeSessions();
    };
  }, []);

  const addSystemLog = (sender, message, type = 'info') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog = {
      id: Date.now() + Math.random(),
      time: timeStr,
      sender,
      message,
      type
    };
    setSystemLogs(prev => [newLog, ...prev.slice(0, 49)]);
    addSystemLogToFirebase(newLog);
  };

  const notifyUser = (title, text) => {
    const notif = {
      id: 'notif-' + Date.now(),
      title,
      text,
      time: 'Just now'
    };
    setNotifications(prev => [notif, ...prev.slice(0, 9)]);
  };

  // Cart operations with portion support
  const addToCart = (item, quantity = 1, notes = '', selectedPortion = null, customPrice = null) => {
    const itemPrice = customPrice !== null ? customPrice : (item.price || 0);
    const cartItemId = selectedPortion ? `${item.id}-${selectedPortion}` : (item.cartItemId || item.id);
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => (ci.cartItemId ? ci.cartItemId === cartItemId : ci.id === cartItemId));
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (notes) updated[existingIndex].notes = notes;
        return updated;
      } else {
        return [...prev, {
          ...item,
          cartItemId,
          price: itemPrice,
          selectedPortion: selectedPortion || item.selectedPortion || 'Standard',
          quantity,
          notes
        }];
      }
    });
    notifyUser('Cart Updated', `Added ${quantity}x ${item.name}${selectedPortion ? ` (${selectedPortion})` : ''} to cart`);
  };

  const updateCartQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeEntireCartItem(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => ((item.cartItemId || item.id) === cartItemId) ? { ...item, quantity } : item));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => {
      const existing = prev.find(item => (item.cartItemId || item.id) === cartItemId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => (item.cartItemId || item.id) === cartItemId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => (item.cartItemId || item.id) !== cartItemId);
    });
  };

  const removeEntireCartItem = (cartItemId) => {
    setCart(prev => prev.filter(item => (item.cartItemId || item.id) !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [cart]);

  // ==========================================
  // ACTIVITY DIAGRAM CORE WORKFLOW:
  // Step: Validate Order (Items, Table, Availability)
  // ==========================================
  const validateOrder = (tableId, cartItems, orderType = 'dine-in') => {
    const errors = [];
    const alternatives = [];

    // 1. Validate Table Availability if Dine-In
    if (orderType === 'dine-in') {
      const selectedTable = tables.find(t => t.id === tableId);
      if (!selectedTable) {
        errors.push({ type: 'table', message: 'Please select a valid dining table.' });
      } else if (selectedTable.status !== 'available') {
        const statusLabel = selectedTable.status === 'occupied' ? 'currently occupied' : 'reserved';
        
        // Find alternative table with similar capacity that is available
        const altTable = tables.find(t => t.status === 'available' && t.id !== tableId);
        
        errors.push({
          type: 'table',
          tableId: selectedTable.id,
          tableNumber: selectedTable.number,
          message: `Table ${selectedTable.number} is ${statusLabel}.`
        });

        if (altTable) {
          alternatives.push({
            type: 'table',
            suggestedTable: altTable,
            reason: `Table ${altTable.number} (${altTable.section}, capacity ${altTable.capacity}) is available right now!`
          });
        }
      }
    }

    // 2. Validate Items & Availability in Stock
    if (!cartItems || cartItems.length === 0) {
      errors.push({ type: 'empty_cart', message: 'Your cart is empty. Please select menu items.' });
    } else {
      cartItems.forEach(cartItem => {
        const menuItem = menu.find(m => m.id === cartItem.id);
        if (!menuItem || !menuItem.inStock || menuItem.stockCount < cartItem.quantity) {
          errors.push({
            type: 'item_unavailable',
            itemId: cartItem.id,
            itemName: cartItem.name,
            message: `"${cartItem.name}" is currently sold out or has insufficient quantity.`
          });

          // Suggest alternative dish
          const altId = menuItem?.suggestedAlternativeId;
          const altDish = menu.find(m => m.id === altId && m.inStock);
          const fallbackAlt = altDish || menu.find(m => m.category === cartItem.category && m.inStock && m.id !== cartItem.id);

          if (fallbackAlt) {
            alternatives.push({
              type: 'item',
              originalItem: cartItem,
              suggestedDish: fallbackAlt,
              reason: `We recommend trying the chef's popular "${fallbackAlt.name}" (₹${fallbackAlt.price.toFixed(2)}) instead!`
            });
          }
        }
      });
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      addSystemLog('System', `Order validation failed: ${errors.map(e => e.message).join('; ')}`, 'danger');
    } else {
      addSystemLog('System', `Order validation passed: Items and ${orderType === 'dine-in' ? 'Table' : 'Delivery'} confirmed`, 'success');
    }

    return { isValid, errors, alternatives };
  };

  // ==========================================
  // Step: Create Order and Save Details
  // ==========================================
  const createOrder = ({
    customerName,
    customerPhone,
    orderType = 'dine-in',
    tableId = null,
    deliveryAddress = '',
    discountCode = null
  }) => {
    // Run validation first
    const validation = validateOrder(tableId, cart, orderType);
    if (!validation.isValid) {
      return { success: false, validation };
    }

    const tableObj = tables.find(t => t.id === tableId);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.05; // 5% GST/Tax
    const taxAmount = Number((subtotal * taxRate).toFixed(2));

    let discountAmount = 0;
    if (discountCode && PROMO_CODES[discountCode]) {
      const promo = PROMO_CODES[discountCode];
      if (promo.discountType === 'percentage') {
        discountAmount = Number(((subtotal * promo.value) / 100).toFixed(2));
      } else {
        discountAmount = promo.value;
      }
    }
    const total = Number(Math.max(0, subtotal + taxAmount - discountAmount).toFixed(2));

    const newOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: newOrderId,
      customerName: customerName || 'Guest Customer',
      customerPhone: customerPhone || '+1 (555) 000-0000',
      orderType,
      tableId: orderType === 'dine-in' ? tableId : null,
      tableNumber: orderType === 'dine-in' ? tableObj?.number : null,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      items: [...cart],
      status: 'PLACED', // Dispatched to KITCHEN
      subtotal,
      taxRate,
      taxAmount,
      discountCode: discountCode || null,
      discountAmount,
      total,
      paymentStatus: 'PENDING',
      paymentMethod: null,
      paymentFailureReason: null,
      receiptNumber: null,
      createdAt: new Date().toISOString(),
      logs: [
        { time: 'Just now', action: 'Order created & validated by System' }
      ]
    };

    // Deduct stock for ordered items
    setMenu(prev => prev.map(m => {
      const ordered = cart.find(c => c.id === m.id);
      if (ordered) {
        const remaining = Math.max(0, m.stockCount - ordered.quantity);
        return { ...m, stockCount: remaining, inStock: remaining > 0 };
      }
      return m;
    }));

    // Mark table as occupied
    if (orderType === 'dine-in' && tableId) {
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied' } : t));
      updateTableInFirebase(tableId, 'occupied');
    }

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrderId);
    clearCart();

    // Sync order to Firebase Firestore
    saveOrderToFirebase(newOrder);

    addSystemLog('System', `Order ${newOrderId} created and dispatched to Kitchen Staff`, 'success');
    notifyUser('Order Placed!', `Your order ${newOrderId} is received and sent to the kitchen.`);

    return { success: true, order: newOrder };
  };

  // ==========================================
  // Manager: Takes dine-in order for a selected table
  // Dispatches directly to Chef with food items, required stock, and customer instructions
  // ==========================================
  const createManagerOrder = ({
    tableNumber,
    tableId = null,
    items = [],
    customerName = 'Table Guest',
    specialInstructions = ''
  }) => {
    if (!items || items.length === 0) {
      return { success: false, error: 'Please select at least one food item.' };
    }

    const tableObj = tables.find(t => t.number === Number(tableNumber) || t.id === tableId);
    const actualTableId = tableObj ? tableObj.id : (tableId || `T${tableNumber}`);
    const actualTableNumber = tableObj ? tableObj.number : Number(tableNumber);

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.05;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    const newOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: newOrderId,
      customerName: customerName || `Table ${actualTableNumber} Guest`,
      customerPhone: '',
      orderType: 'dine-in',
      tableId: actualTableId,
      tableNumber: actualTableNumber,
      deliveryAddress: null,
      items: items.map(item => ({
        ...item,
        notes: item.notes || ''
      })),
      specialInstructions: specialInstructions || null,
      status: 'PLACED', // Dispatched directly to Chef / Kitchen
      subtotal,
      taxRate,
      taxAmount,
      discountCode: null,
      discountAmount: 0,
      total,
      paymentStatus: 'PENDING',
      paymentMethod: null,
      paymentFailureReason: null,
      receiptNumber: null,
      createdAt: new Date().toISOString(),
      logs: [
        { time: 'Just now', action: `Manager placed order for Table #${actualTableNumber} -> Dispatched to Chef` }
      ]
    };

    // Deduct stock for ordered items
    setMenu(prev => prev.map(m => {
      const ordered = items.find(c => c.id === m.id);
      if (ordered) {
        const remaining = Math.max(0, m.stockCount - ordered.quantity);
        return { ...m, stockCount: remaining, inStock: remaining > 0 };
      }
      return m;
    }));

    // Mark table as occupied
    if (actualTableId) {
      setTables(prev => prev.map(t => (t.id === actualTableId || t.number === actualTableNumber) ? { ...t, status: 'occupied' } : t));
      updateTableInFirebase(actualTableId, 'occupied');
    }

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrderId);
    saveOrderToFirebase(newOrder);

    addSystemLog('Manager', `Manager placed Order ${newOrderId} for Table #${actualTableNumber} -> Sent to Chef`, 'success');
    notifyUser('Order Sent to Chef!', `Order #${newOrderId} for Table #${actualTableNumber} sent to kitchen.`);

    return { success: true, order: newOrder };
  };

  // ==========================================
  // CENTRAL MULTI-CHANNEL ORDER ENGINE:
  // createOnlineOrder for Website Customer (Delivery & Takeaway)
  // Strictly Online - NEVER asks for physical table!
  // ==========================================
  const createOnlineOrder = ({
    orderSource,
    orderType,
    customer,
    customerName,
    customerPhone,
    deliveryAddress = '',
    paymentMethod = 'UPI',
    items = null,
    discountCode = null,
    deliveryInstructions = '',
    specialNotes = ''
  }) => {
    const itemsToOrder = items || cart;
    if (!itemsToOrder || itemsToOrder.length === 0) {
      return { success: false, error: 'Your cart is empty. Please select menu items.' };
    }

    // Stock verification
    for (const cartItem of itemsToOrder) {
      const menuItem = menu.find(m => m.id === cartItem.id);
      if (!menuItem || !menuItem.inStock || menuItem.stockCount < cartItem.quantity) {
        return {
          success: false,
          error: `"${cartItem.name}" is sold out or has insufficient quantity.`
        };
      }
    }

    // Determine delivery vs takeaway
    const isDelivery = orderType 
      ? String(orderType).toUpperCase() === 'DELIVERY' 
      : (orderSource === 'ONLINE_DELIVERY' || !orderSource);
    const finalOrderSource = isDelivery ? 'ONLINE_DELIVERY' : 'ONLINE_TAKEAWAY';
    const finalOrderType = isDelivery ? 'delivery' : 'takeaway';
    const finalCustomerName = (customer && customer.name) || customerName || 'Online Guest';
    const finalCustomerPhone = (customer && customer.phone) || customerPhone || '+91 98200 00000';
    const finalCustomerEmail = (customer && customer.email) || '';

    const subtotal = itemsToOrder.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const taxRate = 0.05;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const deliveryFee = isDelivery ? 40.00 : 0.00;

    let discountAmount = 0;
    if (discountCode && PROMO_CODES[discountCode]) {
      const promo = PROMO_CODES[discountCode];
      discountAmount = promo.discountType === 'percentage'
        ? Number(((subtotal * promo.value) / 100).toFixed(2))
        : promo.value;
    }

    const total = Number(Math.max(0, subtotal + taxAmount + deliveryFee - discountAmount).toFixed(2));
    const newOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: newOrderId,
      orderSource: finalOrderSource,
      orderType: finalOrderType,
      customer: {
        name: finalCustomerName,
        phone: finalCustomerPhone,
        email: finalCustomerEmail
      },
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      deliveryAddress: isDelivery ? deliveryAddress : null,
      tableId: null,
      tableNumber: null,
      items: itemsToOrder.map(i => ({ ...i })),
      status: 'PLACED',
      fulfillmentStatus: 'PLACED',
      subtotal,
      taxRate,
      taxAmount,
      deliveryFee,
      discountCode: discountCode || null,
      discountAmount,
      total,
      totalAmount: total,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      paymentMethod: paymentMethod || 'UPI',
      deliveryInstructions: deliveryInstructions || '',
      specialNotes: specialNotes || '',
      createdAt: new Date().toISOString(),
      logs: [
        { 
          time: 'Just now', 
          action: `${isDelivery ? 'Online Delivery' : 'Online Takeaway'} order placed by ${finalCustomerName}` 
        }
      ]
    };

    // Deduct stock portions
    setMenu(prev => prev.map(m => {
      const ordered = itemsToOrder.find(c => c.id === m.id);
      if (ordered) {
        const remaining = Math.max(0, m.stockCount - ordered.quantity);
        return { ...m, stockCount: remaining, inStock: remaining > 0 };
      }
      return m;
    }));

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrderId);
    if (!items) clearCart();

    saveOrderToFirebase(newOrder);
    addSystemLog('Online Ordering', `Order #${newOrderId} (${finalOrderSource}) placed by ${finalCustomerName} (₹${total.toFixed(2)})`, 'success');
    notifyUser('Order Placed!', `Order #${newOrderId} received! Tracking is now active.`);

    return { success: true, order: newOrder };
  };

  // Reset order history to clean state
  const clearAllOrders = () => {
    setOrders([]);
    localStorage.setItem('rm_orders', JSON.stringify([]));
    addSystemLog('Admin', 'Admin cleared all recorded orders for a clean slate', 'warning');
    notifyUser('Analytics Cleared', 'All order data has been reset to clean real state');
  };

  // ==========================================
  // DEDICATED TABLE RESERVATION ENGINE
  // ==========================================
  const createReservation = ({
    customerName,
    customerPhone,
    customerEmail,
    reservationDate,
    timeSlot,
    guestCount,
    seatingPreference = 'Any Available',
    specialRequests = ''
  }) => {
    if (!customerName || !customerPhone || !reservationDate || !timeSlot || !guestCount) {
      return { success: false, error: 'Please provide all required reservation fields.' };
    }

    const reqDate = new Date(reservationDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (reqDate < today) {
      return { success: false, error: 'Cannot book reservations in the past. Please select today or a future date.' };
    }

    // Check existing active reservations for same date and timeslot to prevent capacity overload
    const existingSameSlot = reservations.filter(r => 
      r.reservationDate === reservationDate && 
      r.timeSlot === timeSlot && 
      !['CANCELLED', 'REJECTED'].includes(r.status)
    );
    const bookedGuests = existingSameSlot.reduce((sum, r) => sum + r.guestCount, 0);
    const totalRestaurantSeats = tables.reduce((sum, t) => sum + t.capacity, 0);

    if (bookedGuests + Number(guestCount) > totalRestaurantSeats) {
      return {
        success: false,
        error: `Slot ${timeSlot} on ${reservationDate} is fully booked (${bookedGuests}/${totalRestaurantSeats} seats reserved). Please select an adjacent time slot.`
      };
    }

    // Find candidate matching table
    const candidateTable = tables.find(t => 
      t.capacity >= Number(guestCount) &&
      (seatingPreference === 'Any Available' || t.section.toLowerCase().includes(seatingPreference.toLowerCase())) &&
      !existingSameSlot.some(r => r.assignedTableId === t.id)
    );

    const newResId = 'RES-' + Math.floor(500 + Math.random() * 500);
    const newReservation = {
      id: newResId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      reservationDate,
      timeSlot,
      guestCount: Number(guestCount),
      seatingPreference,
      specialRequests: specialRequests || '',
      assignedTableId: candidateTable ? candidateTable.id : null,
      tableNumber: candidateTable ? candidateTable.number : null,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setReservations(prev => [newReservation, ...prev]);
    addSystemLog('Reservations', `New table booking request #${newResId} for ${guestCount} guests on ${reservationDate} at ${timeSlot} (${customerName})`, 'info');
    notifyUser('Reservation Submitted', `Booking #${newResId} received! Manager confirmation is pending.`);

    return { success: true, reservation: newReservation };
  };

  const updateReservationStatus = (reservationId, newStatus, assignedTableId = null, rejectionReason = '') => {
    setReservations(prev => prev.map(res => {
      if (res.id === reservationId) {
        const tableObj = assignedTableId ? tables.find(t => t.id === assignedTableId) : null;
        const updated = {
          ...res,
          status: newStatus,
          assignedTableId: assignedTableId || res.assignedTableId,
          tableNumber: tableObj ? tableObj.number : res.tableNumber,
          rejectionReason: rejectionReason || res.rejectionReason,
          updatedAt: new Date().toISOString()
        };

        // Table status updates
        if (newStatus === 'CONFIRMED' && updated.assignedTableId) {
          setTables(tbls => tbls.map(t => t.id === updated.assignedTableId ? { ...t, status: 'reserved' } : t));
          updateTableInFirebase(updated.assignedTableId, 'reserved');
        } else if (newStatus === 'CHECKED_IN' && updated.assignedTableId) {
          setTables(tbls => tbls.map(t => t.id === updated.assignedTableId ? { ...t, status: 'occupied' } : t));
          updateTableInFirebase(updated.assignedTableId, 'occupied');
        } else if (['COMPLETED', 'CANCELLED', 'NO_SHOW', 'REJECTED'].includes(newStatus) && res.assignedTableId) {
          setTables(tbls => tbls.map(t => t.id === res.assignedTableId ? { ...t, status: 'available' } : t));
          updateTableInFirebase(res.assignedTableId, 'available');
        }

        return updated;
      }
      return res;
    }));

    addSystemLog('Manager', `Reservation #${reservationId} status updated to ${newStatus}${rejectionReason ? ` (Reason: ${rejectionReason})` : ''}`, 'info');
    notifyUser('Reservation Updated', `Reservation #${reservationId} is now ${newStatus}`);
  };

  // ==========================================
  // UNIFIED FULFILLMENT STATUS MACHINE
  // Delivery: PLACED → ACCEPTED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
  // Takeaway: PLACED → ACCEPTED → PREPARING → READY_FOR_PICKUP → PICKED_UP
  // Dine-In: PLACED → ACCEPTED → PREPARING → READY → SERVED → COMPLETED
  // ==========================================
  const advanceFulfillmentStatus = (orderId, nextStatus, metadata = {}) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const timeNow = 'Just now';
        const logMsg = metadata.log || `Status updated to ${nextStatus}`;
        const updated = {
          ...order,
          status: nextStatus,
          fulfillmentStatus: nextStatus,
          ...metadata,
          updatedAt: new Date().toISOString(),
          logs: [...order.logs, { time: timeNow, action: logMsg }]
        };

        if (nextStatus === 'OUT_FOR_DELIVERY') {
          updated.dispatchedAt = new Date().toISOString();
        } else if (nextStatus === 'DELIVERED') {
          updated.deliveredAt = new Date().toISOString();
          updated.paymentStatus = 'PAID';
        } else if (nextStatus === 'READY_FOR_PICKUP') {
          updated.readyForPickupAt = new Date().toISOString();
        } else if (nextStatus === 'PICKED_UP') {
          updated.pickedUpAt = new Date().toISOString();
          updated.paymentStatus = 'PAID';
        } else if (nextStatus === 'SERVED') {
          updated.servedAt = new Date().toISOString();
        }

        updateOrderInFirebase(orderId, updated);
        return updated;
      }
      return order;
    }));

    addSystemLog('Fulfillment', `Order #${orderId} advanced to ${nextStatus}`, 'info');
    notifyUser('Order Updated', `Order #${orderId} is now ${nextStatus.replace(/_/g, ' ')}`);
  };

  // Waiter action: Mark food served at table
  const markFoodServed = (orderId, waiterName = 'Waiter Staff') => {
    advanceFulfillmentStatus(orderId, 'SERVED', {
      servedBy: waiterName,
      log: `Food served at table by ${waiterName}`
    });
  };

  // Manager action: Dispatch driver for delivery
  const dispatchDeliveryOrder = (orderId, driverName = 'Express Rider') => {
    advanceFulfillmentStatus(orderId, 'OUT_FOR_DELIVERY', {
      dispatchedBy: 'Manager',
      driverName,
      log: `Order dispatched for delivery via ${driverName}`
    });
  };

  // Mark delivery completed
  const markOrderDelivered = (orderId) => {
    advanceFulfillmentStatus(orderId, 'DELIVERED', {
      log: 'Order successfully delivered to customer address'
    });
  };

  // Mark takeaway picked up
  const markTakeawayPickedUp = (orderId) => {
    advanceFulfillmentStatus(orderId, 'PICKED_UP', {
      log: 'Customer arrived and collected takeaway parcel'
    });
  };

  // Chef reporting alerts
  const reportPreparationDelay = (orderId, delayMinutes, reason = '') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          delayMinutes: Number(delayMinutes),
          delayReason: reason || 'High grill station volume',
          logs: [...o.logs, { time: 'Just now', action: `Chef reported ${delayMinutes}m delay: ${reason}` }]
        };
      }
      return o;
    }));
    addSystemLog('Kitchen', `Order #${orderId} delayed by ${delayMinutes} mins (${reason})`, 'warning');
    notifyUser('Kitchen Delay Alert', `Chef reported a ${delayMinutes} min delay on #${orderId}`);
  };

  const reportItemUnavailable = (orderId, itemId, reason = 'Out of Stock') => {
    addSystemLog('Kitchen', `Chef reported item ${itemId} unavailable on Order #${orderId}: ${reason}`, 'danger');
    notifyUser('Item Unavailable', `Chef flagged item unavailable on Order #${orderId}`);
  };

  const requestOrderClarification = (orderId, question) => {
    addSystemLog('Kitchen', `Clarification requested for Order #${orderId}: "${question}"`, 'warning');
    notifyUser('Chef Clarification', `Order #${orderId}: ${question}`);
  };

  // ==========================================
  // SERVICE REQUESTS ENGINE (WAITER & TABLES)
  // ==========================================
  const createServiceRequest = ({ tableNumber, type, details = '' }) => {
    const newReqId = 'SRQ-' + Math.floor(100 + Math.random() * 900);
    const newReq = {
      id: newReqId,
      tableNumber: Number(tableNumber),
      type,
      details: details || `Table ${tableNumber} requested ${type}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setServiceRequests(prev => [newReq, ...prev]);
    addSystemLog('Waiter Station', `Service Call from Table ${tableNumber}: ${type} (${details})`, 'warning');
    notifyUser('Service Call', `Table ${tableNumber} requests ${type}`);
    return newReq;
  };

  const resolveServiceRequest = (requestId) => {
    setServiceRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : r));
    addSystemLog('Waiter Station', `Service request #${requestId} attended and resolved`, 'info');
  };

  // Table status updater
  const updateTableStatus = (tableId, newStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
    updateTableInFirebase(tableId, newStatus);
    addSystemLog('Manager', `Table status updated to ${newStatus.toUpperCase()}`, 'info');
    notifyUser('Table Updated', `Table is now ${newStatus}`);
  };

  // ==========================================
  // OFFLINE QR DINE-IN & DINING SESSIONS ENGINE
  // ==========================================

  // 1. Staff creates/activates a dining session for a table
  const startDiningSession = ({ tableId, guestCount = 2, customerName = '', openedBy = 'Staff' }) => {
    const table = tables.find(t => t.id === tableId || t.number === Number(tableId));
    if (!table) return { success: false, error: 'Table not found' };

    // Check if table already has an active session
    const existing = diningSessions.find(s => s.tableId === table.id && s.status !== 'CLOSED');
    if (existing) {
      return { success: true, session: existing, message: `Table #${table.number} already has an active dining session.` };
    }

    const sessionId = `DS-${table.id}-${Date.now().toString().slice(-6)}`;
    const newSession = {
      id: sessionId,
      tableId: table.id,
      tableNumber: table.number,
      section: table.section || 'Dining Hall',
      qrToken: table.qrToken || `kk-qr-${table.id.toLowerCase()}-sec`,
      status: 'ACTIVE', // ACTIVE -> BILL_REQUESTED -> BILL_GENERATED -> PAYMENT_PENDING -> CLOSED
      customerName: customerName.trim() || `Table ${table.number} Guests`,
      guestCount: Number(guestCount) || 2,
      openedAt: new Date().toISOString(),
      openedBy: openedBy || 'Staff',
      orderIds: [],
      subtotal: 0,
      taxRate: 0.05,
      tax: 0,
      total: 0,
      paymentStatus: 'PENDING',
      paymentMethod: null,
      billRequestedAt: null,
      billedAt: null,
      closedAt: null,
      closedBy: null
    };

    setDiningSessions(prev => [newSession, ...prev]);
    saveDiningSessionToFirebase(newSession);

    // Occupy table
    setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: 'occupied' } : t));
    updateTableInFirebase(table.id, 'occupied');

    addSystemLog('Dining Session', `Session ${sessionId} activated for Table #${table.number} (${newSession.guestCount} guests, seated by ${openedBy})`, 'success');
    notifyUser('Dining Session Started', `Table #${table.number} is now active for QR Dine-In.`);
    return { success: true, session: newSession };
  };

  // 2. Look up active session for table
  const getActiveSessionForTable = (tableId) => {
    if (!tableId) return null;
    return diningSessions.find(s => 
      (s.tableId === tableId || s.tableNumber === Number(tableId)) && s.status !== 'CLOSED'
    ) || null;
  };

  // 3. Secure QR token validation
  const validateQRToken = (tableIdentifier, token) => {
    if (!tableIdentifier) {
      return { valid: false, reason: 'NO_TABLE', message: 'No table specified in scan link.' };
    }
    const table = tables.find(t => t.id === tableIdentifier || t.number === Number(tableIdentifier));
    if (!table) {
      return { valid: false, reason: 'TABLE_NOT_FOUND', message: 'Invalid table parameter.' };
    }
    if (!token || table.qrToken !== token) {
      return { 
        valid: false, 
        reason: 'INVALID_TOKEN', 
        table, 
        message: `Security validation failed: Invalid QR token for Table #${table.number}. Please scan the physical QR sticker at your table.` 
      };
    }
    const activeSession = diningSessions.find(s => s.tableId === table.id && s.status !== 'CLOSED');
    if (!activeSession) {
      return {
        valid: false,
        reason: 'NO_ACTIVE_SESSION',
        table,
        message: `Table #${table.number} has not been activated yet. Please request a waiter or manager to seat you and start your dining session.`
      };
    }
    return { valid: true, table, session: activeSession };
  };

  // 4. Create an order from the Offline Dine-In QR interface
  const createDineInQROrder = ({ tableId, qrToken, items, specialInstructions = '', customerName = '' }) => {
    if (!items || items.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add items to place an order.' };
    }

    const validation = validateQRToken(tableId, qrToken);
    if (!validation.valid) {
      return { success: false, error: validation.message, reason: validation.reason };
    }

    const { table, session } = validation;

    // Verify stock availability
    for (const item of items) {
      const liveItem = menu.find(m => m.id === item.id);
      if (!liveItem || !liveItem.inStock || (liveItem.stockCount !== undefined && liveItem.stockCount < item.quantity)) {
        return {
          success: false,
          error: `Item "${item.name}" is currently sold out or low on stock.`
        };
      }
    }

    // Deduct stock safely
    setMenu(prev => prev.map(m => {
      const ordered = items.find(i => i.id === m.id);
      if (ordered) {
        const remaining = Math.max(0, (m.stockCount || 0) - (Number(ordered.quantity) || 1));
        return { ...m, stockCount: remaining, inStock: remaining > 0 };
      }
      return m;
    }));

    const orderSubtotal = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
    const taxRate = 0.05;
    const orderTax = Number((orderSubtotal * taxRate).toFixed(2));
    const orderTotal = Number((orderSubtotal + orderTax).toFixed(2));

    const newOrderId = `ORD-QR-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: newOrderId,
      orderSource: 'OFFLINE_DINE_IN_QR',
      orderType: 'dine-in',
      fulfillmentStatus: 'PLACED', // PLACED -> ACCEPTED -> PREPARING -> READY -> SERVED
      status: 'PLACED',
      tableId: table.id,
      tableNumber: table.number,
      diningSessionId: session.id,
      items: items.map(it => ({
        id: it.id,
        name: it.name,
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        selectedPortion: it.selectedPortion || 'Standard',
        isVeg: Boolean(it.isVeg),
        notes: it.notes || ''
      })),
      customerName: customerName.trim() || session.customerName || `Table ${table.number} Diner`,
      customerPhone: '',
      specialInstructions: specialInstructions.trim(),
      subtotal: orderSubtotal,
      taxRate,
      taxAmount: orderTax,
      discountAmount: 0,
      total: orderTotal,
      paymentStatus: 'UNPAID',
      paymentMethod: null,
      createdAt: new Date().toISOString(),
      logs: [
        { time: 'Just now', action: `QR Order placed by diner at Table #${table.number}` }
      ]
    };

    // Update orders list & Firebase
    setOrders(prev => [newOrder, ...prev]);
    saveOrderToFirebase(newOrder);

    // Update dining session with new order & cumulative financials
    setDiningSessions(prev => prev.map(s => {
      if (s.id === session.id) {
        const updatedOrderIds = [...(s.orderIds || []), newOrderId];
        const newSubtotal = Number(((s.subtotal || 0) + orderSubtotal).toFixed(2));
        const newTax = Number((newSubtotal * 0.05).toFixed(2));
        const newTotal = Number((newSubtotal + newTax).toFixed(2));
        const updatedSession = {
          ...s,
          orderIds: updatedOrderIds,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal
        };
        saveDiningSessionToFirebase(updatedSession);
        return updatedSession;
      }
      return s;
    }));

    addSystemLog('Kitchen Rail', `Ticket ${newOrderId} dispatched: ${items.length} dishes for Table #${table.number} (Offline QR)`, 'success');
    notifyUser('New Dine-In QR Order', `Table #${table.number} placed an order for ₹${orderTotal}`);

    return { success: true, order: newOrder };
  };

  // 5. Customer requests bill from the QR Dine-In page
  const requestBillForSession = (sessionId) => {
    const session = diningSessions.find(s => s.id === sessionId);
    if (!session) return { success: false, error: 'Session not found' };

    setDiningSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updated = {
          ...s,
          status: 'BILL_REQUESTED',
          billRequestedAt: new Date().toISOString()
        };
        saveDiningSessionToFirebase(updated);
        return updated;
      }
      return s;
    }));

    // Mark table as billed
    setTables(prev => prev.map(t => t.id === session.tableId ? { ...t, status: 'billed' } : t));
    updateTableInFirebase(session.tableId, 'billed');

    // Create high priority service request
    createServiceRequest({
      tableNumber: session.tableNumber,
      type: 'BILL',
      details: `Customer at Table ${session.tableNumber} requested final bill (Session ${session.id})`
    });

    addSystemLog('Cashier / Floor', `Bill requested for Table #${session.tableNumber} (Total: ₹${session.total})`, 'warning');
    notifyUser('Bill Requested', `Table #${session.tableNumber} has requested their bill`);
    return { success: true };
  };

  // 6. Generate consolidated session bill
  const generateSessionBill = (sessionId) => {
    const session = diningSessions.find(s => s.id === sessionId);
    if (!session) return null;

    const sessionOrders = orders.filter(o => o.diningSessionId === sessionId && o.status !== 'CANCELLED');
    
    // Consolidate line items
    const consolidatedItems = [];
    sessionOrders.forEach(ord => {
      ord.items?.forEach(it => {
        const key = `${it.id}-${it.selectedPortion || 'std'}`;
        const existing = consolidatedItems.find(ci => ci.key === key);
        if (existing) {
          existing.quantity += (Number(it.quantity) || 1);
          existing.totalAmount += (Number(it.price) * (Number(it.quantity) || 1));
        } else {
          consolidatedItems.push({
            key,
            id: it.id,
            name: it.name,
            selectedPortion: it.selectedPortion || 'Standard',
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
            totalAmount: (Number(it.price) || 0) * (Number(it.quantity) || 1),
            isVeg: it.isVeg
          });
        }
      });
    });

    const subtotal = consolidatedItems.reduce((sum, it) => sum + it.totalAmount, 0);
    const tax = Number((subtotal * 0.05).toFixed(2));
    const grandTotal = Number((subtotal + tax).toFixed(2));

    const billData = {
      sessionId,
      tableId: session.tableId,
      tableNumber: session.tableNumber,
      section: session.section,
      customerName: session.customerName,
      guestCount: session.guestCount,
      openedAt: session.openedAt,
      billedAt: new Date().toISOString(),
      ordersCount: sessionOrders.length,
      orders: sessionOrders,
      items: consolidatedItems,
      subtotal,
      taxRate: 0.05,
      tax,
      total: grandTotal,
      paymentStatus: session.paymentStatus
    };

    // Update session status to BILL_GENERATED
    setDiningSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updated = {
          ...s,
          status: 'BILL_GENERATED',
          billedAt: new Date().toISOString(),
          subtotal,
          tax,
          total: grandTotal
        };
        saveDiningSessionToFirebase(updated);
        return updated;
      }
      return s;
    }));

    return billData;
  };

  // 7. Settle Session Payment & close session
  const settleSessionPayment = (sessionId, paymentMethod = 'UPI', simulateSuccess = true) => {
    const session = diningSessions.find(s => s.id === sessionId);
    if (!session) return { success: false, error: 'Session not found' };

    if (!simulateSuccess) {
      return { success: false, error: 'Payment declined by gateway or tender incomplete.' };
    }

    const receiptNum = `RCP-${sessionId.slice(-6)}-${Date.now().toString().slice(-4)}`;
    const closedTime = new Date().toISOString();

    // 1. Close session and mark paid
    setDiningSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updated = {
          ...s,
          status: 'CLOSED',
          paymentStatus: 'PAID',
          paymentMethod,
          closedAt: closedTime,
          receiptNumber: receiptNum
        };
        saveDiningSessionToFirebase(updated);
        return updated;
      }
      return s;
    }));

    // 2. Mark all child orders as COMPLETED and PAID
    setOrders(prev => prev.map(o => {
      if (o.diningSessionId === sessionId) {
        const updated = {
          ...o,
          status: 'COMPLETED',
          fulfillmentStatus: o.fulfillmentStatus === 'READY' || o.fulfillmentStatus === 'PLACED' || o.fulfillmentStatus === 'PREPARING' ? 'SERVED' : o.fulfillmentStatus,
          paymentStatus: 'PAID',
          paymentMethod,
          paidAt: closedTime,
          receiptNumber: receiptNum,
          logs: [...(o.logs || []), { time: 'Just now', action: `Session bill settled via ${paymentMethod}` }]
        };
        updateOrderInFirebase(o.id, {
          status: 'COMPLETED',
          fulfillmentStatus: updated.fulfillmentStatus,
          paymentStatus: 'PAID',
          paymentMethod,
          receiptNumber: receiptNum
        });
        return updated;
      }
      return o;
    }));

    // 3. Move table to CLEANING (NEVER directly to AVAILABLE!)
    setTables(prev => prev.map(t => t.id === session.tableId ? { ...t, status: 'cleaning' } : t));
    updateTableInFirebase(session.tableId, 'cleaning');

    addSystemLog('Cashier / Billing', `Dining session ${sessionId} settled (₹${session.total}) via ${paymentMethod}. Table #${session.tableNumber} moved to CLEANING.`, 'success');
    notifyUser('Payment Received', `Table #${session.tableNumber} payment settled (₹${session.total})`);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    return {
      success: true,
      receiptNumber: receiptNum,
      total: session.total,
      paymentMethod,
      tableNumber: session.tableNumber
    };
  };

  // 8. Staff marks table cleaning as complete
  const completeTableCleaning = (tableId) => {
    const table = tables.find(t => t.id === tableId || t.number === Number(tableId));
    if (!table) return;

    setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: 'available' } : t));
    updateTableInFirebase(table.id, 'available');

    addSystemLog('Floor Staff', `Table #${table.number} sanitized & reset. Now AVAILABLE for seating.`, 'success');
    notifyUser('Table Ready', `Table #${table.number} is now clean and available.`);
  };

  // ==========================================
  // MENU MANAGEMENT CRUD (MANAGER & ADMIN)
  // ==========================================
  const addMenuItem = (dishData) => {
    const newId = 'kk-custom-' + Date.now();
    const newDish = {
      id: newId,
      name: dishData.name,
      category: dishData.category || 'Starters',
      price: Number(dishData.price) || 100,
      description: dishData.description || 'Authentic Malvani preparation',
      dietary: dishData.dietary || 'Veg',
      image: dishData.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      prepTime: dishData.prepTime || '15 mins',
      inStock: true,
      stockCount: Number(dishData.stockCount) || 20,
      rating: 5.0,
      isWeeklyBest: Boolean(dishData.isWeeklyBest),
      isMonthlyBest: Boolean(dishData.isMonthlyBest)
    };
    setMenu(prev => [newDish, ...prev]);
    addSystemLog('Manager', `New menu item added: "${newDish.name}" (₹${newDish.price})`, 'success');
    notifyUser('Menu Updated', `Added "${newDish.name}" to menu`);
    return newDish;
  };

  const updateMenuItem = (dishId, updates) => {
    setMenu(prev => prev.map(dish => dish.id === dishId ? { ...dish, ...updates } : dish));
    addSystemLog('Manager', `Menu item #${dishId} updated`, 'info');
    notifyUser('Menu Item Updated', 'Dish details saved');
  };

  const deleteMenuItem = (dishId) => {
    const dish = menu.find(m => m.id === dishId);
    setMenu(prev => prev.filter(m => m.id !== dishId));
    addSystemLog('Manager', `Deleted menu item "${dish?.name || dishId}"`, 'warning');
    notifyUser('Menu Item Deleted', `Removed dish from menu`);
  };

  // ==========================================
  // STAFF MANAGEMENT (MANAGER & ADMIN)
  // ==========================================
  const addStaffMember = (staffData) => {
    const role = staffData.role || 'kitchen';
    const isKitchen = role === 'kitchen';
    const newStaff = {
      id: 'staff-' + Date.now(),
      name: staffData.name,
      email: staffData.email || `${staffData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@kokankinara.com`,
      role: role,
      phone: staffData.phone || '+91 98000 00000',
      shift: staffData.shift || (isKitchen ? 'Morning & Evening' : 'Full Day'),
      assignedTables: staffData.assignedTables || [],
      isActive: true,
      status: 'active',
      addedBy: 'Manager',
      createdAt: new Date().toISOString()
    };
    setStaff(prev => [newStaff, ...prev]);
    addSystemLog('Manager', `Manager added new ${isKitchen ? 'Chef' : 'Staff Member'}: ${newStaff.name} (${role})`, 'success');
    notifyUser('Staff Added', `${newStaff.name} successfully registered as ${isKitchen ? 'Chef / Kitchen' : role}`);
    return newStaff;
  };

  const updateStaffMember = (staffId, updates) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, ...updates } : s));
    addSystemLog('Manager', `Staff member #${staffId} updated`, 'info');
  };

  const toggleStaffStatus = (staffId) => {
    setStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        const nextActive = !(s.status === 'active' || s.isActive);
        const nextStatus = nextActive ? 'active' : 'inactive';
        addSystemLog('Manager', `Staff member ${s.name} marked as ${nextStatus}`, 'warning');
        return { ...s, isActive: nextActive, status: nextStatus };
      }
      return s;
    }));
  };

  const deleteStaffMember = (staffId) => {
    setStaff(prev => {
      const target = prev.find(s => s.id === staffId);
      const remaining = prev.filter(s => s.id !== staffId);
      if (target) {
        addSystemLog('Manager', `Manager removed ${target.name} from restaurant roster`, 'warning');
        notifyUser('Staff Removed', `${target.name} removed from roster`);
      }
      return remaining;
    });
  };

  // ==========================================
  // Step: Kitchen Staff receives order details & prepares food
  // ==========================================
  const startPreparingOrder = (orderId) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = {
          ...order,
          status: 'KITCHEN_PREPARING',
          logs: [...order.logs, { time: 'Just now', action: 'Kitchen Staff started cooking items' }]
        };
        updateOrderInFirebase(orderId, { status: 'KITCHEN_PREPARING' });
        return updated;
      }
      return order;
    }));
    addSystemLog('Kitchen Staff', `Order ${orderId}: Food preparation commenced at station`, 'info');
    notifyUser('Kitchen Update', `Chef started preparing Order #${orderId}`);
  };

  // ==========================================
  // Step: Kitchen Staff marks order as ready
  // Step: Notify System (order ready)
  // Step: Generate Bill (calculate total, tax, discount)
  // ==========================================
  const markOrderReady = (orderId) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        // Automatic system bill calculation
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.05;
        const taxAmount = Number((subtotal * taxRate).toFixed(2));
        const discountAmount = order.discountAmount || 0;
        const total = Number(Math.max(0, subtotal + taxAmount - discountAmount).toFixed(2));

        const updated = {
          ...order,
          status: 'ORDER_READY',
          subtotal,
          taxAmount,
          total,
          readyAt: new Date().toISOString(),
          logs: [
            ...order.logs,
            { time: 'Just now', action: 'Kitchen Staff marked order as ready' },
            { time: 'Just now', action: 'System generated bill and notified Cashier / Customer' }
          ]
        };
        updateOrderInFirebase(orderId, { status: 'ORDER_READY', subtotal, taxAmount, total });
        return updated;
      }
      return order;
    }));

    addSystemLog('Kitchen Staff', `Marked order ${orderId} as READY`, 'info');
    addSystemLog('System', `Notified system: Food ready for order ${orderId}. Bill calculated (₹${orders.find(o => o.id === orderId)?.total || ''})`, 'warning');
    notifyUser('Order Ready & Bill Generated', `Order #${orderId} is ready to serve! Bill is available for payment.`);
  };

  // ==========================================
  // Step: Cashier / Payment System processes payment
  // Decision: Payment successful? (Yes / No)
  // ==========================================
  const processPayment = (orderId, paymentMethod = 'UPI', simulateSuccess = true) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (!simulateSuccess) {
      // BRANCH NO: Payment failure
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updated = {
            ...order,
            paymentStatus: 'FAILED',
            paymentFailureReason: 'Bank network timeout or insufficient funds in selected gateway.',
            logs: [
              ...order.logs,
              { time: 'Just now', action: `Payment via ${paymentMethod} FAILED. Error returned by gateway.` }
            ]
          };
          updateOrderInFirebase(orderId, { paymentStatus: 'FAILED' });
          return updated;
        }
        return order;
      }));

      addSystemLog('Cashier / Payment System', `Payment of ₹${targetOrder.total.toFixed(2)} for ${orderId} via ${paymentMethod} FAILED`, 'danger');
      addSystemLog('System', `Show payment failure message to Customer and provide Retry / Cancel option`, 'danger');
      notifyUser('Payment Failed', `Transaction via ${paymentMethod} was unsuccessful. You can retry or cancel.`);
      return { success: false, message: 'Payment gateway rejected the transaction.' };
    }

    // BRANCH YES: Payment successful
    const receiptNum = 'RCP-' + Math.floor(100000 + Math.random() * 900000);

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = {
          ...order,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          paymentMethod,
          receiptNumber: receiptNum,
          paidAt: new Date().toISOString(),
          paymentFailureReason: null,
          logs: [
            ...order.logs,
            { time: 'Just now', action: `Payment of ₹${order.total.toFixed(2)} via ${paymentMethod} SUCCESSFUL.` },
            { time: 'Just now', action: `Receipt ${receiptNum} issued. Order status set to COMPLETED.` }
          ]
        };
        updateOrderInFirebase(orderId, {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          paymentMethod,
          receiptNumber: receiptNum,
          paidAt: updated.paidAt
        });
        return updated;
      }
      return order;
    }));

    // Manage table turnover if dine-in
    if (targetOrder.tableId) {
      const hasActiveSession = targetOrder.diningSessionId && diningSessions.some(s => s.id === targetOrder.diningSessionId && s.status !== 'CLOSED');
      if (!hasActiveSession) {
        setTables(prev => prev.map(t => t.id === targetOrder.tableId ? { ...t, status: 'cleaning' } : t));
        updateTableInFirebase(targetOrder.tableId, 'cleaning');
        addSystemLog('Floor Management', `Table #${targetOrder.tableNumber} order paid. Table moved to CLEANING.`, 'info');
      }
    }

    addSystemLog('Cashier / Payment System', `Payment SUCCESSFUL for ${orderId} via ${paymentMethod}. Issued Receipt #${receiptNum}`, 'success');
    
    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    notifyUser('Payment Successful!', `Order #${orderId} completed! Receipt #${receiptNum} generated.`);
    return { success: true, receiptNumber: receiptNum };
  };

  // ==========================================
  // Step: Retry Payment
  // ==========================================
  const retryPayment = (orderId) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = {
          ...order,
          paymentStatus: 'PENDING',
          paymentFailureReason: null,
          logs: [...order.logs, { time: 'Just now', action: 'Customer initiated payment retry' }]
        };
        updateOrderInFirebase(orderId, { paymentStatus: 'PENDING' });
        return updated;
      }
      return order;
    }));
    addSystemLog('Customer', `Customer retrying payment for order ${orderId}`, 'info');
  };

  // ==========================================
  // Step: Cancel Order
  // ==========================================
  const cancelOrder = (orderId, reason = 'Customer cancelled after payment issue') => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = {
          ...order,
          status: 'CANCELLED',
          paymentStatus: 'CANCELLED',
          logs: [...order.logs, { time: 'Just now', action: `Order cancelled: ${reason}` }]
        };
        updateOrderInFirebase(orderId, { status: 'CANCELLED', paymentStatus: 'CANCELLED' });
        return updated;
      }
      return order;
    }));

    // Release table
    if (targetOrder.tableId) {
      setTables(prev => prev.map(t => t.id === targetOrder.tableId ? { ...t, status: 'available' } : t));
      updateTableInFirebase(targetOrder.tableId, 'available');
    }

    // Restore stock
    setMenu(prev => prev.map(m => {
      const item = targetOrder.items.find(i => i.id === m.id);
      if (item) {
        const restored = m.stockCount + item.quantity;
        return { ...m, stockCount: restored, inStock: true };
      }
      return m;
    }));

    addSystemLog('System', `Order ${orderId} cancelled. Table & inventory restored.`, 'warning');
    notifyUser('Order Cancelled', `Order #${orderId} was cancelled.`);
  };

  // Quick state togglers for testing edge cases from the diagram
  const toggleItemStock = (itemId) => {
    setMenu(prev => prev.map(item => {
      if (item.id === itemId) {
        const nextState = !item.inStock;
        addSystemLog('System Admin', `Inventory: "${item.name}" stock toggled to ${nextState ? 'IN STOCK' : 'OUT OF STOCK'}`);
        return { ...item, inStock: nextState, stockCount: nextState ? 10 : 0 };
      }
      return item;
    }));
  };

  const toggleTableStatus = (tableId, newStatus) => {
    setTables(prev => prev.map(tbl => {
      if (tbl.id === tableId) {
        addSystemLog('System Admin', `Table ${tbl.number} status changed to ${newStatus}`);
        updateTableInFirebase(tableId, newStatus);
        return { ...tbl, status: newStatus };
      }
      return tbl;
    }));
  };

  // Manager: Toggle top dish for Today's Special (or legacy weekly/monthly)
  const toggleTopDish = (itemId, period = 'todaysSpecial') => {
    setMenu(prev => prev.map(item => {
      if (item.id === itemId) {
        let key = 'isTodaysSpecial';
        let periodName = "Today's Special";
        if (period === 'weekly') {
          key = 'isWeeklyBest';
          periodName = 'Weekly Best';
        } else if (period === 'monthly') {
          key = 'isMonthlyBest';
          periodName = 'Monthly Best';
        }
        const nextVal = !item[key];
        addSystemLog('Manager', `Manager updated Top Dishes: "${item.name}" ${nextVal ? 'marked as' : 'removed from'} ${periodName}`, 'info');
        notifyUser('Top Dishes Updated', `"${item.name}" is ${nextVal ? 'now in' : 'removed from'} ${periodName}`);
        return { ...item, [key]: nextVal };
      }
      return item;
    }));
  };

  const setBatchTopDishes = (period = 'todaysSpecial', dishIds = []) => {
    let key = 'isTodaysSpecial';
    let periodName = "Today's Special";
    if (period === 'weekly') {
      key = 'isWeeklyBest';
      periodName = 'Weekly Best';
    } else if (period === 'monthly') {
      key = 'isMonthlyBest';
      periodName = 'Monthly Best';
    }
    setMenu(prev => prev.map(item => ({
      ...item,
      [key]: dishIds.includes(item.id)
    })));
    addSystemLog('Manager', `Manager updated full ${periodName} dish list (${dishIds.length} items)`, 'info');
    notifyUser('Top Dishes Updated', `${periodName} collection updated`);
  };

  const resetToDemoState = () => {
    setMenu(INITIAL_MENU);
    setTables(INITIAL_TABLES);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    setActiveOrderId('ORD-1001');
    addSystemLog('System', 'System state reset to demo defaults', 'info');
    notifyUser('Reset Complete', 'Demo state has been refreshed');
  };

  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0] || null;

  return (
    <RestaurantContext.Provider
      value={{
        menu,
        tables,
        diningSessions,
        orders,
        reservations,
        staff,
        serviceRequests,
        cart,
        cartSubtotal,
        cartTotal: cartSubtotal,
        cartCount,
        activeOrderId,
        activeOrder,
        currentView,
        customerSection,
        systemLogs,
        notifications,
        setCurrentView,
        setCustomerSection,
        setActiveOrderId,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        removeEntireCartItem,
        clearCart,
        validateOrder,
        createOrder,
        createOnlineOrder,
        createManagerOrder,
        createReservation,
        updateReservationStatus,
        advanceFulfillmentStatus,
        markFoodServed,
        dispatchDeliveryOrder,
        markOrderDelivered,
        markTakeawayPickedUp,
        reportPreparationDelay,
        reportItemUnavailable,
        requestOrderClarification,
        createServiceRequest,
        resolveServiceRequest,
        updateTableStatus,
        startDiningSession,
        getActiveSessionForTable,
        validateQRToken,
        createDineInQROrder,
        requestBillForSession,
        generateSessionBill,
        settleSessionPayment,
        completeTableCleaning,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addStaffMember,
        updateStaffMember,
        toggleStaffStatus,
        deleteStaffMember,
        startPreparingOrder,
        markOrderReady,
        processPayment,
        retryPayment,
        cancelOrder,
        clearAllOrders,
        toggleItemStock,
        toggleTopDish,
        setBatchTopDishes,
        toggleTableStatus,
        resetToDemoState,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
