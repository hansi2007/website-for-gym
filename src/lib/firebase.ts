import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { GymSettings } from '../types';

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test per SKILL.md
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'gymSettings', 'general'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore offline or connecting: check Firebase network settings.");
    }
  }
}

// Default verified business profile
export const DEFAULT_BUSINESS_SETTINGS: GymSettings = {
  businessName: 'Sri Maruthi Power House Gym 24/7 (Best Gym Near Me)',
  address: '2nd Floor, MNT Complex, No. 523, Jigani - Anekal Road, opposite SLV Bar, Vinayaka Nagar, Jigani, Bengaluru, Karnataka 560105, India.',
  phone: '+91 99454 57747',
  whatsappNumber: '919945457747',
  googleMapsUrl: 'https://maps.app.goo.gl/c2u15pLQEHF3tXzv5',
  openingHours: 'Open 24 hours, 7 days a week (Subject to confirmation)',
  ratingSnapshot: 4.9,
  reviewCountSnapshot: 833,
  is24x7Confirmed: true,
  announcement: 'Welcome to Sri Maruthi Power House Gym! Experience high-energy strength training in Jigani.',
  heroHeadline: 'YOUR STRENGTH. YOUR JOURNEY. YOUR FUTURE.',
  heroSubheadline: 'TRAIN STRONG. LIVE STRONGER. Jigani\'s premier fitness destination equipped with advanced machinery, free weights, and dedicated certified coaches.',
};

export const ADMIN_BOOTSTRAP_EMAIL = 'www.hansika2007@gmail.com';
