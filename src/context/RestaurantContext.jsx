import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MENU, INITIAL_TABLES, INITIAL_ORDERS, PROMO_CODES } from '../data/initialData';
import { 
  saveOrderToFirebase, 
  updateOrderInFirebase, 
  updateTableInFirebase, 
  addSystemLogToFirebase,
  subscribeOrders 
} from '../firebase/restaurantService';
import confetti from 'canvas-confetti';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const MENU_VERSION = 'kokan_kinara_v6_clean';

  const hasDevanagari = (str) => typeof str === 'string' && /[\u0900-\u097F]/.test(str);

  const [menu, setMenu] = useState(() => {
    const savedVer = localStorage.getItem('rm_menu_version');
    const saved = localStorage.getItem('rm_menu');
    if (saved && savedVer === MENU_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        const isOutdated = Array.isArray(parsed) && parsed.some(i => hasDevanagari(i.category) || hasDevanagari(i.name));
        if (!isOutdated && parsed.length > 0) {
          return parsed;
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
        const isOutdated = Array.isArray(parsed) && parsed.some(t => hasDevanagari(t.section));
        if (!isOutdated && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved tables', e);
      }
    }
    localStorage.setItem('rm_tables', JSON.stringify(INITIAL_TABLES));
    return INITIAL_TABLES;
  });

  const [orders, setOrders] = useState(() => {
    const savedVer = localStorage.getItem('rm_menu_version');
    const saved = localStorage.getItem('rm_orders');
    if (saved && savedVer === MENU_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        const isOutdated = Array.isArray(parsed) && parsed.some(o => 
          hasDevanagari(o.customerName) || o.items?.some(i => hasDevanagari(i.name) || hasDevanagari(i.notes))
        );
        if (!isOutdated && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved orders', e);
      }
    }
    localStorage.setItem('rm_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('rm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeOrderId, setActiveOrderId] = useState('ORD-1001');
  const [currentView, setCurrentView] = useState('customer'); // 'customer' | 'kitchen' | 'cashier' | 'system' | 'flow'
  
  // Realtime System Audit Logs (Reflecting System Swimlane)
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: '25 min ago', sender: 'System', message: 'Order #ORD-1001 validated and created successfully', type: 'success' },
    { id: 2, time: '22 min ago', sender: 'Kitchen Staff', message: 'Order #ORD-1001 sent to station: Preparation commenced', type: 'info' },
    { id: 3, time: '4 min ago', sender: 'Kitchen Staff', message: 'Order #ORD-1001 flagged as READY by Chef', type: 'info' },
    { id: 4, time: '4 min ago', sender: 'System', message: 'Notified system: Bill generated for Order #ORD-1001 (₹1,206.50)', type: 'warning' }
  ]);

  // Notifications popup list
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'Firebase Connected', text: 'Realtime database synchronized with auth-3ea33', time: 'Just now' }
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
      if (prev.some(t => hasDevanagari(t.section))) {
        localStorage.setItem('rm_tables', JSON.stringify(INITIAL_TABLES));
        return INITIAL_TABLES;
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
  }, []);

  // Subscribe to Firebase Real-time updates
  useEffect(() => {
    const unsubscribe = subscribeOrders((firebaseOrders) => {
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

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
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

  // Cart operations
  const addToCart = (item, quantity = 1, notes = '') => {
    setCart(prev => {
      const existingIndex = prev.findIndex(ci => ci.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (notes) updated[existingIndex].notes = notes;
        return updated;
      } else {
        return [...prev, { ...item, quantity, notes }];
      }
    });
    notifyUser('Cart Updated', `Added ${quantity}x ${item.name} to cart`);
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => setCart([]);

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

    // Release table if dine-in
    if (targetOrder.tableId) {
      setTables(prev => prev.map(t => t.id === targetOrder.tableId ? { ...t, status: 'available' } : t));
      updateTableInFirebase(targetOrder.tableId, 'available');
    }

    addSystemLog('Cashier / Payment System', `Payment SUCCESSFUL for ${orderId} via ${paymentMethod}. Issued Receipt #${receiptNum}`, 'success');
    addSystemLog('System', `Updated order status as COMPLETED and released Table ${targetOrder.tableNumber || 'N/A'}`, 'success');
    
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
        orders,
        cart,
        activeOrderId,
        activeOrder,
        currentView,
        systemLogs,
        notifications,
        setCurrentView,
        setActiveOrderId,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        validateOrder,
        createOrder,
        startPreparingOrder,
        markOrderReady,
        processPayment,
        retryPayment,
        cancelOrder,
        toggleItemStock,
        toggleTableStatus,
        resetToDemoState
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
