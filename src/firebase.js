import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Modo emuladores locales: VITE_FIREBASE_EMULATORS=true en .env.local
// (Auth en :9099, Firestore en :8080 vía `firebase emulators:start`)
const useEmulators = import.meta.env.VITE_FIREBASE_EMULATORS === 'true';

// Initialize Firebase only if config is present to avoid crashing during zero-cost MVP testing
let app, db, rtdb, auth;

try {
  if (useEmulators) {
    // Proyecto demo-*: los emuladores aceptan cualquier credencial, todo queda local
    app = initializeApp({ projectId: 'demo-vani', apiKey: 'demo-key', authDomain: 'demo-vani.firebaseapp.com' });
    db = getFirestore(app);
    auth = getAuth(app);
    // "localhost" puede resolver a IPv6 (::1) y el emulador escucha en IPv4: usar 127.0.0.1
    const emuHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
    connectFirestoreEmulator(db, emuHost, 8080);
    connectAuthEmulator(auth, `http://${emuHost}:9099`, { disableWarnings: true });
    console.log("Firebase conectado a EMULADORES locales (demo-vani)");
  } else if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    auth = getAuth(app);
    console.log("Firebase initialized");
  } else {
    console.warn("Firebase config not found. Running in local simulation mode.");
  }
} catch (error) {
  console.error("Firebase initialization error", error);
}

export { db, rtdb, auth };
