import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyCh4smYei8k7mpgbTukfNGY_pNAROYtyj0",
  authDomain: "dpsnovels.firebaseapp.com",
  projectId: "dpsnovels",
  storageBucket: "dpsnovels.firebasestorage.app",
  messagingSenderId: "371447087044",
  appId: "1:371447087044:web:e8e38330223f42f3e86e91",
  measurementId: "G-YST6N4BQQE"
};

const app = (firebaseApp as any).initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);