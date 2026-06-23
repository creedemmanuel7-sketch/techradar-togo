import { getOpportunityById } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ModifierClient } from "./ModifierClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const opp = await getOpportunityById(id);
  if (!opp) return { title: "Offre introuvable" };
  return {
    title: `Modifier : ${opp.title} | TechRadar Togo`,
    robots: { index: false }, // Don't index edit pages
  };
}

export default async function ModifierPage({ params }: PageProps) {
  const { id } = await params;
  const opp = await getOpportunityById(id);

  if (!opp) notFound();

  return <ModifierClient opp={opp} />;
}
