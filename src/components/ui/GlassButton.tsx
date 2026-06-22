"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function GlassButton({ children, variant = "primary", className = "", onClick, disabled = false, type = "button" }: GlassButtonProps) {
  const baseClasses = "relative px-6 py-3 rounded-full font-medium text-sm transition-all flex items-center justify-center gap-2 overflow-hidden";
  
  let variantClasses = "";
  if (variant === "primary") {
    variantClasses = "bg-white/10 text-white border border-white/20 hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]";
  } else if (variant === "secondary") {
    variantClasses = "bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/30";
  } else if (variant === "ghost") {
    variantClasses = "text-white/70 hover:text-white hover:bg-white/5";
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`${baseClasses} ${variantClasses} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
    >
      {/* Effet de brillance interne façon iOS */}
      <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" style={{ mixBlendMode: 'overlay' }}></div>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>
      
      {children}
    </motion.button>
  );
}
