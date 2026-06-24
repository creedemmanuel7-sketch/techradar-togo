"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ TechRadar SW registered:", registration.scope);
        })
        .catch((error) => {
          console.warn("SW registration failed:", error);
        });
    }
  }, []);

  return null; // Renders nothing, side-effect only
}
