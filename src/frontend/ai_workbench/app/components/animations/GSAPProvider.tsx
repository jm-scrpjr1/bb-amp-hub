"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPProviderProps {
  children: React.ReactNode;
}

export default function GSAPProvider({ children }: GSAPProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Global GSAP configuration
    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    });

    // Set default ease
    gsap.defaults({
      ease: "power2.out",
      duration: 0.6,
    });

    // Refresh ScrollTrigger on route changes
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
