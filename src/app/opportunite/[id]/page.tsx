import { getOpportunityById } from "@/lib/db";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ArrowLeft, MapPin, Clock, Building2, Layers, ExternalLink } from "lucide-react";
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
              <div className="mb-4">
                <CategoryBadge type={opp.type} label={opp.typeLabel} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight">{opp.title}</h1>
              <p className="text-[#C9A84C] text-xl font-bold">{opp.organization}</p>
            </div>

            {/* Client Component: Boutons Interactifs (Favoris, Partager, Supprimer) */}
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

        {/* CTA BOTTOM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass rounded-3xl px-8 py-6">
          <div>
            <p className="font-bold text-lg">Intéressé(e) par cette opportunité ?</p>
            <p className="text-sm text-white/50">Ne laissez pas passer votre chance dans l'écosystème tech togolais.</p>
          </div>
          {opp.externalLink ? (
            <a
              href={opp.externalLink}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 flex items-center gap-2.5 bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity"
            >
              Postuler <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-white/30 text-sm">Lien indisponible</span>
          )}
        </div>
      </div>
    </div>
  );
}
