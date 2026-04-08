import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.replace(/^=/, ""),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

// Use the provided database ID, but handle the "(default)" case standardly
export const db = databaseId && databaseId !== '(default)'
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Connection test as per guidelines
async function testConnection() {
  try {
    // Try to fetch a non-existent doc from server to verify config
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    if (error.message && error.message.includes('the client is offline')) {
      console.error("Firestore Configuration Error: The client is offline. This usually means the Project ID, API Key, or Database ID in your environment variables is incorrect, or Firestore is not enabled for this project.");
    }
  }
}

testConnection();
