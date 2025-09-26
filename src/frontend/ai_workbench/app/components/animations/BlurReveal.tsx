"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface BlurRevealProps {
  children: React.ReactNode;
  className?: string;
  initialBlur?: number;
  duration?: number;
  delay?: number;
  trigger?: 'scroll' | 'load' | 'hover';
}

export default function BlurReveal({
  children,
  className = '',
  initialBlur = 20,
  duration = 1.5,
  delay = 0,
  trigger = 'scroll'
}: BlurRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    // Set initial blur state
    gsap.set(element, {
      filter: `blur(${initialBlur}px)`,
      opacity: 0.7,
    });

    const animateToFocus = () => {
      gsap.to(element, {
        filter: 'blur(0px)',
        opacity: 1,
        duration,
        delay,
        ease: "power2.out",
      });
    };

    const animateToBlur = () => {
      gsap.to(element, {
        filter: `blur(${initialBlur}px)`,
        opacity: 0.7,
        duration: duration * 0.5,
        ease: "power2.in",
      });
    };

    if (trigger === 'load') {
      // Animate on component mount
      setTimeout(animateToFocus, delay * 1000);
    } else if (trigger === 'scroll') {
      // Animate on scroll
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: animateToFocus,
        onLeave: animateToBlur,
        onEnterBack: animateToFocus,
        onLeaveBack: animateToBlur,
      });
    } else if (trigger === 'hover') {
      // Animate on hover
      element.addEventListener('mouseenter', animateToFocus);
      element.addEventListener('mouseleave', animateToBlur);
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (trigger === 'hover') {
        element.removeEventListener('mouseenter', animateToFocus);
        element.removeEventListener('mouseleave', animateToBlur);
      }
    };
  }, [initialBlur, duration, delay, trigger]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
