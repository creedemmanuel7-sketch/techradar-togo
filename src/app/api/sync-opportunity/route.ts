import { NextRequest, NextResponse } from "next/server";
import { algoliaAdmin, INDEX_NAME } from "@/lib/algolia-admin";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminDb() {
  if (!getApps().length) {
    // Requires FIREBASE_SERVICE_ACCOUNT_KEY in production to read securely if rules are strict.
    // However, since opportunities are public readable, we can just use the default initialization if available,
    // or we can read it without auth if the DB allows public read.
    // Let's assume default credentials work (like in the other route).
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
      });
    } else {
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }
  return getFirestore();
}

export async function POST(req: NextRequest) {
  try {
    const { opportunityId } = await req.json();

    if (!opportunityId) {
      return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const docSnap = await adminDb.collection("opportunities").doc(opportunityId).get();

    if (!docSnap.exists) {
      // If it was deleted, we should remove it from Algolia
      await algoliaAdmin.deleteObject({
        indexName: INDEX_NAME,
        objectID: opportunityId
      });
      return NextResponse.json({ ok: true, action: "deleted" });
    }

    const data = docSnap.data()!;
    const object = {
      objectID: docSnap.id,
      title: data.title,
      organization: data.organization,
      type: data.type,
      typeLabel: data.typeLabel,
      domain: data.domain,
      level: data.level,
      location: data.location,
      description: data.description,
      status: data.status || "open",
      createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
    };

    await algoliaAdmin.saveObject({
      indexName: INDEX_NAME,
      body: object
    });

    return NextResponse.json({ ok: true, action: "saved" });
  } catch (err) {
    console.error("Sync opportunity error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
