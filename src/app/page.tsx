import { getOpportunities } from "@/lib/db";
import { Metadata } from "next";
import { HomeClient } from "./HomeClient";

export const metadata: Metadata = {
  title: "TechRadar Togo | L'écosystème Tech du Togo",
  description: "Découvrez les meilleures opportunités technologiques au Togo. Stages, emplois, formations et événements.",
};

export default async function HomePage() {
  // Récupération des données côté serveur pour le SEO et l'affichage initial ultra rapide
  const opportunities = await getOpportunities();
  
  // On ne prend que les 6 plus récentes pour la page d'accueil
  const latestOpportunities = opportunities.slice(0, 6);
  const totalCount = opportunities.length;

  return (
    <HomeClient 
      latestOpportunities={latestOpportunities} 
      totalCount={totalCount} 
    />
  );
}
