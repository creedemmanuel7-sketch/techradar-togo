"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { getOpportunities, Opportunity } from "@/lib/db";
import { Search, MapPin, Clock, Heart, Filter, ChevronDown, X, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const types = ["Tous", "Stage", "Emploi", "Événement", "Formation", "Programme", "Concours"];
const domains = ["Web", "Mobile", "Data", "Design", "IA", "Cybersécurité"];

export default function ExplorerPage() {
  const [activeType, setActiveType] = useState("Tous");
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
  
  const filteredOpps = opportunities.filter(opp => {
    if (activeType === "Tous") return true;
    return opp.typeLabel === activeType;
  });

  return (
    <div className="flex flex-col items-center pb-24 px-4 sm:px-6 overflow-hidden min-h-screen">
      
      {/* HEADER & SEARCH */}
      <section className="w-full max-w-6xl mx-auto mt-12 mb-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Explorer les opportunités</h1>
        <p className="text-white/50 text-sm mb-8">
          {loading ? "Chargement..." : `${filteredOpps.length} opportunités trouvées`}
        </p>

        <div className="glass w-full rounded-full p-2 flex items-center gap-3">
          <div className="pl-4 text-[#C9A84C]">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher une opportunité, une organisation..." 
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm"
          />
          <button className="bg-gradient-to-r from-[#C9A84C] to-[#F5E6A3] text-black font-semibold px-6 py-2 rounded-full text-sm hover:opacity-90 transition-opacity">
            Rechercher
          </button>
        </div>
      </section>

      {/* HORIZONTAL FILTERS */}
      <section className="w-full max-w-6xl mx-auto mb-12 relative z-10">
        <div className="glass glass-pill p-2 flex items-center overflow-x-auto no-scrollbar gap-6 whitespace-nowrap">
          
          {/* TYPE FILTER */}
          <div className="flex items-center gap-2 pl-4 border-r border-white/10 pr-6">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider mr-2">Type</span>
            {types.map((type) => (
              <button 
                key={type}
                onClick={() => setActiveType(type)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeType === type ? 'text-black' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                {activeType === type && (
                  <motion.div 
                    layoutId="activeFilter" 
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{type}</span>
              </button>
            ))}
          </div>

          {/* DOMAINE FILTER */}
          <div className="flex items-center gap-2 border-r border-white/10 pr-6">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider mr-2">Domaine</span>
            {domains.map((dom) => (
              <button key={dom} className="px-3 py-1.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                {dom}
              </button>
            ))}
          </div>

        </div>

        <AnimatePresence>
          {activeType !== "Tous" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center gap-2"
            >
              <span className="text-xs text-white/50">Filtres actifs :</span>
              <div className="glass glass-pill px-3 py-1 flex items-center gap-1.5 text-xs text-white">
                {activeType}
                <button onClick={() => setActiveType("Tous")} className="hover:text-white/50 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* GRID RESULTS */}
      <section className="w-full max-w-6xl mx-auto relative z-10">
        
        {loading ? (
          <div className="flex justify-center py-20 text-white/50">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredOpps.map((opp, index) => (
                  <motion.div
                    key={opp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <GlassCard hoverEffect className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <CategoryBadge type={opp.type} label={opp.typeLabel} />
                        <button className="text-white/30 hover:text-white/80 transition-colors flex items-center gap-1 text-xs font-medium">
                          <Heart className="w-4 h-4" /> {opp.saves}
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
                        <a href={opp.externalLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#C9A84C] hover:text-[#F5E6A3] transition-colors">
                          Voir l'offre <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredOpps.length === 0 && (
              <div className="w-full py-20 text-center text-white/50">
                Aucune opportunité ne correspond à ces critères.
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
}
