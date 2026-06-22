import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AProposPage() {
  return (
    <div className="flex flex-col items-center pb-24 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto mt-10 mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
      </div>

      <div className="w-full max-w-4xl mx-auto glass rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-4xl font-extrabold mb-6 text-white">À propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3]">TechRadar Togo</span></h1>
        
        <div className="space-y-6 text-white/70 leading-relaxed">
          <p>
            <strong>TechRadar Togo</strong> est une plateforme communautaire conçue pour centraliser, valoriser et connecter l'écosystème tech togolais.
          </p>
          <p>
            Né dans le cadre d'un hackathon (#BuildForTheCommunity en 72h), ce projet vise à résoudre un problème majeur : la dispersion des opportunités (emplois, stages, formations, appels à projets) dans le domaine de la technologie au Togo.
          </p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Notre Mission</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Connecter :</strong> Rapprocher les talents (développeurs, designers, data scientists) des recruteurs et entreprises.</li>
            <li><strong>Informer :</strong> Mettre en lumière les événements tech, hackathons et formations disponibles localement.</li>
            <li><strong>Valoriser :</strong> Donner de la visibilité aux startups et projets innovants de la sous-région.</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contribuer</h2>
          <p>
            TechRadar Togo est pensé par la communauté, pour la communauté. Toute entreprise ou particulier peut publier une opportunité gratuitement pour aider l'écosystème à grandir.
          </p>
        </div>
      </div>
    </div>
  );
}
