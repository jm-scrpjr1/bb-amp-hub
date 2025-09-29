'use client';

import { motion } from 'framer-motion';

interface CyberLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse';
}

export default function CyberLoader({ 
  className = '', 
  size = 'md',
  color = '#06E5EC',
  variant = 'spinner'
}: CyberLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  const barSize = {
    sm: 'w-0.5 h-4',
    md: 'w-1 h-6',
    lg: 'w-1.5 h-8'
  };

  if (variant === 'spinner') {
    return (
      <motion.div
        className={`${sizeClasses[size]} ${className}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="w-full h-full rounded-full border-2 border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: `${color}60`,
            filter: `drop-shadow(0 0 10px ${color}40)`
          }}
        />
      </motion.div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSize[size]} rounded-full`}
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}60`
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`flex items-end space-x-1 ${className}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`${barSize[size]} rounded-sm`}
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}60`
            }}
            animate={{
              scaleY: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} rounded-full ${className}`}
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}60`
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    );
  }

  return null;
}
