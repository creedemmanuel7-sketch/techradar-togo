"use client";

import { Shield, Eye, Lock, Database } from "lucide-react";
import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-[#C9A84C] hover:underline text-sm mb-4 inline-block">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Politique de Confidentialité
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
                <Shield className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Notre engagement</h2>
                <p className="text-white/60 leading-relaxed">
                  TechRadar Togo s'engage à protéger la vie privée de ses utilisateurs. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.
                </p>
              </div>
            </div>
          </div>

          {/* Data Collection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Données collectées</h2>
                <p className="text-white/60 leading-relaxed">
                  Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme :
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-white/70 ml-16">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span><strong>Informations de compte :</strong> Nom, email, mot de passe (hashé)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span><strong>Profil professionnel :</strong> Compétences, bio, localisation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span><strong>Données techniques :</strong> Appareil, navigateur, source d'inscription</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span><strong>Données d'authentification :</strong> Provider (Email, Google, GitHub)</span>
              </li>
            </ul>
          </div>

          {/* Data Usage */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Utilisation des données</h2>
                <p className="text-white/60 leading-relaxed">
                  Vos données sont utilisées pour :
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-white/70 ml-16">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Faire fonctionner l'algorithme de matching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Vous connecter avec les recruteurs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Vous envoyer des notifications pertinentes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Améliorer la plateforme (analytics anonymisés)</span>
              </li>
            </ul>
          </div>

          {/* Data Protection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Protection des données</h2>
                <p className="text-white/60 leading-relaxed">
                  Nous prenons des mesures strictes pour protéger vos informations :
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-white/70 ml-16">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Stockage sécurisé sur Firebase (certifié SOC 2 Type II)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Mots de passe hashés (jamais stockés en clair)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Connexions chiffrées (HTTPS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Accès restreint par rôle (talent/recruteur/admin)</span>
              </li>
            </ul>
          </div>

          {/* Rights */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">Vos droits</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Conformément au RGPD, vous avez le droit de :
            </p>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Accéder à vos données personnelles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Demander la correction de vos données</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Demander la suppression de votre compte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Exporter vos données</span>
              </li>
            </ul>
            <p className="text-white/50 text-sm mt-4">
              Pour exercer ces droits, contactez-nous à : privacy@techradar.tg
            </p>
          </div>

          {/* Contact */}
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4 text-[#C9A84C]">Questions ?</h2>
            <p className="text-white/70 leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles, n'hésitez pas à nous contacter :
            </p>
            <p className="text-white font-medium mt-2">
              📧 privacy@techradar.tg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
