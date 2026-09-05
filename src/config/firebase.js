import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getAuth } from 'firebase-admin/auth';
import logger from '../utils/logger.js';

let firebaseApp = null;
let messagingInstance = null;
let authInstance = null;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    firebaseApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    messagingInstance = getMessaging(firebaseApp);
    authInstance = getAuth(firebaseApp);
    logger.info('Firebase Admin SDK initialized successfully.');
  } else {
    logger.warn('Firebase credentials not fully specified in environment. FCM/SMS services will run in mock mode.');
  }
} catch (err) {
  logger.error('Error initializing Firebase Admin SDK:', err.message);
}

export const messaging = messagingInstance;
export const auth = authInstance;
export default firebaseApp;
