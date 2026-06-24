import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, Timestamp, updateDoc, arrayUnion, arrayRemove, deleteDoc, where, limit, startAfter, QueryDocumentSnapshot, increment } from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, deleteObject } from "firebase/storage";
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
  description: string;
  publisherId?: string;
  publisherIsVerified?: boolean; // Badge recruteur vérifié
  status?: "open" | "closed";  // Statut de l'offre (open = ouvert, closed = clôturé/pourvu)
}

export interface Opportunity extends OpportunityData {
  id: string;
  saves: number;
  applicantCount: number; // Nombre de candidats (preuve sociale)
  views: number; // Nombre de vues
  createdAt: number;
  externalLink?: string;
}

const OPPORTUNITIES_COLLECTION = "opportunities";

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: "talent" | "recruiter" | "admin";
  photoURL?: string;
  bio?: string;
  location?: string;
  skills?: string;
  savedOpportunities?: string[];
  isVerified?: boolean; // Recruteur vérifié
  notifCount?: number;  // Notifs non lues (candidatures reçues)
  createdAt?: number;
}

// ─── Applications (Candidatures) ───────────────────────────────────────────
export type ApplicationStatus = "received" | "reviewing" | "accepted" | "rejected";

export interface ApplicationData {
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  talentId: string;
  talentName: string;
  talentEmail: string;
  talentSkills?: string;
  message: string;
  status: ApplicationStatus;
  recruiterId?: string;
}

export interface Application extends ApplicationData {
  id: string;
  createdAt: number;
}

const APPLICATIONS_COLLECTION = "applications";

export async function addOpportunity(data: OpportunityData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, OPPORTUNITIES_COLLECTION), {
      ...data,
      saves: 0,
      views: 0,
      createdAt: Timestamp.now(),
    });

    // Sync to Algolia
    fetch('/api/sync-opportunity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId: docRef.id })
    }).catch(console.error);

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
        status: data.status || "open",
        saves: data.saves || 0,
        applicantCount: data.applicantCount || 0,
        views: data.views || 0,
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
    // HACKATHON FIX: Fetch all and filter in memory to avoid missing Firestore composite indexes error
    const q = query(collection(db, OPPORTUNITIES_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    let opportunities: Opportunity[] = [];
    
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
        status: data.status || "open",
        saves: data.saves || 0,
        applicantCount: data.applicantCount || 0,
        views: data.views || 0,
        createdAt: data.createdAt?.toMillis() || 0,
      });
    });
    
    // Sort descending by createdAt
    opportunities.sort((a, b) => b.createdAt - a.createdAt);

    // Apply Domain filter
    if (filters.domain && filters.domain !== "Tous") {
      opportunities = opportunities.filter((o) => o.domain === filters.domain);
    }
    
    // Apply Type filter
    // UI sends the label (e.g. "Événement"), DB stores the value (e.g. "evenement")
    if (filters.type && filters.type !== "Tous") {
      const typeMapping: Record<string, string> = {
        "Emploi": "emploi",
        "Stage": "stage",
        "Événement": "evenement",
        "Formation": "formation",
        "Programme": "programme",
        "Concours": "concours"
      };
      const targetType = typeMapping[filters.type] || filters.type;
      opportunities = opportunities.filter((o) => o.type === targetType);
    }
    
    // Ignore pagination for the hackathon demo so all results show up
    const finalData = opportunities.slice(0, 50);
    
    return { data: finalData, lastDoc: null };
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
      status: data.status || "open",
      saves: data.saves || 0,
      applicantCount: data.applicantCount || 0,
      views: data.views || 0,
      createdAt: data.createdAt?.toMillis() || 0,
    };
  } catch (error) {
    console.error("Error getting opportunity by id: ", error);
    return null;
  }
}

/** Deletes an opportunity permanently (Admin only) */
export async function deleteOpportunity(opportunityId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, OPPORTUNITIES_COLLECTION, opportunityId));

    // Sync to Algolia
    fetch('/api/sync-opportunity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId })
    }).catch(console.error);
  } catch (error) {
    console.error("Error deleting opportunity: ", error);
    throw error;
  }
}

export async function updateOpportunity(id: string, data: Partial<OpportunityData & { views: number }>): Promise<void> {
  try {
    const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
    await updateDoc(docRef, { ...data });
  } catch (error) {
    console.error("Error updating opportunity: ", error);
    throw error;
  }
}

