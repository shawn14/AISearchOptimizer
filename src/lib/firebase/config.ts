import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Initialize Firebase Admin SDK
 * Using singleton pattern to avoid multiple initializations
 */
function initializeFirebase() {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // Initialize with service account credentials
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : {
        projectId,
        clientEmail,
        privateKey,
      }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId,
  })
}

// Initialize Firebase
const app = initializeFirebase()

// Export Firestore instance
export const db = getFirestore(app)

// Collection names
export const COLLECTIONS = {
  BRANDS: 'brands',
  PROMPTS: 'prompts',
  MONITORING_RUNS: 'monitoring_runs',
  AUDITS: 'audits',
  USERS: 'users',
  COMPETITORS: 'competitors',
  KNOWLEDGE_ARTICLES: 'knowledge_articles',
} as const
