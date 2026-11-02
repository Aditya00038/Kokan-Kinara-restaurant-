import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';

const ORDERS_COL = 'orders';
const TABLES_COL = 'tables';
const MENU_COL = 'menu';
const LOGS_COL = 'systemLogs';

// Real-time listener for Orders
export const subscribeOrders = (onUpdate, onError) => {
  try {
    const q = query(collection(db, ORDERS_COL), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach(docSnap => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(orders);
    }, (err) => {
      console.warn('Firebase orders subscription fallback:', err);
      if (onError) onError(err);
    });
  } catch (err) {
    console.warn('Firestore subscription unavailable:', err);
    return () => {};
  }
};

// Add or save order to Firebase
export const saveOrderToFirebase = async (order) => {
  try {
    const docRef = doc(db, ORDERS_COL, order.id);
    await setDoc(docRef, {
      ...order,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn('Could not sync order to Firebase:', err);
    return false;
  }
};

// Update order status/payment
export const updateOrderInFirebase = async (orderId, updates) => {
  try {
    const docRef = doc(db, ORDERS_COL, orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn('Could not update order in Firebase:', err);
    return false;
  }
};

// Real-time listener for Tables
export const subscribeTables = (onUpdate) => {
  try {
    return onSnapshot(collection(db, TABLES_COL), (snapshot) => {
      if (snapshot.empty) return;
      const tables = [];
      snapshot.forEach(docSnap => {
        tables.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(tables);
    }, (err) => {
      console.warn('Tables subscription note:', err);
    });
  } catch (err) {
    console.warn('Firestore tables unavailable:', err);
    return () => {};
  }
};

// Sync table status
export const updateTableInFirebase = async (tableId, status) => {
  try {
    const docRef = doc(db, TABLES_COL, tableId);
    await setDoc(docRef, { id: tableId, status, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Could not update table in Firebase:', err);
    return false;
  }
};

// Add system log
export const addSystemLogToFirebase = async (log) => {
  try {
    await addDoc(collection(db, LOGS_COL), {
      ...log,
      timestamp: serverTimestamp()
    });
    return true;
  } catch {
    return false;
  }
};
