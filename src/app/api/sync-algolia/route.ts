import { NextResponse } from "next/server";
import { algoliaAdmin, INDEX_NAME } from "@/lib/algolia-admin";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminDb() {
  if (!getApps().length) {
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

export async function GET() {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection("opportunities").get();

    const objects = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        objectID: doc.id,
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
    });

    // En Algolia v5, the saveObjects method is used on the client directly
    await algoliaAdmin.saveObjects({
      indexName: INDEX_NAME,
      objects: objects,
    });

    return NextResponse.json({ ok: true, count: objects.length });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
