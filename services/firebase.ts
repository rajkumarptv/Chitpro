
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
} from "firebase/firestore";
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
  apiKey: "AIzaSyA32u6hSd6mj4oJvlsa-EHMReKx0im2e80",
  authDomain: "chitpro-9affd.firebaseapp.com",
  projectId: "chitpro-9affd",
  storageBucket: "chitpro-9affd.firebasestorage.app",
  messagingSenderId: "754344187587",
  appId: "1:754344187587:web:bbf672119ace7551153476",
  measurementId: "G-SZ6RP1RSL9"
};

const isPlaceholder = firebaseConfig.apiKey.includes("Placeholder");

if (isPlaceholder) {
  console.warn("Firebase is in PLACEHOLDER mode. Cloud sync is disabled. Update services/firebase.ts with your credentials.");
} else {
  console.log("Firebase initialized with custom configuration.");
}

const app = initializeApp(firebaseConfig);

// FIX #1: Use initializeFirestore with persistentLocalCache instead of the
// deprecated enableMultiTabIndexedDbPersistence(). This is the correct API
// for Firebase SDK v9.6+ and properly enables offline persistence with
// multi-tab support without needing a separate function call.
const db = isPlaceholder
  ? initializeFirestore(app, {})
  : initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

const CHIT_DOC_ID = "main-group-v1";

export const subscribeToChitData = (
  onUpdate: (data: AppData | null) => void,
  onError: (err: any) => void
) => {
  if (isPlaceholder) {
    onError({ code: "placeholder-config", message: "Firebase not configured" });
    return () => {};
  }

  return onSnapshot(
    doc(db, "groups", CHIT_DOC_ID),
    (snapshot) => {
      // FIX #3: Handle both existing and non-existing document states.
      // Previously, if the doc didn't exist yet, onUpdate was never called,
      // causing the spinner to hang until the 5s timeout.
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as AppData);
      } else {
        // Document doesn't exist yet (fresh setup) — signal null so
        // the app knows the cloud is reachable but has no data yet.
        console.log("No cloud document found. Fresh setup — local data will be used.");
        onUpdate(null);
      }
    },
    (error) => {
      if (
        error.name === "AbortError" ||
        error.message?.includes("aborted") ||
        error.code === "cancelled"
      ) {
        return; // Silently ignore aborted requests
      }
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
    if (
      error.name === "AbortError" ||
      error.message?.includes("aborted") ||
      error.code === "cancelled"
    )
      return;
    console.error("Firebase Save Error:", error);
    throw error;
  }
};

export const getInitialData = async (): Promise<AppData | null> => {
  if (isPlaceholder) return null;
  try {
    const docRef = doc(db, "groups", CHIT_DOC_ID);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as AppData) : null;
  } catch (error: any) {
    if (
      error.name === "AbortError" ||
      error.message?.includes("aborted") ||
      error.code === "cancelled"
    )
      return null;
    console.warn("Failed to get initial data from cloud, checking cache...", error.message);
    return null;
  }
};
