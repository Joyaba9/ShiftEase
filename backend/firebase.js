/*


import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseAdminConfig from './Firebase-shiftEase.js'; // Import the Firebase Admin config

// Initialize Firebase Admin SDK
export function initializeFirebase() {
  // Check if Firebase has been initialized already
  if (initializeApp.length === 0) {
    initializeApp({
      credential: cert(firebaseAdminConfig),
      storageBucket: "your-firebase-storage-bucket", // Optional: Set storage bucket if needed
    });

    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase already initialized');
  }

  return {
    firestore: getFirestore(),
    auth: getAuth(),
  };
}


*/