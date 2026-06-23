"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { OPPORTUNITY_TYPES, DOMAINS, LEVELS } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export interface OpportunityFormData {
  title: string;
  organization: string;
  type: string;
  domain: string;
  level: string;
  location: string;
  deadline: string;
  externalLink: string;
  description: string;
}

export const EMPTY_FORM: OpportunityFormData = {
  title: "",
  organization: "",
  type: "emploi",
  domain: "Web",
  level: "Tous",
  location: "",
  deadline: "",
  externalLink: "",
  description: "",
};

interface OpportunityFormProps {
  formData: OpportunityFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function OpportunityForm({
  formData,
  onChange,
  onSubmit,
  isSubmitting,
  submitLabel,
}: OpportunityFormProps) {
  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/50 focus:bg-white/10 transition-all";
  const selectClass =
    "w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#C9A84C]/50 transition-all appearance-none";
  const labelClass =
    "text-xs font-semibold text-white/50 uppercase tracking-wider ml-1 block mb-2";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelClass}>Titre de l'offre *</label>
          <input
            required
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="ex: Développeur Frontend"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Organisation *</label>
          <input
            required
            name="organization"
            value={formData.organization}
            onChange={onChange}
            placeholder="ex: TechVision"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Type d'opportunité *</label>
          <select name="type" value={formData.type} onChange={onChange} className={selectClass}>
            {OPPORTUNITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Domaine</label>
          <select name="domain" value={formData.domain} onChange={onChange} className={selectClass}>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Niveau</label>
          <select name="level" value={formData.level} onChange={onChange} className={selectClass}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Localisation *</label>
          <input
            required
            name="location"
            value={formData.location}
            onChange={onChange}
            placeholder="ex: Lomé, Togo (ou Remote)"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Date limite</label>
          <input
            name="deadline"
            value={formData.deadline}
            onChange={onChange}
            placeholder="ex: 15 Juil 2026"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Lien pour postuler (URL) *</label>
          <input
            required
            type="url"
            name="externalLink"
            value={formData.externalLink}
            onChange={onChange}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Description *</label>
        <textarea
          required
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={5}
          placeholder="Décris l'opportunité : missions, profil recherché, conditions..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="pt-6">
        <GlassButton
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          className="w-full py-4 text-lg bg-gradient-to-r from-[#C9A84C]/80 to-[#F5E6A3]/80 hover:from-[#C9A84C] hover:to-[#F5E6A3] text-black border-none font-bold"
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : submitLabel}
        </GlassButton>
      </div>
    </form>
  );
}