export async function incrementOpportunityViews(id: string): Promise<void> {
  try {
    const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error("Error incrementing opportunity views: ", error);
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
    const qOpps = query(
      collection(db, OPPORTUNITIES_COLLECTION),
      where("publisherId", "==", uid)
    );
    const oppsSnapshot = await getDocs(qOpps);
    const deleteOppPromises = oppsSnapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deleteOppPromises);

    // 2. Delete all applications submitted by this user (if talent)
    const qAppsAsTalent = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("talentId", "==", uid)
    );
    const appsAsTalentSnap = await getDocs(qAppsAsTalent);
    const deleteAppsAsTalent = appsAsTalentSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deleteAppsAsTalent);

    // 3. Delete all applications received by this user (if recruiter)
    const qAppsAsRecruiter = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("recruiterId", "==", uid)
    );
    const appsAsRecruiterSnap = await getDocs(qAppsAsRecruiter);
    const deleteAppsAsRecruiter = appsAsRecruiterSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deleteAppsAsRecruiter);

    // 4. Delete avatar from Firebase Storage
    try {
      const avatarRef = ref(storage, `avatars/${uid}`);
      await deleteObject(avatarRef);
    } catch (e: any) {
      // Ignore if file doesn't exist (e.code === 'storage/object-not-found')
    }

    // 5. Delete the Firestore user document
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

// ─── Application CRUD ───────────────────────────────────────────────────────

/**
 * Submits a native application for an opportunity.
 * Atomically increments the applicant counter on the opportunity.
 */
export async function submitApplication(data: ApplicationData): Promise<string> {
  try {
    // Check if talent already applied
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("opportunityId", "==", data.opportunityId)
    );
    const existing = await getDocs(q);
    const hasApplied = existing.docs.some(d => d.data().talentId === data.talentId);
    if (hasApplied) throw new Error("already_applied");

    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...data,
      status: "received",
      createdAt: Timestamp.now(),
    });

    // Increment applicant counter on the opportunity
    await updateDoc(doc(db, OPPORTUNITIES_COLLECTION, data.opportunityId), {
      applicantCount: increment(1),
    });

    // Increment unread notification count on the recruiter
    if (data.recruiterId) {
      try {
        await updateDoc(doc(db, "users", data.recruiterId), {
          notifCount: increment(1),
        });
      } catch (_) { /* recruiter doc may not exist, non-blocking */ }
    }

    return docRef.id;
  } catch (error) {
    throw error;
  }
}

/** Clears unread notification count for a recruiter after they visit the candidatures page. */
export async function clearNotifCount(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), { notifCount: 0 });
  } catch (_) { /* non-blocking */ }
}

/** Adds a lightweight "Je suis intéressé" signal for an opportunity. */
export async function addInterest(uid: string, opportunityId: string): Promise<void> {
  try {
    await updateDoc(doc(db, OPPORTUNITIES_COLLECTION, opportunityId), {
      interestCount: increment(1),
      interestedUsers: arrayUnion(uid),
    });
  } catch (error) {
    console.error("Error adding interest: ", error);
    throw error;
  }
}

/** Fetches all applications submitted by a given talent. */
export async function getApplicationsByTalent(talentId: string): Promise<Application[]> {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("talentId", "==", talentId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as ApplicationData),
      createdAt: (d.data().createdAt as Timestamp)?.toMillis() || 0,
    })).sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error getting talent applications: ", error);
    return [];
  }
}

/** Fetches all applications received for opportunities published by a recruiter. */
export async function getApplicationsByRecruiter(recruiterId: string): Promise<Application[]> {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("recruiterId", "==", recruiterId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as ApplicationData),
      createdAt: (d.data().createdAt as Timestamp)?.toMillis() || 0,
    })).sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error getting recruiter applications: ", error);
    return [];
  }
}

/** Updates the status of an application. */
export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, applicationId), { status });
  } catch (error) {
    console.error("Error updating application status: ", error);
    throw error;
  }
}

/** Closes an opportunity (marks it as clôturé/pourvu). */
export async function closeOpportunity(opportunityId: string): Promise<void> {
  try {
    await updateDoc(doc(db, OPPORTUNITIES_COLLECTION, opportunityId), { status: "closed" });
    
    // Sync to Algolia
    fetch('/api/sync-opportunity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId })
    }).catch(console.error);
  } catch (error) {
    console.error("Error closing opportunity: ", error);
    throw error;
  }
}

/** Re-opens a previously closed opportunity. */
export async function openOpportunity(opportunityId: string): Promise<void> {
  try {
    await updateDoc(doc(db, OPPORTUNITIES_COLLECTION, opportunityId), { status: "open" });

    // Sync to Algolia
    fetch('/api/sync-opportunity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId })
    }).catch(console.error);
  } catch (error) {
    console.error("Error reopening opportunity: ", error);
    throw error;
  }
}

// --- ADMIN FUNCTIONS ───────────────────────────────────────────────────────

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: UserProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push({ id: docSnap.id, ...docSnap.data() } as UserProfile);
    });
    return users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error("Error getting all users: ", error);
    return [];
  }
}

export async function updateUserRole(userId: string, role: "talent" | "recruiter" | "admin"): Promise<void> {
  try {
    await updateDoc(doc(db, "users", userId), { role });
  } catch (error) {
    console.error("Error updating user role: ", error);
    throw error;
  }
}

