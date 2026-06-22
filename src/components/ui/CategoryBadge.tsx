import { TYPE_BADGE_STYLE } from "@/lib/constants";
import { ReactNode } from "react";

export type CategoryType = "stage" | "emploi" | "evenement" | "formation" | "programme" | "concours";

interface CategoryBadgeProps {
  type: CategoryType;
  label: string;
  icon?: ReactNode;
}

export function CategoryBadge({ type, label, icon }: CategoryBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${TYPE_BADGE_STYLE[type] ?? "bg-white/10 text-white/50 border-white/10"}`}>
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {label}
    </div>
  );
}

