'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollTextRevealProps {
  children: React.ReactNode;
  effect?: 'fadeUp' | 'scramble' | 'spiral' | 'typewriter' | 'glitch';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
  scrambleChars?: string;
  staggerChildren?: number;
  disableInternalStyling?: boolean;
}

export default function ScrollTextReveal({
  children,
  effect = 'fadeUp',
  delay = 0,
  duration = 0.8,
  distance = 50,
  className = '',
  threshold = 0.1,
  once = true,
  scrambleChars = '!@#$%^&*()_+-=[]{}|;:,.<>?',
  staggerChildren = 0.1,
  disableInternalStyling = false
}: ScrollTextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold, once });
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Extract text content from children
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (React.isValidElement(node)) {
      return React.Children.toArray(node.props.children)
        .map(getTextContent)
        .join('');
    }
    if (Array.isArray(node)) {
      return node.map(getTextContent).join('');
    }
    return '';
  };

  const originalText = getTextContent(children);

  // Scramble effect
  const scrambleText = () => {
    if (!originalText) return;
    
    setIsAnimating(true);
    let iteration = 0;
    const maxIterations = originalText.length;
    
    const interval = setInterval(() => {
      setDisplayText(
        originalText
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return char;
            }
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join('')
      );
      
      iteration += 1;
      
      if (iteration > maxIterations) {
        clearInterval(interval);
        setDisplayText(originalText);
        setIsAnimating(false);
      }
    }, 50);
  };

  // Typewriter effect
  const typewriterText = () => {
    if (!originalText) return;
    
    setIsAnimating(true);
    setDisplayText('');
    let index = 0;
    
    const interval = setInterval(() => {
      setDisplayText(originalText.slice(0, index + 1));
      index++;
      
      if (index >= originalText.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 50);
  };

  // Spiral effect (characters appear in a spiral pattern)
  const spiralText = () => {
    if (!originalText) return;
    
    setIsAnimating(true);
    const chars = originalText.split('');
    const spiralOrder = [];
    
    // Create spiral order (center out)
    const center = Math.floor(chars.length / 2);
    spiralOrder.push(center);
    
    for (let i = 1; i <= center; i++) {
      if (center - i >= 0) spiralOrder.push(center - i);
      if (center + i < chars.length) spiralOrder.push(center + i);
    }
    
    let revealedChars = new Array(chars.length).fill('');
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < spiralOrder.length) {
        revealedChars[spiralOrder[index]] = chars[spiralOrder[index]];
        setDisplayText(revealedChars.join(''));
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 80);
  };

  // Trigger effects when in view
  useEffect(() => {
    if (isInView && !isAnimating) {
      const timer = setTimeout(() => {
        switch (effect) {
          case 'scramble':
            scrambleText();
            break;
          case 'typewriter':
            typewriterText();
            break;
          case 'spiral':
            spiralText();
            break;
          default:
            break;
        }
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, effect, delay]);

  // Animation variants for different effects
  const getVariants = () => {
    switch (effect) {
      case 'fadeUp':
        return {
          hidden: { 
            opacity: 0, 
            y: distance,
            filter: 'blur(10px)'
          },
          visible: { 
            opacity: 1, 
            y: 0,
            filter: 'blur(0px)',
            transition: {
              duration,
              delay,
              ease: [0.25, 0.46, 0.45, 0.94]
            }
          }
        };
      
      case 'glitch':
        return {
          hidden: { 
            opacity: 0,
            x: -20,
            filter: 'hue-rotate(0deg)'
          },
          visible: { 
            opacity: 1, 
            x: 0,
            filter: 'hue-rotate(360deg)',
            transition: {
              duration,
              delay,
              ease: "easeOut"
            }
          }
        };
      
      default:
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { duration, delay }
          }
        };
    }
  };

  // For text-based effects, render the animated text
  if (effect === 'scramble' || effect === 'typewriter' || effect === 'spiral') {
    return (
      <motion.div
        ref={ref}
        className={`${className}`}
        initial={{ opacity: 0, y: distance }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
        transition={{ duration: 0.6, delay }}
      >
        <span
          className={disableInternalStyling ? '' : 'tracking-wider'}
          style={{
            minHeight: '1em',
            display: 'inline-block'
          }}
        >
          {displayText || (isInView ? '' : originalText)}
        </span>
      </motion.div>
    );
  }

  // For motion-based effects
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={getVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}
