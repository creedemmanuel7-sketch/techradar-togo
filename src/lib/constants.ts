import { CategoryType } from "@/components/ui/CategoryBadge";

// ─────────────────────────────────────────────
// OPPORTUNITY TYPES
// ─────────────────────────────────────────────

export interface OpportunityTypeConfig {
  value: CategoryType;
  label: string;
  badgeStyle: string; // CSS classes for CategoryBadge
}

export const OPPORTUNITY_TYPES: OpportunityTypeConfig[] = [
  {
    value: "emploi",
    label: "Emploi",
    badgeStyle: "bg-[#4FC3F7]/10 text-[#4FC3F7] border-[#4FC3F7]/20",
  },
  {
    value: "stage",
    label: "Stage",
    badgeStyle: "bg-[#A5D6A7]/10 text-[#A5D6A7] border-[#A5D6A7]/20",
  },
  {
    value: "evenement",
    label: "Événement",
    badgeStyle: "bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20",
  },
  {
    value: "formation",
    label: "Formation",
    badgeStyle: "bg-[#F48FB1]/10 text-[#F48FB1] border-[#F48FB1]/20",
  },
  {
    value: "programme",
    label: "Programme",
    badgeStyle: "bg-[#CE93D8]/10 text-[#CE93D8] border-[#CE93D8]/20",
  },
  {
    value: "concours",
    label: "Concours",
    badgeStyle: "bg-[#80CBC4]/10 text-[#80CBC4] border-[#80CBC4]/20",
  },
];

/** Quick lookup: type value → label (e.g. "stage" → "Stage") */
export const TYPE_LABEL: Record<CategoryType, string> = Object.fromEntries(
  OPPORTUNITY_TYPES.map((t) => [t.value, t.label])
) as Record<CategoryType, string>;

/** Quick lookup: type value → badge CSS classes */
export const TYPE_BADGE_STYLE: Record<CategoryType, string> = Object.fromEntries(
  OPPORTUNITY_TYPES.map((t) => [t.value, t.badgeStyle])
) as Record<CategoryType, string>;

/** Labels for the Explorer sidebar filter (includes "Tous") */
export const TYPE_FILTER_OPTIONS = ["Tous", ...OPPORTUNITY_TYPES.map((t) => t.label)];

// ─────────────────────────────────────────────
// TECHNICAL DOMAINS
// ─────────────────────────────────────────────

export const DOMAINS = [
  "Web",
  "Mobile",
  "Data",
  "Design",
  "IA",
  "Cybersécurité",
  "Entrepreneuriat",
  "Général",
] as const;

export type Domain = (typeof DOMAINS)[number];

/** Labels for the Explorer sidebar filter (includes "Tous") */
export const DOMAIN_FILTER_OPTIONS = ["Tous", ...DOMAINS];

// ─────────────────────────────────────────────
// EXPERIENCE LEVELS
// ─────────────────────────────────────────────

export const LEVELS = ["Tous", "Débutant", "Intermédiaire", "Avancé"] as const;
export type Level = (typeof LEVELS)[number];
