"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { getOpportunities, Opportunity } from "@/lib/db";
import { Search, MapPin, Heart, Filter, X, ArrowRight, Loader2, SlidersHorizontal, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const types = ["Tous", "Stage", "Emploi", "Événement", "Formation", "Programme", "Concours"];
const domains = ["Tous", "Web", "Mobile", "Data", "Design", "IA", "Cybersécurité"];

export default function ExplorerPage() {
  const [activeType, setActiveType] = useState("Tous");
  const [activeDomain, setActiveDomain] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration: only render client-dependent UI after mount
  useEffect(() => { setMounted(true); }, []);

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
    const matchType = activeType === "Tous" || opp.typeLabel === activeType;
    const matchDomain = activeDomain === "Tous" || opp.domain === activeDomain;
    const matchSearch = !searchQuery || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchDomain && matchSearch;
  });

  const SidebarContent = () => (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-8 pb-4 border-b border-white/10">
        <Filter className="w-5 h-5 text-[#C9A84C]" />
        <h3 className="font-bold text-lg">Filtres du Radar</h3>
      </div>

      {/* Type Filter */}
      <div className="mb-8">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Type d'opportunité</h4>
        <div className="flex flex-col gap-1">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => { setActiveType(type); setIsSidebarOpen(false); }}
              className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                activeType === type
                  ? "bg-white/10 text-[#C9A84C]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {type}
              {activeType === type && <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Domain Filter */}
      <div>
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Domaine Technique</h4>
        <div className="flex flex-col gap-1">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => { setActiveDomain(dom); setIsSidebarOpen(false); }}
              className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                activeDomain === dom
                  ? "bg-[#C9A84C]/10 text-[#C9A84C]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {dom}
              {activeDomain === dom && <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null; // Prevents SSR/CSR mismatch

  return (
    <div className="flex min-h-screen pt-16 bg-[#050505]">

      {/* SIDEBAR DESKTOP (Dashboard style) */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 xl:w-72 bg-[#0a0a0a] border-r border-white/5 z-40 overflow-y-auto custom-scrollbar">
        <div className="p-8">
          <SidebarContent />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-64 xl:ml-72 flex flex-col min-w-0 pb-24">
        
        {/* HEADER */}
        <section className="w-full max-w-6xl mx-auto mt-12 mb-6 px-4 sm:px-8 relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">Le Radar</h1>
              <p className="text-white/50 text-sm md:text-base">
                {loading ? "Recherche en cours..." : `${filteredOpps.length} opportunité${filteredOpps.length > 1 ? "s" : ""} trouvée${filteredOpps.length > 1 ? "s" : ""}`}
              </p>
            </div>
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden glass glass-pill px-4 py-2.5 flex items-center gap-2 text-sm font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {(activeType !== "Tous" || activeDomain !== "Tous") && (
                <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
              )}
            </button>
          </div>
        </section>

        {/* STICKY SEARCH */}
        <div className="sticky top-16 z-30 w-full bg-[#050505]/90 backdrop-blur-md border-b border-white/5 py-4 mb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="glass w-full rounded-2xl p-2 flex items-center gap-3 shadow-xl">
              <div className="pl-3 text-[#C9A84C]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mots-clés, organisation, technologie..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm md:text-base"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-white/40 hover:text-white pr-2 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 relative z-10">


        {/* GRID RESULTS */}
        <div className="flex-1 min-w-0">

          {/* Active Filters */}
          <AnimatePresence>
            {(activeType !== "Tous" || activeDomain !== "Tous") && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex flex-wrap items-center gap-2"
              >
                <span className="text-xs text-white/40">Filtres actifs :</span>
                {activeType !== "Tous" && (
                  <button
                    onClick={() => setActiveType("Tous")}
                    className="glass glass-pill px-3 py-1 flex items-center gap-1.5 text-xs font-medium text-white hover:bg-white/10 transition-all"
                  >
                    {activeType} <X className="w-3 h-3" />
                  </button>
                )}
                {activeDomain !== "Tous" && (
                  <button
                    onClick={() => setActiveDomain("Tous")}
                    className="glass glass-pill px-3 py-1 flex items-center gap-1.5 text-xs font-medium text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all"
                  >
                    {activeDomain} <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass glass-card p-6 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-20 h-6 bg-white/10 rounded-md" />
                    <div className="w-6 h-6 bg-white/10 rounded-full" />
                  </div>
                  <div className="mb-4 flex-1">
                    <div className="w-3/4 h-6 bg-white/10 rounded-md mb-2" />
                    <div className="w-1/2 h-4 bg-white/10 rounded-md mb-4" />
                    <div className="w-full h-3 bg-white/5 rounded-md mb-1.5" />
                    <div className="w-5/6 h-3 bg-white/5 rounded-md" />
                  </div>
                  <div className="flex gap-2 mb-5">
                    <div className="w-16 h-6 bg-white/5 rounded-md" />
                    <div className="w-16 h-6 bg-white/5 rounded-md" />
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between">
                    <div className="w-24 h-4 bg-white/10 rounded-md" />
                    <div className="w-12 h-4 bg-white/10 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredOpps.map((opp) => (
                    <motion.div
                      key={opp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <a href={`/opportunite/${opp.id}`} className="block h-full group">
                        <GlassCard hoverEffect className="flex flex-col h-full cursor-pointer">
                          <div className="flex justify-between items-start mb-5">
                            <CategoryBadge type={opp.type} label={opp.typeLabel} />
                            <button
                              onClick={(e) => e.preventDefault()}
                              className="bg-white/5 hover:bg-white/15 p-2 rounded-full transition-colors"
                            >
                              <Heart className="w-4 h-4 text-white/40 hover:text-red-400" />
                            </button>
                          </div>

                          <div className="mb-4 flex-1">
                            <h3 className="text-lg font-bold mb-1 leading-snug group-hover:text-[#F5E6A3] transition-colors">
                              {opp.title}
                            </h3>
                            <p className="text-[#C9A84C] text-sm font-semibold">{opp.organization}</p>
                            {opp.description && (
                              <p className="text-white/50 text-xs mt-2 line-clamp-2">{opp.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-5 flex-wrap">
                            <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs text-white/70">{opp.domain}</span>
                            <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs text-white/70">{opp.level}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-medium pt-4 border-t border-white/10">
                            <div className="flex items-center gap-1.5 text-white/40">
                              <MapPin className="w-3.5 h-3.5" /> {opp.location}
                            </div>
                            <span className="flex items-center gap-1 text-[#C9A84C] group-hover:gap-2 transition-all">
                              Voir <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </GlassCard>
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredOpps.length === 0 && (
                <div className="w-full py-24 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Aucun match sur le Radar</h3>
                  <p className="text-white/50 max-w-sm mx-auto text-sm">
                    Essayez d'autres mots-clés ou ajustez vos filtres.
                  </p>
                </div>
              )}
            </>
          )}
          </div>
        </section>
      </main>

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 z-50 lg:hidden overflow-y-auto bg-[#0a0a0a] border-r border-white/10 p-5 pt-20"
            >
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-5 right-5 bg-white/10 p-2 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
