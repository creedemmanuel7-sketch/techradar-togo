import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (server-side only)
// Uses environment variable for service account if available,
// otherwise falls back to application default credentials.
function getAdminDb() {
  if (!getApps().length) {
    // In production (Vercel), use GOOGLE_APPLICATION_CREDENTIALS or default ADC
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return getFirestore();
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface NotifyPayload {
  type: "new_application";
  recruiterId: string;
  recruiterName?: string;
  talentName: string;
  talentEmail: string;
  opportunityTitle: string;
  organization: string;
  message: string;
  applicationId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: NotifyPayload = await req.json();

    if (body.type === "new_application") {
      // Fetch recruiter email from Firestore (server-side)
      let recruiterEmail = "";
      let recruiterName = body.recruiterName || "Recruteur";

      try {
        const adminDb = getAdminDb();
        const recruiterDoc = await adminDb.collection("users").doc(body.recruiterId).get();
        if (recruiterDoc.exists) {
          recruiterEmail = recruiterDoc.data()?.email || "";
          recruiterName = recruiterDoc.data()?.name || recruiterName;
        }
      } catch (adminErr) {
        console.warn("Firebase Admin not available, skipping email:", adminErr);
        return NextResponse.json({ ok: true, skipped: true });
      }

      if (!recruiterEmail) {
        console.warn("No recruiter email found for UID:", body.recruiterId);
        return NextResponse.json({ ok: true, skipped: true });
      }

      const { data, error } = await resend.emails.send({
        from: "TechRadar Togo <notifications@resend.dev>",
        to: [recruiterEmail],
        subject: `📩 Nouvelle candidature — ${body.opportunityTitle}`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouvelle candidature</title>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Segoe UI',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#C9A84C,#F5E6A3);padding:24px 32px;">
              <span style="background:rgba(0,0,0,0.2);display:inline-block;padding:8px 14px;border-radius:10px;color:#000;font-weight:800;font-size:16px;">TR</span>
              <span style="color:#000;font-weight:800;font-size:18px;margin-left:10px;vertical-align:middle;">TechRadar Togo</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">📩 Nouvelle candidature reçue</h1>
              <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:14px;">Bonjour ${recruiterName}, un talent vient de postuler à votre offre.</p>

              <div style="background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:11px;color:rgba(201,168,76,0.7);text-transform:uppercase;letter-spacing:1px;">Offre concernée</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#C9A84C;">${body.opportunityTitle}</p>
                <p style="margin:2px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">${body.organization}</p>
              </div>

              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:rgba(255,255,255,0.8);">👤 Candidat</p>
                <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff;">${body.talentName}</p>
                <a href="mailto:${body.talentEmail}" style="color:#C9A84C;font-size:13px;">${body.talentEmail}</a>
              </div>

              <div style="background:rgba(255,255,255,0.03);border-left:3px solid #C9A84C;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:32px;">
                <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;">Message de motivation</p>
                <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;">${body.message}</p>
              </div>

              <div style="text-align:center;">
                <a href="https://techradar-togo.vercel.app/candidatures"
                  style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#F5E6A3);color:#000;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                  Gérer les candidatures →
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);text-align:center;">
                TechRadar Togo · La marketplace des talents tech au Togo<br/>
                <a href="https://techradar-togo.vercel.app" style="color:rgba(201,168,76,0.6);">techradar-togo.vercel.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ error }, { status: 400 });
      }

      return NextResponse.json({ ok: true, id: data?.id });
    }

    return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
  } catch (err) {
    console.error("Notify route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
