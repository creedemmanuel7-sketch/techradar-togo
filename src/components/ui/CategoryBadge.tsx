import { ReactNode } from "react";

export type CategoryType = "stage" | "emploi" | "evenement" | "formation" | "programme" | "concours";

interface CategoryBadgeProps {
  type: CategoryType;
  label: string;
  icon?: ReactNode;
}

export function CategoryBadge({ type, label, icon }: CategoryBadgeProps) {
  const styles: Record<CategoryType, string> = {
    stage: "bg-[#A5D6A7]/10 text-[#A5D6A7] border-[#A5D6A7]/20",
    emploi: "bg-[#4FC3F7]/10 text-[#4FC3F7] border-[#4FC3F7]/20",
    evenement: "bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20",
    formation: "bg-[#F48FB1]/10 text-[#F48FB1] border-[#F48FB1]/20",
    programme: "bg-[#CE93D8]/10 text-[#CE93D8] border-[#CE93D8]/20",
    concours: "bg-[#80CBC4]/10 text-[#80CBC4] border-[#80CBC4]/20",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[type]}`}>
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {label}
    </div>
  );
}
