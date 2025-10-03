'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  animation?: 'fadeUp' | 'slideIn' | 'scramble' | 'wave' | 'bounce';
  stagger?: number;
  delay?: number;
  duration?: number;
  by?: 'word' | 'character' | 'line';
  threshold?: number;
  once?: boolean;
}

export default function AnimatedText({
  text,
  className = '',
  animation = 'fadeUp',
  stagger = 0.05,
  delay = 0,
  duration = 0.6,
  by = 'word',
  threshold = 0.1,
  once = true
}: AnimatedTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: threshold, once });

  // Split text based on the 'by' prop
  const splitText = () => {
    // Safety check for undefined or null text
    if (!text || typeof text !== 'string') {
      return [];
    }

    switch (by) {
      case 'character':
        return text.split('');
      case 'line':
        return text.split('\n');
      case 'word':
      default:
        return text.split(' ');
    }
  };

  const textArray = splitText();

  // Animation variants for different effects
  const getVariants = () => {
    const baseVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: stagger,
          delayChildren: delay
        }
      }
    };

    const itemVariants = {
      fadeUp: {
        hidden: { 
          opacity: 0, 
          y: 50,
          filter: 'blur(4px)'
        },
        visible: { 
          opacity: 1, 
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      },
      slideIn: {
        hidden: { 
          opacity: 0, 
          x: -30,
          scale: 0.8
        },
        visible: { 
          opacity: 1, 
          x: 0,
          scale: 1,
          transition: {
            duration,
            ease: "easeOut"
          }
        }
      },
      wave: {
        hidden: { 
          opacity: 0, 
          y: 20,
          rotateX: 90
        },
        visible: { 
          opacity: 1, 
          y: 0,
          rotateX: 0,
          transition: {
            duration,
            ease: "backOut"
          }
        }
      },
      bounce: {
        hidden: { 
          opacity: 0, 
          scale: 0,
          y: 50
        },
        visible: { 
          opacity: 1, 
          scale: 1,
          y: 0,
          transition: {
            duration,
            ease: "elasticOut",
            elasticity: 0.6
          }
        }
      },
      scramble: {
        hidden: { 
          opacity: 0,
          filter: 'blur(8px) hue-rotate(180deg)'
        },
        visible: { 
          opacity: 1,
          filter: 'blur(0px) hue-rotate(0deg)',
          transition: {
            duration: duration * 1.5,
            ease: "easeInOut"
          }
        }
      }
    };

    return {
      container: baseVariants,
      item: itemVariants[animation]
    };
  };

  const variants = getVariants();

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants.container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {textArray.map((item, index) => (
        <motion.span
          key={index}
          variants={variants.item}
          className="inline-block"
          style={{
            marginRight: by === 'word' ? '0.25em' : by === 'character' ? '0' : '0',
            marginBottom: by === 'line' ? '0.5em' : '0'
          }}
        >
          {item}
          {by === 'word' && index < textArray.length - 1 && ' '}
          {by === 'line' && index < textArray.length - 1 && <br />}
        </motion.span>
      ))}
    </motion.div>
  );
}
