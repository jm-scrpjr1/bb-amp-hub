'use client';

import { useEffect, useRef } from 'react';

interface CyberGridProps {
  className?: string;
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

export default function CyberGrid({ 
  className = '', 
  color = '#06E5EC',
  intensity = 'medium',
  animated = true
}: CyberGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const settings = {
      low: { gridSize: 80, lineWidth: 1, opacity: 0.2, pulseSpeed: 0.001 },
      medium: { gridSize: 60, lineWidth: 1.5, opacity: 0.3, pulseSpeed: 0.002 },
      high: { gridSize: 40, lineWidth: 2, opacity: 0.4, pulseSpeed: 0.003 }
    };

    const config = settings[intensity];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = timeRef.current;
      const pulse = animated ? Math.sin(time * config.pulseSpeed) * 0.3 + 0.7 : 1;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = config.lineWidth;
      ctx.globalAlpha = config.opacity * pulse;

      // Draw vertical lines
      for (let x = 0; x <= canvas.width; x += config.gridSize) {
        const offset = animated ? Math.sin(time * 0.001 + x * 0.01) * 5 : 0;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, canvas.height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= canvas.height; y += config.gridSize) {
        const offset = animated ? Math.cos(time * 0.001 + y * 0.01) * 5 : 0;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }

      // Draw intersection points with glow
      if (animated) {
        ctx.globalAlpha = config.opacity * pulse * 0.8;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        for (let x = 0; x <= canvas.width; x += config.gridSize) {
          for (let y = 0; y <= canvas.height; y += config.gridSize) {
            const pointPulse = Math.sin(time * 0.003 + (x + y) * 0.01) * 0.5 + 0.5;
            const size = 2 * pointPulse;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.shadowBlur = 0;
      }

      timeRef.current += 16; // ~60fps
    };

    const animate = () => {
      draw();
      if (animated) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, intensity, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        background: 'transparent',
        mixBlendMode: 'overlay'
      }}
    />
  );
}
