'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  trigger?: boolean;
  continuous?: boolean;
}

export default function GlitchText({ 
  text, 
  className = '', 
  intensity = 'medium',
  trigger = true,
  continuous = false
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const intensitySettings = {
    low: { duration: 0.1, frequency: 3000 },
    medium: { duration: 0.2, frequency: 2000 },
    high: { duration: 0.3, frequency: 1000 }
  };

  const settings = intensitySettings[intensity];

  const startGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), settings.duration * 1000);
  };

  useEffect(() => {
    if (trigger && continuous) {
      intervalRef.current = setInterval(startGlitch, settings.frequency);
    } else if (trigger) {
      startGlitch();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trigger, continuous]);

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      animate={isGlitching ? {
        x: [0, -2, 2, -1, 1, 0],
        textShadow: [
          '0 0 0 transparent',
          '2px 0 0 #ff0000, -2px 0 0 #00ffff',
          '-2px 0 0 #ff0000, 2px 0 0 #00ffff',
          '1px 0 0 #ff0000, -1px 0 0 #00ffff',
          '0 0 0 transparent'
        ]
      } : {}}
      transition={{ 
        duration: settings.duration,
        ease: "easeInOut"
      }}
      style={{
        filter: isGlitching ? 'hue-rotate(90deg) saturate(1.5)' : 'none'
      }}
    >
      {text}
      {isGlitching && (
        <>
          <motion.span
            className="absolute top-0 left-0 text-red-500 opacity-70"
            animate={{
              x: [-1, 1, -1],
              y: [0, -1, 1]
            }}
            transition={{ duration: 0.1, repeat: 2 }}
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}
          >
            {text}
          </motion.span>
          <motion.span
            className="absolute top-0 left-0 text-cyan-400 opacity-70"
            animate={{
              x: [1, -1, 1],
              y: [1, 0, -1]
            }}
            transition={{ duration: 0.1, repeat: 2 }}
            style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)' }}
          >
            {text}
          </motion.span>
        </>
      )}
    </motion.span>
  );
}
