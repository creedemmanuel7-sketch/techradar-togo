"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { Opportunity } from "@/lib/db";
import { ArrowRight, MapPin, Clock, Heart, Search, Briefcase, GraduationCap, Calendar, Rocket, Trophy, Target, Shield, Layout, Database } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TYPE_FILTER_OPTIONS } from "@/lib/constants";

interface HomeClientProps {
  latestOpportunities: Opportunity[];
  totalCount: number;
}

export function HomeClient({ latestOpportunities, totalCount }: HomeClientProps) {
  
  const getIconForCategory = (type: string) => {
    switch (type) {
      case 'stage': return <GraduationCap className="w-5 h-5" />;
      case 'emploi': return <Briefcase className="w-5 h-5" />;
      case 'evenement': return <Calendar className="w-5 h-5" />;
      case 'formation': return <Target className="w-5 h-5" />;
      case 'programme': return <Rocket className="w-5 h-5" />;
      case 'concours': return <Trophy className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col items-center pb-24 px-4 sm:px-6 overflow-hidden relative">

      {/* DYNAMIC FLOATING BACKGROUND BLOBS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#C9A84C]/5 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#F5E6A3]/5 blur-[100px]"
        />
      </div>

      {/* HERO SECTION */}
      <section className="w-full max-w-5xl mx-auto mt-16 sm:mt-24 md:mt-32 mb-24 md:mb-32 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 glass glass-pill px-4 py-2 mb-8 text-xs font-semibold text-[#C9A84C]"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#A5D6A7] animate-pulse" />
            L'écosystème Tech du Togo
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
            Boostez votre carrière.
            <br />
            <motion.span 
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-white/80 via-[#C9A84C] to-white/80 bg-[length:200%_auto]"
            >
              Au même endroit.
            </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-6 text-base sm:text-lg text-white/50 max-w-2xl mx-auto font-medium tracking-wide"
          >
            Découvrez les meilleures opportunités technologiques au Togo. Stages, emplois, formations et événements triés sur le volet.
          </motion.p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/explorer">
              <GlassButton variant="primary" className="text-base sm:text-lg px-8 py-4 h-auto w-full sm:w-auto">
                <Search className="w-5 h-5" />
                Accéder au Radar
              </GlassButton>
            </Link>
            <Link href="/inscription">
              <GlassButton variant="ghost" className="text-base sm:text-lg px-8 py-4 h-auto w-full sm:w-auto border border-white/10">
                Créer un profil
              </GlassButton>
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            <div className="glass glass-pill px-5 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#A5D6A7] animate-pulse" />
              <span className="font-bold text-white/90">{totalCount}+</span>
              <span className="text-white/50 text-sm">opportunités actives</span>
            </div>
            <div className="glass glass-pill px-5 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4FC3F7] animate-pulse" />
              <span className="font-bold text-white/90">Talents</span>
              <span className="text-white/50 text-sm">du 228 🇹🇬</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="w-full max-w-6xl mx-auto mb-24 md:mb-32 relative z-10">
        <div className="flex flex-col items-center text-center mb-10">
           <h2 className="text-2xl sm:text-3xl font-bold mb-3">Que cherchez-vous ?</h2>
           <p className="text-white/50 text-sm sm:text-base">Naviguez par catégorie pour trouver ce qui vous correspond.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {TYPE_FILTER_OPTIONS.filter(t => t !== "Tous").map((type, index) => (
            <Link key={type} href={`/explorer?type=${encodeURIComponent(type)}`}>
              <GlassCard hoverEffect delay={index * 0.1} className="flex flex-col items-center justify-center py-8 cursor-pointer h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full glass mb-4 flex items-center justify-center text-[#C9A84C] group-hover:scale-110 transition-transform">
                  {getIconForCategory(type)}
                </div>
                <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[#F5E6A3] transition-colors">{type}</h3>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST OPPORTUNITIES SECTION */}
      <section className="w-full max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Dernières pépites</h2>
          <Link href="/explorer" className="text-[#C9A84C] font-medium text-sm flex items-center gap-1 hover:text-[#F5E6A3] transition-colors">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestOpportunities.map((opp, index) => (
            <Link key={opp.id} href={`/opportunite/${opp.id}`} className="block h-full group">
              <GlassCard hoverEffect delay={index * 0.1} className="flex flex-col h-full cursor-pointer">
                <div className="flex justify-between items-start mb-5">
                  <CategoryBadge type={opp.type} label={opp.typeLabel} />
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4 flex-1">
                  <h3 className="text-lg font-bold mb-1 leading-snug group-hover:text-[#F5E6A3] transition-colors">{opp.title}</h3>
                  <p className="text-[#C9A84C] text-sm font-medium">{opp.organization}</p>
                  {opp.description && (
                    <p className="text-white/50 text-xs mt-2 line-clamp-2">{opp.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <span className="glass glass-pill px-3 py-1 text-xs text-white/70">{opp.domain}</span>
                  <span className="glass glass-pill px-3 py-1 text-xs text-white/70">{opp.level}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-medium pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <MapPin className="w-3.5 h-3.5" /> {opp.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Clock className="w-3.5 h-3.5" /> {opp.deadline || "ASAP"}
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}

          {latestOpportunities.length === 0 && (
            <div className="col-span-full py-10 text-center text-white/40 text-sm glass rounded-3xl">
              Aucune opportunité pour le moment.{" "}
              <Link href="/soumettre" className="text-[#C9A84C] hover:underline">Soyez le premier à en publier !</Link>
            </div>
          )}
        </div>
      </section>
      
      {/* WHY US SECTION */}
      <section className="w-full max-w-6xl mx-auto mt-24 md:mt-32 mb-12 relative z-10 glass rounded-3xl p-8 sm:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Pourquoi utiliser TechRadar Togo ?</h2>
          <p className="text-white/50 max-w-2xl mx-auto">Une plateforme pensée par des développeurs togolais, pour l'écosystème togolais.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-[#C9A84C]">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Centralisé</h3>
            <p className="text-sm text-white/50">Fini les offres perdues dans les groupes WhatsApp. Tout est ici.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-[#C9A84C]">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Vérifié</h3>
            <p className="text-sm text-white/50">Seuls les recruteurs authentifiés peuvent publier sur la plateforme.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-[#C9A84C]">
              <Layout className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Design Moderne</h3>
            <p className="text-sm text-white/50">Une expérience utilisateur fluide, rapide, et agréable au quotidien.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
