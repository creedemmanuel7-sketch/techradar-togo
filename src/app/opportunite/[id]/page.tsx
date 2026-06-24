import { getOpportunityById } from "@/lib/db";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ArrowLeft, MapPin, Clock, Building2, Layers, Users } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { OpportuniteActions } from "./OpportuniteActions";

// Génération dynamique des balises SEO (Meta Tags, OpenGraph)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const opp = await getOpportunityById(id);

  if (!opp) {
    return {
      title: "Opportunité Introuvable | TechRadar Togo",
      description: "Cette opportunité n'existe pas ou a été supprimée.",
    };
  }

  return {
    title: `${opp.title} chez ${opp.organization} | TechRadar Togo`,
    description: opp.description.substring(0, 160) + (opp.description.length > 160 ? "..." : ""),
    openGraph: {
      title: `${opp.title} - ${opp.organization}`,
      description: opp.description.substring(0, 160),
      type: "website",
      locale: "fr_TG",
      siteName: "TechRadar Togo",
    },
  };
}

export default async function OpportunitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opp = await getOpportunityById(id);

  if (!opp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-bold">Opportunité introuvable</h1>
        <p className="text-white/50">Cette page n'existe pas ou a été supprimée.</p>
        <Link href="/explorer" className="text-[#C9A84C] hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour au Radar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24 px-4 sm:px-6">
      {/* BREADCRUMB */}
      <div className="w-full max-w-4xl mx-auto mt-10 mb-8">
        <Link href="/explorer" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au Radar
        </Link>
      </div>

      <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* HERO CARD */}
        <div className="glass rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden">
          {/* Gradient background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <CategoryBadge type={opp.type} label={opp.typeLabel} />
                {/* Status badge */}
                {opp.status === "closed" ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                    🔴 Offre pourvue
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                    🟢 Offre ouverte
                  </span>
                )}
                {/* Applicant count */}
                {(opp.applicantCount || 0) > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                    <Users className="w-3 h-3" />
                    {opp.applicantCount} candidature{opp.applicantCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight">{opp.title}</h1>
              <p className="text-[#C9A84C] text-xl font-bold">{opp.organization}</p>
            </div>

            {/* Client Component: Boutons Interactifs (Favoris, Partager, Supprimer, Postuler) */}
            <OpportuniteActions opp={opp} />
          </div>

          {/* METADATA PILLS */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: MapPin, value: opp.location, label: "Lieu" },
              { icon: Layers, value: opp.domain, label: "Domaine" },
              { icon: Building2, value: opp.level, label: "Niveau" },
              ...(opp.deadline ? [{ icon: Clock, value: opp.deadline, label: "Date limite" }] : []),
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
                <Icon className="w-4 h-4 text-[#C9A84C]" />
                <div>
                  <p className="text-xs text-white/40">{label}</p>
                  <p className="text-sm font-semibold text-white">{value || "Non précisé"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="glass rounded-3xl p-8 sm:p-12 mb-8">
          <h2 className="text-xl font-bold mb-5 text-white/80">Description de l'opportunité</h2>
          {opp.description ? (
            <div className="text-white/70 leading-relaxed text-base whitespace-pre-wrap">
              {opp.description}
            </div>
          ) : (
            <div className="text-white/30 italic text-sm">
              Aucune description fournie. Pour plus d'informations, utilisez le lien pour postuler.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
