"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
}

export function GlassCard({ children, className = "", hoverEffect = false, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay }}
      whileHover={hoverEffect ? { y: -6, scale: 1.01 } : {}}
      className={`glass glass-card p-6 overflow-hidden relative ${hoverEffect ? 'glass-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
