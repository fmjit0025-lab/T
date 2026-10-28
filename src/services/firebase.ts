import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { FirebaseConfigState } from '../types';

const STORAGE_KEY_FIREBASE_CONFIG = 'stockpulse_firebase_config';

export function getSavedFirebaseConfig(): FirebaseConfigState {
  const envConfig: FirebaseConfigState = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    isConfigured: false,
    useLiveFirebase: false,
  };

  const hasEnv = Boolean(envConfig.apiKey && envConfig.projectId);
  if (hasEnv) {
    envConfig.isConfigured = true;
    envConfig.useLiveFirebase = true;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...envConfig,
        ...parsed,
        isConfigured: Boolean(parsed.apiKey && parsed.projectId),
      };
    }
  } catch (e) {
    console.error('Error reading saved firebase config:', e);
  }

  return envConfig;
}

export function saveFirebaseConfig(config: FirebaseConfigState): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseInstances(): { app: FirebaseApp | null; db: Firestore | null } {
  const config = getSavedFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.useLiveFirebase) {
    return { app: null, db: null };
  }

  try {
    if (!appInstance) {
      if (getApps().length > 0) {
        appInstance = getApp();
      } else {
        appInstance = initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        });
      }
    }
    if (!firestoreInstance && appInstance) {
      firestoreInstance = getFirestore(appInstance);
    }
    return { app: appInstance, db: firestoreInstance };
  } catch (err) {
    console.warn('Firebase init warning / fallback to local storage:', err);
    return { app: null, db: null };
  }
}

export { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  writeBatch 
};
