'use client';

import { useEffect, useRef } from 'react';

interface LiquidCursorProps {
  className?: string;
  color?: string;
  size?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export default function LiquidCursor({ 
  className = '', 
  color = '#06E5EC',
  size = 20,
  intensity = 'medium'
}: LiquidCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const trailPos = useRef({ x: 0, y: 0 });

  const intensitySettings = {
    low: { smoothing: 0.1, trailSmoothing: 0.05, scale: 0.8 },
    medium: { smoothing: 0.15, trailSmoothing: 0.08, scale: 1 },
    high: { smoothing: 0.2, trailSmoothing: 0.1, scale: 1.2 }
  };

  const settings = intensitySettings[intensity];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseEnter = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '1';
      if (trailRef.current) trailRef.current.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
      if (trailRef.current) trailRef.current.style.opacity = '0';
    };

    const animate = () => {
      // Smooth cursor movement
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * settings.smoothing;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * settings.smoothing;

      // Smooth trail movement
      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * settings.trailSmoothing;
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * settings.trailSmoothing;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPos.current.x - size/2}px, ${cursorPos.current.y - size/2}px, 0) scale(${settings.scale})`;
      }

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPos.current.x - size}px, ${trailPos.current.y - size}px, 0) scale(${settings.scale * 1.5})`;
      }

      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [size, settings]);

  return (
    <>
      {/* Trail */}
      <div
        ref={trailRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] opacity-0 transition-opacity duration-300 ${className}`}
        style={{
          width: size * 2,
          height: size * 2,
          background: `radial-gradient(circle, ${color}20 0%, ${color}10 50%, transparent 100%)`,
          borderRadius: '50%',
          filter: 'blur(2px)',
          mixBlendMode: 'screen'
        }}
      />
      
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[10000] opacity-0 transition-opacity duration-300 ${className}`}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color}80 0%, ${color}40 70%, transparent 100%)`,
          borderRadius: '50%',
          border: `1px solid ${color}60`,
          boxShadow: `0 0 20px ${color}40, inset 0 0 10px ${color}20`,
          filter: 'blur(0.5px)',
          mixBlendMode: 'screen'
        }}
      />
    </>
  );
}
