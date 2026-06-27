"use client";

import { FileText, AlertTriangle, CheckCircle, Scale } from "lucide-react";
import Link from "next/link";

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-[#C9A84C] hover:underline text-sm mb-4 inline-block">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Conditions d'Utilisation
          </h1>
          <p className="text-white/50 text-lg">
            Dernière mise à jour : Juin 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Acceptation des conditions</h2>
                <p className="text-white/60 leading-relaxed">
                  En utilisant TechRadar Togo, vous acceptez ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, n'utilisez pas notre plateforme.
                </p>
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Éligibilité</h2>
                <p className="text-white/60 leading-relaxed">
                  Pour utiliser TechRadar Togo, vous devez :
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-white/70 ml-16">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Être âgé d'au moins 18 ans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Avoir la capacité légale de contracter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Fournir des informations exactes et véridiques</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Ne pas utiliser la plateforme à des fins illégales</span>
              </li>
            </ul>
          </div>

          {/* User Responsibilities */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Responsabilités des utilisateurs</h2>
                <p className="text-white/60 leading-relaxed">
                  En utilisant TechRadar Togo, vous vous engagez à :
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-white/70 ml-16">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Ne pas publier de contenu offensant, discriminatoire ou illégal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Ne pas usurper l'identité d'autrui</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Ne pas spammer ou envoyer des messages non sollicités</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Respecter les droits de propriété intellectuelle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Ne pas tenter de compromettre la sécurité de la plateforme</span>
              </li>
            </ul>
          </div>

          {/* Content Policy */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">Politique de contenu</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              TechRadar Togo se réserve le droit de modérer ou supprimer tout contenu qui :
            </p>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Violent ces conditions d'utilisation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Est inapproprié ou offensant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Contestable ou trompeur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Enfreint les droits d'un tiers</span>
              </li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Propriété intellectuelle</h2>
                <p className="text-white/60 leading-relaxed">
                  Le contenu de TechRadar Togo (design, code, texte, logos) est protégé par les lois sur la propriété intellectuelle.
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-white/70 ml-16">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Vous ne pouvez pas copier, modifier ou distribuer notre contenu sans autorisation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Les opportunités publiées restent la propriété de leurs auteurs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>En publiant du contenu, vous nous accordez une licence d'utilisation</span>
              </li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">Limitation de responsabilité</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              TechRadar Togo est fourni "tel quel" sans garantie d'aucune sorte. Nous ne sommes pas responsables de :
            </p>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>La qualité ou la pertinence des opportunités publiées</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Les interactions entre talents et recruteurs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Les pertes ou dommages résultant de l'utilisation de la plateforme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Les interruptions de service ou pannes techniques</span>
              </li>
            </ul>
          </div>

          {/* Termination */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">Résiliation</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Nous nous réservons le droit de :
            </p>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Suspendre ou résilier votre compte en cas de violation de ces conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Modifier ces conditions à tout moment (les utilisateurs seront notifiés)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Arrêter ou modifier la plateforme sans préavis</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4 text-[#C9A84C]">Questions ?</h2>
            <p className="text-white/70 leading-relaxed">
              Pour toute question concernant ces conditions d'utilisation, n'hésitez pas à nous contacter :
            </p>
            <p className="text-white font-medium mt-2">
              📧 creedemmanuel7@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
