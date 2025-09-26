"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function LiquidMouseFollower() {
  const svgRef = useRef<SVGSVGElement>(null);
  const linesRef = useRef<SVGLineElement[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationId = useRef<number>();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const lines: SVGLineElement[] = [];
    
    // Create multiple lines for the liquid effect
    for (let i = 0; i < 8; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('opacity', '0.3');
      line.style.filter = 'blur(1px)';
      svg.appendChild(line);
      lines.push(line);
    }
    
    linesRef.current = lines;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const { x, y } = mousePos.current;
      
      lines.forEach((line, index) => {
        const delay = index * 0.1;
        const offset = index * 20;
        
        // Create flowing lines that follow the mouse with delay
        gsap.to(line, {
          duration: 0.8 + delay,
          ease: "power2.out",
          attr: {
            x1: x - offset,
            y1: y - offset,
            x2: x + offset,
            y2: y + offset,
          },
          opacity: 0.6 - (index * 0.05),
        });
      });
      
      animationId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      lines.forEach(line => line.remove());
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      id="liquid"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 text-blue-500/20"
      style={{ zIndex: -1 }}
    />
  );
}
