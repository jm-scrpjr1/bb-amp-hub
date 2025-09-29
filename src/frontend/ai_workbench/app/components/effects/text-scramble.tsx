'use client';

import { useEffect, useRef, useState } from 'react';

interface TextScrambleProps {
  text: string;
  className?: string;
  trigger?: boolean;
  speed?: number;
  scrambleChars?: string;
  delay?: number;
}

export default function TextScramble({ 
  text, 
  className = '', 
  trigger = true, 
  speed = 50,
  scrambleChars = '!@#$%^&*()_+-=[]{}|;:,.<>?',
  delay = 0
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrambleText = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    let iteration = 0;
    const maxIterations = text.length;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return char;
            }
            if (char === ' ') return ' ';
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsAnimating(false);
      }

      iteration += 1 / 3;
    }, speed);
  };

  useEffect(() => {
    if (trigger) {
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          scrambleText();
        }, delay);
      } else {
        scrambleText();
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [trigger, text, delay]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span 
      className={`inline-block ${className}`}
      style={{ 
        fontFamily: 'monospace',
        letterSpacing: '0.05em'
      }}
    >
      {displayText || text}
    </span>
  );
}
