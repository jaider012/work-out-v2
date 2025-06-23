import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app; 