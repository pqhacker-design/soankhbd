import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { FullLessonPlan, UserProfile } from './types';

// Initialize Firebase App
const app = getApps().length === 0
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    })
  : getApps()[0];

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection references
const USERS_COLLECTION = 'users';
const LESSON_PLANS_COLLECTION = 'lesson_plans';

/**
 * Sync or load users list from Firestore.
 * If Firestore is empty, seed with default users.
 */
export async function syncUsersWithFirestore(defaultUsers: UserProfile[]): Promise<UserProfile[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    if (querySnapshot.empty) {
      // Seed default users to Firestore
      for (const u of defaultUsers) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), {
          ...u,
          updatedAt: new Date().toISOString(),
        });
      }
      return defaultUsers;
    }

    const fetchedUsers: UserProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      fetchedUsers.push({
        id: data.id || docSnap.id,
        name: data.name || '',
        email: data.email || '',
        password: data.password || '123456',
        role: data.role || 'Giáo viên',
        school: data.school || '',
        department: data.department || '',
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });
    });

    // If default users are missing from fetched list, merge them
    for (const defU of defaultUsers) {
      if (!fetchedUsers.some((u) => u.id === defU.id)) {
        await setDoc(doc(db, USERS_COLLECTION, defU.id), {
          ...defU,
          updatedAt: new Date().toISOString(),
        });
        fetchedUsers.push(defU);
      }
    }

    return fetchedUsers;
  } catch (err) {
    console.error('Error syncing users with Firestore:', err);
    return defaultUsers;
  }
}

/**
 * Save or update a single user profile in Firestore
 */
export async function saveUserToFirestore(user: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
  }
}

/**
 * Save all users to Firestore
 */
export async function saveAllUsersToFirestore(users: UserProfile[]): Promise<void> {
  try {
    for (const u of users) {
      await saveUserToFirestore(u);
    }
  } catch (err) {
    console.error('Error saving users to Firestore:', err);
  }
}

/**
 * Fetch user-specific Gemini API Key from Firestore
 */
export async function getUserApiKeyFromFirestore(userId: string): Promise<string> {
  if (!userId) return '';
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return (data.geminiApiKey || '').toString().trim();
    }
  } catch (err) {
    console.error('Error fetching user API key from Firestore:', err);
  }
  return '';
}

/**
 * Save user-specific Gemini API Key to Firestore
 */
export async function setUserApiKeyInFirestore(userId: string, apiKey: string): Promise<void> {
  if (!userId) return;
  try {
    await setDoc(
      doc(db, USERS_COLLECTION, userId),
      {
        geminiApiKey: apiKey.trim(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving user API key to Firestore:', err);
  }
}

/**
 * Fetch lesson plans for a specific user ID from Firestore.
 */
export async function fetchUserLessonPlansFromFirestore(
  userId: string,
  initialSamplePlan?: FullLessonPlan
): Promise<FullLessonPlan[]> {
  if (!userId) return initialSamplePlan ? [initialSamplePlan] : [];
  try {
    const q = query(
      collection(db, LESSON_PLANS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If no plans exist for this user yet, and sample plan provided, seed initial sample plan for this user
      if (initialSamplePlan) {
        const userSample = {
          ...initialSamplePlan,
          id: `lp-${userId}-sample-1`,
          userId,
          info: {
            ...initialSamplePlan.info,
            teacherName: initialSamplePlan.info.teacherName,
          },
        };
        await setDoc(doc(db, LESSON_PLANS_COLLECTION, userSample.id), userSample);
        return [userSample];
      }
      return [];
    }

    const plans: FullLessonPlan[] = [];
    querySnapshot.forEach((docSnap) => {
      plans.push(docSnap.data() as FullLessonPlan);
    });

    // Sort by updatedAt or createdAt descending
    plans.sort((a, b) => {
      const tA = new Date(b.updatedAt || b.createdAt || 0).getTime();
      const tB = new Date(a.updatedAt || a.createdAt || 0).getTime();
      return tA - tB;
    });

    return plans;
  } catch (err) {
    console.error(`Error fetching lesson plans for user ${userId} from Firestore:`, err);
    return initialSamplePlan ? [initialSamplePlan] : [];
  }
}

/**
 * Save or update a lesson plan in Firestore for a given user.
 */
export async function saveLessonPlanToFirestore(
  plan: FullLessonPlan,
  userId: string
): Promise<void> {
  if (!userId || !plan.id) return;
  try {
    const docData: FullLessonPlan & { userId: string } = {
      ...plan,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, LESSON_PLANS_COLLECTION, plan.id), docData, { merge: true });
  } catch (err) {
    console.error(`Error saving lesson plan ${plan.id} to Firestore:`, err);
  }
}

/**
 * Delete a lesson plan from Firestore.
 */
export async function deleteLessonPlanFromFirestore(planId: string): Promise<void> {
  if (!planId) return;
  try {
    await deleteDoc(doc(db, LESSON_PLANS_COLLECTION, planId));
  } catch (err) {
    console.error(`Error deleting lesson plan ${planId} from Firestore:`, err);
  }
}

/**
 * Import multiple lesson plans for a user to Firestore.
 */
export async function importLessonPlansToFirestore(
  plans: FullLessonPlan[],
  userId: string
): Promise<void> {
  if (!userId || plans.length === 0) return;
  try {
    for (const p of plans) {
      await saveLessonPlanToFirestore(p, userId);
    }
  } catch (err) {
    console.error('Error importing lesson plans to Firestore:', err);
  }
}
