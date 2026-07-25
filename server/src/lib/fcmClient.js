import { initializeApp, cert, getApps } from 'firebase-admin/app'

export function createFcmClient() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccount) return null

  if (getApps().length === 0) {
    const credential = serviceAccount.startsWith('{')
      ? cert(JSON.parse(serviceAccount))
      : cert(serviceAccount)

    initializeApp({ credential })
  }

  return import('firebase-admin/messaging').then(({ getMessaging }) => getMessaging())
}
