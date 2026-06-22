import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
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
}

export interface Opportunity extends OpportunityData {
  id: string;
  saves: number;
  createdAt: number; // Unix timestamp for easy sorting
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
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      opportunities.push({
        id: doc.id,
        title: data.title,
        organization: data.organization,
        type: data.type,
        typeLabel: data.typeLabel,
        domain: data.domain,
        level: data.level,
        location: data.location,
        deadline: data.deadline,
        externalLink: data.externalLink,
        saves: data.saves || 0,
        createdAt: data.createdAt?.toMillis() || 0,
      });
    });
    
    return opportunities;
  } catch (error) {
    console.error("Error getting opportunities: ", error);
    // Return empty array instead of throwing to prevent page crashes during DB issues
    return []; 
  }
}
