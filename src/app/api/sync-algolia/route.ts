import { NextResponse } from "next/server";
import { algoliaAdmin, INDEX_NAME } from "@/lib/algolia-admin";
import { extractField, FirestoreDoc } from "@/lib/firestore-utils";
import { headers } from "next/headers";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_REST_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/opportunities`;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

async function fetchAllDocs(): Promise<FirestoreDoc[]> {
  const all: FirestoreDoc[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = nextPageToken
      ? `${FIRESTORE_REST_URL}?pageToken=${nextPageToken}`
      : FIRESTORE_REST_URL;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Firestore REST error: ${res.status} ${await res.text()}`);
    }
    const json = await res.json();
    if (json.documents) {
      all.push(...json.documents);
    }
    nextPageToken = json.nextPageToken;
  } while (nextPageToken);

  return all;
}

export async function GET() {
  // Verify internal API key for security
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  
  if (!INTERNAL_API_KEY || authHeader !== `Bearer ${INTERNAL_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const docs = await fetchAllDocs();

    const objects = docs.map((doc: FirestoreDoc) => {
      const f = doc.fields || {};
      const id = doc.name.split("/").pop()!;
      return {
        objectID: id,
        title: extractField(f.title) || "",
        organization: extractField(f.organization) || "",
        type: extractField(f.type) || "",
        typeLabel: extractField(f.typeLabel) || "",
        domain: extractField(f.domain) || "",
        level: extractField(f.level) || "",
        location: extractField(f.location) || "",
        description: extractField(f.description) || "",
        deadline: extractField(f.deadline) || "",
        status: extractField(f.status) || "open",
        createdAt: extractField(f.createdAt) || Date.now(),
      };
    });

    await algoliaAdmin.saveObjects({
      indexName: INDEX_NAME,
      objects,
    });

    return NextResponse.json({ ok: true, count: objects.length });
  } catch (err: any) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
