"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  effect?: 'scale' | 'glow' | 'slide' | 'ripple';
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  effect = 'scale'
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const overlay = overlayRef.current;

    const handleMouseEnter = (e: MouseEvent) => {
      if (disabled) return;

      switch (effect) {
        case 'scale':
          gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          });
          break;

        case 'glow':
          gsap.to(button, {
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
            duration: 0.3,
            ease: "power2.out"
          });
          break;

        case 'slide':
          if (overlay) {
            gsap.to(overlay, {
              x: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          }
          break;

        case 'ripple':
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          if (overlay) {
            gsap.set(overlay, {
              x: x - 50,
              y: y - 50,
              scale: 0,
              opacity: 0.3
            });
            gsap.to(overlay, {
              scale: 3,
              opacity: 0,
              duration: 0.6,
              ease: "power2.out"
            });
          }
          break;
      }
    };

    const handleMouseLeave = () => {
      if (disabled) return;

      switch (effect) {
        case 'scale':
          gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
          break;

        case 'glow':
          gsap.to(button, {
            boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
            duration: 0.3,
            ease: "power2.out"
          });
          break;

        case 'slide':
          if (overlay) {
            gsap.to(overlay, {
              x: "100%",
              duration: 0.3,
              ease: "power2.out"
            });
          }
          break;
      }
    };

    const handleClick = () => {
      if (disabled) return;

      // Click animation
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });

      onClick?.();
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('click', handleClick);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      button.removeEventListener('click', handleClick);
    };
  }, [disabled, effect, onClick]);

  const baseClasses = cn(
    "relative overflow-hidden transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    {
      // Variants
      "bg-blue-600 text-white hover:bg-blue-700": variant === 'primary',
      "bg-gray-600 text-white hover:bg-gray-700": variant === 'secondary',
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50": variant === 'outline',
      
      // Sizes
      "px-3 py-1.5 text-sm": size === 'sm',
      "px-4 py-2 text-base": size === 'md',
      "px-6 py-3 text-lg": size === 'lg',
      
      // Disabled state
      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  );

  return (
    <button
      ref={buttonRef}
      className={cn(baseClasses, "rounded-lg font-medium")}
      disabled={disabled}
    >
      {/* Overlay for slide and ripple effects */}
      {(effect === 'slide' || effect === 'ripple') && (
        <div
          ref={overlayRef}
          className={cn(
            "absolute inset-0 pointer-events-none",
            {
              "bg-white/20 transform translate-x-full": effect === 'slide',
              "bg-white/30 rounded-full w-24 h-24": effect === 'ripple',
            }
          )}
        />
      )}
      
      <span className="relative z-10">{children}</span>
    </button>
  );
}
