import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, Timestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc, where, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { CategoryType } from "@/components/ui/CategoryBadge";

export interface OpportunityData {
  title: string;
  organization: string;
  type: CategoryType;
  typeLabel: string;
  domain: string;
  level: string;
  location: string;
  deadline: string;
  externalLink: string;
  description: string;
  publisherId?: string;
}

export interface Opportunity extends OpportunityData {
  id: string;
  saves: number;
  createdAt: number;
}

const OPPORTUNITIES_COLLECTION = "opportunities";

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: "talent" | "recruiter";
  photoURL?: string;
  bio?: string;
  location?: string;
  skills?: string;
  savedOpportunities?: string[];
  createdAt?: number;
}

export async function addOpportunity(data: OpportunityData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, OPPORTUNITIES_COLLECTION), {
      ...data,
      saves: 0,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding opportunity: ", error);
    throw error;
  }
}

export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const q = query(
      collection(db, OPPORTUNITIES_COLLECTION),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const opportunities: Opportunity[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      opportunities.push({
        id: docSnap.id,
        title: data.title,
        organization: data.organization,
        type: data.type,
        typeLabel: data.typeLabel,
        domain: data.domain,
        level: data.level,
        location: data.location,
        deadline: data.deadline,
        externalLink: data.externalLink,
        description: data.description || "",
        publisherId: data.publisherId || "",
        saves: data.saves || 0,
        createdAt: data.createdAt?.toMillis() || 0,
      });
    });
    
    return opportunities;
  } catch (error) {
    console.error("Error getting opportunities: ", error);
    return [];
  }
}

export async function getFilteredOpportunities(
  filters: { type?: string; domain?: string },
  limitCount: number = 10,
  lastVisibleDoc: QueryDocumentSnapshot | null = null
): Promise<{ data: Opportunity[]; lastDoc: QueryDocumentSnapshot | null }> {
  try {
    let constraints: any[] = [];
    
    if (filters.type && filters.type !== "Tous") {
      constraints.push(where("typeLabel", "==", filters.type));
    }
    
    if (filters.domain && filters.domain !== "Tous") {
      constraints.push(where("domain", "==", filters.domain));
    }
    
    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(limitCount));
    
    if (lastVisibleDoc) {
      constraints.push(startAfter(lastVisibleDoc));
    }
    
    const q = query(collection(db, OPPORTUNITIES_COLLECTION), ...constraints);
    
    const querySnapshot = await getDocs(q);
    const opportunities: Opportunity[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      opportunities.push({
        id: docSnap.id,
        title: data.title,
        organization: data.organization,
        type: data.type,
        typeLabel: data.typeLabel,
        domain: data.domain,
        level: data.level,
        location: data.location,
        deadline: data.deadline,
        externalLink: data.externalLink,
        description: data.description || "",
        publisherId: data.publisherId || "",
        saves: data.saves || 0,
        createdAt: data.createdAt?.toMillis() || 0,
      });
    });
    
    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
    return { data: opportunities, lastDoc };
  } catch (error) {
    console.error("Error getting filtered opportunities: ", error);
    return { data: [], lastDoc: null };
  }
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  try {
    const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      organization: data.organization,
      type: data.type,
      typeLabel: data.typeLabel,
      domain: data.domain,
      level: data.level,
      location: data.location,
      deadline: data.deadline,
      externalLink: data.externalLink,
      description: data.description || "",
      publisherId: data.publisherId || "",
      saves: data.saves || 0,
      createdAt: data.createdAt?.toMillis() || 0,
    };
  } catch (error) {
    console.error("Error getting opportunity by id: ", error);
    return null;
  }
}

export async function deleteOpportunity(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, OPPORTUNITIES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting opportunity: ", error);
    throw error;
  }
}

export async function updateOpportunity(id: string, data: Partial<OpportunityData>): Promise<void> {
  try {
    const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
    await updateDoc(docRef, { ...data });
  } catch (error) {
    console.error("Error updating opportunity: ", error);
    throw error;
  }
}

export async function toggleSavedOpportunity(uid: string, opportunityId: string, isSaving: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    if (isSaving) {
      await updateDoc(userRef, {
        savedOpportunities: arrayUnion(opportunityId)
      });
    } else {
      await updateDoc(userRef, {
        savedOpportunities: arrayRemove(opportunityId)
      });
    }
  } catch (error) {
    console.error("Error toggling saved opportunity: ", error);
    throw error;
  }
}

/**
 * Cascade-deletes all data belonging to a user:
 * 1. All their published opportunities
 * 2. Their Firestore user document
 *
 * The Firebase Auth account must be deleted separately by calling
 * auth.currentUser.delete() on the client after this function resolves.
 */
export async function deleteUserData(uid: string): Promise<void> {
  try {
    // 1. Find & delete all opportunities published by this user
    const q = query(
      collection(db, OPPORTUNITIES_COLLECTION),
      where("publisherId", "==", uid)
    );
    const snapshot = await getDocs(q);
    const deleteOppPromises = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deleteOppPromises);

    // 2. Delete the Firestore user document
    await deleteDoc(doc(db, "users", uid));
  } catch (error) {
    console.error("Error deleting user data: ", error);
    throw error;
  }
}

/**
 * Fetches all users with the role "talent".
 */
export async function getTalents(): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, "users"),
      where("role", "==", "talent")
    );
    
    const querySnapshot = await getDocs(q);
    let talents: UserProfile[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      talents.push({
        id: docSnap.id,
        name: data.name,
        email: data.email,
        role: data.role,
        photoURL: data.photoURL,
        bio: data.bio,
        location: data.location,
        skills: data.skills,
        savedOpportunities: data.savedOpportunities,
        createdAt: data.createdAt,
      });
    });
    
    // Sort locally to avoid requiring a composite index in Firestore
    talents.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    return talents;
  } catch (error) {
    console.error("Error getting talents: ", error);
    return [];
  }
}
