"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Only animate if pathname actually changed
    if (previousPathname.current !== pathname) {
      // Page enter animation
      gsap.fromTo(container, 
        {
          opacity: 0,
          y: 20,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          ease: "power2.out",
        }
      );

      // Animate child elements with stagger
      const childElements = container.querySelectorAll('.page-element');
      if (childElements.length > 0) {
        gsap.fromTo(childElements,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.2,
            ease: "power2.out",
          }
        );
      }

      previousPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  );
}
