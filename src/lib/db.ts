import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, Timestamp } from "firebase/firestore";
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
