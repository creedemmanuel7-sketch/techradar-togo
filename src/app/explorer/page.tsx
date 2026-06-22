import { getFilteredOpportunities } from "@/lib/db";
import { Metadata } from "next";
import { ExplorerClient } from "./ExplorerClient";

export const metadata: Metadata = {
  title: "Le Radar | TechRadar Togo",
  description: "Découvrez les meilleures opportunités tech au Togo : Emplois, Stages, Formations, Événements et Concours.",
};

export default async function ExplorerPage() {
  // Récupération des données initiales côté serveur pour le SEO
  const { data: initialOpportunities } = await getFilteredOpportunities({ type: "Tous", domain: "Tous" }, 12, null);

  return <ExplorerClient initialOpportunities={initialOpportunities} />;
}
