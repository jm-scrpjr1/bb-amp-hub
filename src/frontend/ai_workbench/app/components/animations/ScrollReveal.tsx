"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  trigger?: 'top' | 'center' | 'bottom';
  stagger?: number;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 50,
  className = '',
  trigger = 'bottom',
  stagger = 0
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Initial state based on direction
    const initialState: any = { opacity: 0 };
    const animateState: any = { opacity: 1 };

    switch (direction) {
      case 'up':
        initialState.y = distance;
        animateState.y = 0;
        break;
      case 'down':
        initialState.y = -distance;
        animateState.y = 0;
        break;
      case 'left':
        initialState.x = distance;
        animateState.x = 0;
        break;
      case 'right':
        initialState.x = -distance;
        animateState.x = 0;
        break;
      case 'scale':
        initialState.scale = 0.8;
        animateState.scale = 1;
        break;
      case 'fade':
        // Only opacity animation
        break;
    }

    // Set initial state
    gsap.set(element, initialState);

    // Create scroll trigger animation
    const animation = gsap.to(element, {
      ...animateState,
      duration,
      delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: `top ${trigger === 'top' ? '80%' : trigger === 'center' ? '50%' : '90%'}`,
        toggleActions: "play none none reverse",
        once: false,
      }
    });

    // Handle stagger for child elements
    if (stagger > 0) {
      const children = element.children;
      if (children.length > 0) {
        gsap.set(children, initialState);
        gsap.to(children, {
          ...animateState,
          duration,
          delay,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: `top ${trigger === 'top' ? '80%' : trigger === 'center' ? '50%' : '90%'}`,
            toggleActions: "play none none reverse",
          }
        });
      }
    }

    return () => {
      animation.kill();
    };
  }, [direction, delay, duration, distance, trigger, stagger]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
