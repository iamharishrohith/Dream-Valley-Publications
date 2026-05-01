import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const isProduction = process.env.NODE_ENV === 'production';

if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
        console.log('Firebase Admin initialized');
    } else {
        if (isProduction) {
            throw new Error('Firebase Admin credentials are incomplete in production.');
        }

        initializeApp({ projectId: projectId || 'dvp-local-dev' });
        console.log('Firebase Admin initialized in local mode');
    }
}

export const auth = getAuth();
export const firestore = getFirestore();

export async function getCollection<T>(collection: string): Promise<(T & { id: string })[]> {
    const snapshot = await firestore.collection(collection).orderBy('created_at', 'desc').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }));
}

export async function getDoc<T>(collection: string, id: string): Promise<(T & { id: string }) | null> {
    const doc = await firestore.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T & { id: string };
}

export async function createDoc<T extends Record<string, any>>(collection: string, data: T): Promise<T & { id: string }> {
    const id = crypto.randomUUID();
    const docData = { ...data, created_at: new Date().toISOString() };
    await firestore.collection(collection).doc(id).set(docData);
    return { id, ...docData };
}

export async function updateDoc<T extends Record<string, any>>(collection: string, id: string, data: Partial<T>): Promise<void> {
    await firestore.collection(collection).doc(id).update(data);
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
    await firestore.collection(collection).doc(id).delete();
}

export async function queryCollection<T>(
    collection: string,
    filters: { field: string; op: FirebaseFirestore.WhereFilterOp; value: any }[]
): Promise<(T & { id: string })[]> {
    let query: FirebaseFirestore.Query = firestore.collection(collection);
    for (const filter of filters) {
        query = query.where(filter.field, filter.op, filter.value);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T & { id: string }));
}

export async function verifyToken(idToken: string) {
    try {
        return await auth.verifyIdToken(idToken);
    } catch {
        return null;
    }
}
