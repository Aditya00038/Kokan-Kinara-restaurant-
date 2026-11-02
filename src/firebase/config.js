import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAFq3tacDRDM8OlR4xDX9mLB0dUW1x5EQ8",
  authDomain: "auth-3ea33.firebaseapp.com",
  projectId: "auth-3ea33",
  storageBucket: "auth-3ea33.firebasestorage.app",
  messagingSenderId: "218182006704",
  appId: "1:218182006704:web:f893c04cbf0dc0d1900875"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
