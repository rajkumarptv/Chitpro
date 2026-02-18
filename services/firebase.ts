
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  enableMultiTabIndexedDbPersistence,
  terminate,
  clearIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { AppData } from "../types";

/**
 * ATTENTION: YOU MUST REPLACE THESE PLACEHOLDERS WITH YOUR OWN FIREBASE PROJECT CREDENTIALS
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a project.
 * 3. Add a Web App.
 * 4. Copy the firebaseConfig and paste it below.
 * 5. Enable Firestore Database.
 * 6. Set Security Rules to:
 *    allow read, write: if true; (for testing only!)
 */

const firebaseConfig = {
  apiKey: "AIzaSyA32u6hSd6mj4oJvlsa-EHMReKx0im2e80", // REPLACE ME
  authDomain: "chitpro-9affd.firebaseapp.com",
  projectId: "chitpro-9affd",
  storageBucket: "chitpro-9affd.firebasestorage.app",
  messagingSenderId: "7543441875879",
  appId: "1:754344187587:web:bbf672119ace7551153476"
};

const isPlaceholder = firebaseConfig.apiKey.includes("Placeholder");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable Offline Persistence with better error logging
if (!isPlaceholder) {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore Persistence: Multiple tabs open. Only one tab can have persistence enabled.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore Persistence: Browser doesn't support persistence.");
    }
  });
}

const CHIT_DOC_ID = "main-group-v1";

export const subscribeToChitData = (onUpdate: (data: AppData) => void, onError: (err: any) => void) => {
  if (isPlaceholder) {
    onError({ code: 'placeholder-config', message: 'Firebase not configured' });
    return () => {};
  }

  return onSnapshot(
    doc(db, "groups", CHIT_DOC_ID), 
    (doc) => {
      if (doc.exists()) {
        onUpdate(doc.data() as AppData);
      }
    },
    (error) => {
      console.error("Firebase Sync Error:", error);
      onError(error);
    }
  );
};

export const saveChitData = async (data: AppData) => {
  if (isPlaceholder) return;
  try {
    await setDoc(doc(db, "groups", CHIT_DOC_ID), data, { merge: true });
  } catch (error: any) {
    console.error("Firebase Save Error:", error);
    throw error;
  }
};

export const getInitialData = async (): Promise<AppData | null> => {
  if (isPlaceholder) return null;
  try {
    const docRef = doc(db, "groups", CHIT_DOC_ID);
    // Prefer cache if available to avoid "offline" errors on startup
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as AppData) : null;
  } catch (error: any) {
    console.warn("Failed to get initial data from cloud, checking cache...", error.message);
    return null;
  }
};

export const resetFirebase = async () => {
  await terminate(db);
  await clearIndexedDbPersistence(db);
  window.location.reload();
};
