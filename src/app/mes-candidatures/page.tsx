"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getApplicationsByTalent, Application } from "@/lib/db";
import { Loader2, Send, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  received:  { label: "Reçue",           icon: <Send className="w-4 h-4" />,        bg: "bg-blue-500/10",   text: "text-blue-400" },
  reviewing: { label: "En examen",       icon: <Clock className="w-4 h-4" />,       bg: "bg-yellow-500/10", text: "text-yellow-400" },
  accepted:  { label: "Acceptée 🎉",     icon: <CheckCircle2 className="w-4 h-4" />, bg: "bg-green-500/10",  text: "text-green-400" },
  rejected:  { label: "Non retenu",      icon: <XCircle className="w-4 h-4" />,     bg: "bg-red-500/10",    text: "text-red-400" },
};

export default function MesCandidaturesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/connexion"); return; }
      const data = await getApplicationsByTalent(user.uid);
      setApplications(data);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const formatDate = (ms: number) =>
    new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Mes Candidatures</h1>
          <p className="text-white/50">Suivez l'avancement de toutes vos candidatures en temps réel.</p>
        </div>

        {applications.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucune candidature</h3>
            <p className="text-white/50 text-sm mb-6">Vous n'avez pas encore postulé à une opportunité via TechRadar.</p>
            <Link href="/explorer" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-90 transition-opacity">
              Explorer les opportunités
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app, i) => {
              const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.received;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-3xl p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/opportunite/${app.opportunityId}`} className="text-lg font-bold hover:text-[#C9A84C] transition-colors line-clamp-1">
                        {app.opportunityTitle}
                      </Link>
                      <p className="text-white/50 text-sm mt-0.5">{app.organization}</p>
                      <p className="text-white/30 text-xs mt-2">Postulé le {formatDate(app.createdAt)}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${config.bg} ${config.text} text-sm font-semibold whitespace-nowrap self-start sm:self-auto`}>
                      {config.icon}
                      {config.label}
                    </div>
                  </div>

                  {app.message && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-white/40 mb-1 font-medium">Votre message</p>
                      <p className="text-sm text-white/60 line-clamp-2 italic">"{app.message}"</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
