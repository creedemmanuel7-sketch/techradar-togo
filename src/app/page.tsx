"use client";

import { useEffect, useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { mockCategories } from "@/lib/data";
import { getOpportunities, Opportunity } from "@/lib/db";
import { ArrowRight, MapPin, Clock, Heart, Search, Briefcase, GraduationCap, Calendar, Rocket, Trophy, Target, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpps() {
      try {
        const data = await getOpportunities();
        setOpportunities(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchOpps();
  }, []);

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
    <div className="flex flex-col items-center pb-24 px-6 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="w-full max-w-5xl mx-auto mt-20 md:mt-32 mb-32 flex flex-col items-center text-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
            Toutes les opportunités tech.
            <br />
            <span className="text-white/60">Au même endroit.</span>
          </h1>
          
          <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto font-medium tracking-wide">
            Stages · Emplois · Événements · Formations · Programmes · Concours
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <GlassButton variant="primary" className="text-lg px-8 py-4 h-auto w-full sm:w-auto" onClick={() => window.location.href = '/explorer'}>
              <Search className="w-5 h-5" />
              Explorer les opportunités
            </GlassButton>
            <GlassButton variant="ghost" className="text-lg px-8 py-4 h-auto w-full sm:w-auto border border-white/5" onClick={() => window.location.href = '/soumettre'}>
              Publier une offre
            </GlassButton>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
            <div className="glass glass-pill px-6 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#A5D6A7] animate-pulse"></div>
              <span className="font-semibold text-white/90">{loading ? "..." : opportunities.length}</span>
              <span className="text-white/50 text-sm">opportunités actives</span>
            </div>
            <div className="glass glass-pill px-6 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4FC3F7] animate-pulse"></div>
              <span className="font-semibold text-white/90">Communauté</span>
              <span className="text-white/50 text-sm">en croissance</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="w-full max-w-6xl mx-auto mb-32 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {mockCategories.map((cat, index) => (
            <GlassCard key={cat.id} hoverEffect delay={index * 0.1} className="flex flex-col items-center justify-center py-8">
              <div className="w-14 h-14 rounded-full glass mb-4 flex items-center justify-center text-white/80">
                {getIconForCategory(cat.type)}
              </div>
              <h3 className="font-bold text-lg">{cat.label}</h3>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* LATEST OPPORTUNITIES SECTION */}
      <section className="w-full max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Dernières opportunités</h2>
          <a href="/explorer" className="text-[#C9A84C] font-medium text-sm flex items-center gap-1 hover:text-[#F5E6A3] transition-colors">
            Voir tout <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20 text-white/50">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.slice(0, 6).map((opp, index) => (
              <GlassCard key={opp.id} hoverEffect delay={index * 0.1} className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <CategoryBadge type={opp.type} label={opp.typeLabel} />
                  <button className="text-white/30 hover:text-white/80 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4 flex-1">
                  <h3 className="text-xl font-bold mb-1 leading-snug">{opp.title}</h3>
                  <p className="text-[#C9A84C] text-sm font-medium">{opp.organization}</p>
                </div>
                
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="glass glass-pill px-3 py-1 text-xs text-white/70">{opp.domain}</span>
                  <span className="glass glass-pill px-3 py-1 text-xs text-white/70">{opp.level}</span>
                </div>
                
                <div className="flex items-center justify-between text-white/50 text-xs font-medium pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {opp.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {opp.deadline || "ASAP"}
                  </div>
                </div>
              </GlassCard>
            ))}
            
            {opportunities.length === 0 && (
              <div className="col-span-full py-10 text-center text-white/50">
                Aucune opportunité pour le moment. Soyez le premier à en publier !
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
