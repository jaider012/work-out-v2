import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
// @ts-expect-error getReactNativePersistence is exported from firebase/auth but missing in the RN typings.
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJaNAhGzduWg-7ygDVrEIfY2KPsuWLgXI",
  authDomain: "fitapp-e3bcc.firebaseapp.com",
  projectId: "fitapp-e3bcc",
  storageBucket: "fitapp-e3bcc.firebasestorage.app",
  messagingSenderId: "73834506273",
  appId: "1:73834506273:web:7b094d5429137df5ec1b60",
  measurementId: "G-2N1MHH5TJ4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;
