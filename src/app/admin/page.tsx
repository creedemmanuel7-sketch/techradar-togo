"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { getAllUsers, getOpportunities, deleteOpportunity, updateUserRole, UserProfile, Opportunity } from "@/lib/db";
import { Loader2, Users, Briefcase, Trash2, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);

  const [activeTab, setActiveTab] = useState<"stats" | "users" | "opportunites">("stats");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userDoc = await getDoc(doc(db, "users", u.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
            fetchData();
          } else {
            setIsAdmin(false);
          }
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const fetchData = async () => {
    try {
      const [u, o] = await Promise.all([
        getAllUsers(),
        getOpportunities()
      ]);
      setUsers(u);
      setOpportunities(o);

      // Fetch global applications count (a bit heavy, but okay for admin dash)
      const appsSnapshot = await getDocs(collection(db, "applications"));
      setApplicationsCount(appsSnapshot.size);
    } catch (e) {
      toast.error("Erreur lors du chargement des données.");
    }
  };

  const handleDeleteOpp = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette offre ?")) return;
    try {
      await deleteOpportunity(id);
      toast.success("Offre supprimée.");
      setOpportunities(opportunities.filter(o => o.id !== id));
    } catch {
      toast.error("Erreur de suppression.");
    }
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "recruiter" ? "talent" : "recruiter";
    if (!confirm(`Passer cet utilisateur au rôle ${newRole} ?`)) return;
    try {
      await updateUserRole(userId, newRole as "talent" | "recruiter");
      toast.success("Rôle mis à jour.");
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as "talent" | "recruiter" } : u));
    } catch {
      toast.error("Erreur de mise à jour.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A84C] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
        <p className="text-white/60 mb-6 text-center max-w-md">
          Vous n'avez pas les droits administrateur pour accéder à cette page.
        </p>
        <a href="/" className="bg-white/10 px-6 py-2 rounded-xl hover:bg-white/20 transition">Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <div className="text-white flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-16 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-[#C9A84C]" />
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Admin</h1>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "stats" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
          >
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "users" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
          >
            Utilisateurs ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("opportunites")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "opportunites" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
          >
            Offres ({opportunities.length})
          </button>
        </div>

        {/* TAB: STATS */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center gap-3 text-white/50 mb-2">
                <Users className="w-5 h-5" /> Utilisateurs Inscrits
              </div>
              <p className="text-4xl font-black text-white">{users.length}</p>
              <div className="mt-4 flex gap-4 text-sm text-white/40">
                <span>{users.filter(u => u.role === "talent").length} talents</span>
                <span>{users.filter(u => u.role === "recruiter").length} recruteurs</span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center gap-3 text-white/50 mb-2">
                <Briefcase className="w-5 h-5" /> Offres Publiées
              </div>
              <p className="text-4xl font-black text-[#C9A84C]">{opportunities.length}</p>
              <div className="mt-4 flex gap-4 text-sm text-white/40">
                <span>{opportunities.filter(o => o.status !== "closed").length} actives</span>
                <span>{opportunities.filter(o => o.status === "closed").length} pourvues</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <div className="flex items-center gap-3 text-white/50 mb-2">
                <Shield className="w-5 h-5" /> Candidatures
              </div>
              <p className="text-4xl font-black text-white">{applicationsCount}</p>
              <p className="mt-4 text-sm text-white/40">Total sur la plateforme</p>
            </div>
          </div>
        )}

        {/* TAB: USERS */}
        {activeTab === "users" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-white/5 text-white/50 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Nom / Email</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Inscription</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-white/40">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          u.role === "admin" ? "bg-red-500/20 text-red-400" :
                          u.role === "recruiter" ? "bg-blue-500/20 text-blue-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/40">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleUpdateRole(u.id!, u.role)}
                            className="text-xs text-[#C9A84C] hover:underline"
                          >
                            Changer Rôle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: OPPORTUNITES */}
        {activeTab === "opportunites" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-white/5 text-white/50 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Titre / Orga</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((o) => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <a href={`/opportunite/${o.id}`} target="_blank" rel="noreferrer" className="font-bold text-white hover:text-[#C9A84C] transition-colors">
                          {o.title}
                        </a>
                        <p className="text-white/40">{o.organization}</p>
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {o.typeLabel}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          o.status === "closed" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                        }`}>
                          {o.status === "closed" ? "Pourvu" : "Actif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteOpp(o.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
