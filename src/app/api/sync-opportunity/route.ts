import { NextRequest, NextResponse } from "next/server";
import { algoliaAdmin, INDEX_NAME } from "@/lib/algolia-admin";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

interface FirestoreDoc {
  name: string;
  fields: Record<string, any>;
}

function extractField(value: Record<string, any>): any {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return parseInt(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return new Date(value.timestampValue).getTime();
  if ("nullValue" in value) return null;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { opportunityId } = await req.json();
    if (!opportunityId) return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });

    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/opportunities/${opportunityId}`;
    const res = await fetch(url);

    if (res.status === 404) {
      // Doc deleted — remove from Algolia
      await algoliaAdmin.deleteObject({ indexName: INDEX_NAME, objectID: opportunityId });
      return NextResponse.json({ ok: true, action: "deleted" });
    }

    if (!res.ok) {
      throw new Error(`Firestore REST error: ${res.status}`);
    }

    const doc: FirestoreDoc = await res.json();
    const f = doc.fields || {};

    const object = {
      objectID: opportunityId,
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

    await algoliaAdmin.saveObject({ indexName: INDEX_NAME, body: object });

    return NextResponse.json({ ok: true, action: "saved" });
  } catch (err: any) {
    console.error("Sync opportunity error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
