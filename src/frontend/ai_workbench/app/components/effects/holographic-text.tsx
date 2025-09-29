'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HolographicTextProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

export default function HolographicText({ 
  text, 
  className = '', 
  size = 'md',
  intensity = 'medium',
  animated = true
}: HolographicTextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const intensitySettings = {
    low: { 
      shadowIntensity: '0 0 10px',
      glowIntensity: '0 0 20px',
      shimmerDuration: 3
    },
    medium: { 
      shadowIntensity: '0 0 15px',
      glowIntensity: '0 0 30px',
      shimmerDuration: 2.5
    },
    high: { 
      shadowIntensity: '0 0 20px',
      glowIntensity: '0 0 40px',
      shimmerDuration: 2
    }
  };

  const settings = intensitySettings[intensity];

  if (!mounted) {
    return <span className={`${sizeClasses[size]} ${className}`}>{text}</span>;
  }

  return (
    <motion.span
      className={`
        relative inline-block font-bold tracking-wider
        ${sizeClasses[size]} ${className}
      `}
      style={{
        background: 'linear-gradient(45deg, #06E5EC, #003BDF, #06E5EC, #003BDF)',
        backgroundSize: '400% 400%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: `${settings.shadowIntensity} #06E5EC, ${settings.shadowIntensity} #003BDF`,
        filter: `drop-shadow(${settings.glowIntensity} #06E5EC)`,
      }}
      animate={animated ? {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      } : {}}
      transition={{
        duration: settings.shimmerDuration,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {text}
      
      {/* Holographic overlay effect */}
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(6, 229, 236, 0.3) 50%, transparent 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
        animate={animated ? {
          x: ['-100%', '200%'],
        } : {}}
        transition={{
          duration: settings.shimmerDuration * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        {text}
      </motion.span>

      {/* Scan line effect */}
      {animated && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(6, 229, 236, 0.1) 50%, transparent 100%)',
            height: '2px',
          }}
          animate={{
            y: ['-10px', '100%', '-10px'],
          }}
          transition={{
            duration: settings.shimmerDuration * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      )}
    </motion.span>
  );
}
