import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GenieModal = ({ 
  isOpen, 
  onClose, 
  children, 
  triggerElement,
  className = "",
  style = {}
}) => {
  const [mounted, setMounted] = useState(false);
  const [originPoint, setOriginPoint] = useState({ x: '50%', y: '50%' });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate origin point based on trigger element
  useEffect(() => {
    if (triggerElement && isOpen) {
      const rect = triggerElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Convert to viewport percentages
      const x = (centerX / window.innerWidth) * 100;
      const y = (centerY / window.innerHeight) * 100;
      
      setOriginPoint({ x: `${x}%`, y: `${y}%` });
    } else {
      // Default to center if no trigger element
      setOriginPoint({ x: '50%', y: '50%' });
    }
  }, [triggerElement, isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) return null;

  const genieVariants = {
    initial: {
      opacity: 0,
      scale: 0,
      rotate: -10,
      transformOrigin: `${originPoint.x} ${originPoint.y}`,
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transformOrigin: `${originPoint.x} ${originPoint.y}`,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4,
        opacity: { duration: 0.3 },
      }
    },
    exit: {
      opacity: 0,
      scale: 0,
      rotate: -15,
      transformOrigin: `${originPoint.x} ${originPoint.y}`,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.3, delay: 0.2 },
        scale: { duration: 0.5, ease: [0.6, 0, 0.4, 1] },
        rotate: { duration: 0.5, ease: [0.6, 0, 0.4, 1] }
      }
    }
  };

  const backdropVariants = {
    initial: { 
      opacity: 0,
      backdropFilter: "blur(0px)"
    },
    animate: { 
      opacity: 1,
      backdropFilter: "blur(4px)",
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      backdropFilter: "blur(0px)",
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={backdropVariants}
          className="fixed inset-0 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          style={{
            zIndex: 2147483647,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'auto',
            background: 'rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Magical particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"
                initial={{
                  x: originPoint.x,
                  y: originPoint.y,
                  opacity: 0,
                  scale: 0
                }}
                animate={isOpen ? {
                  x: [originPoint.x, `${Math.random() * 100}%`],
                  y: [originPoint.y, `${Math.random() * 100}%`],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0]
                } : {
                  x: [`${Math.random() * 100}%`, originPoint.x],
                  y: [`${Math.random() * 100}%`, originPoint.y],
                  opacity: [0.8, 0.9, 0],
                  scale: [1, 0.5, 0]
                }}
                transition={{
                  duration: isOpen ? 1.5 + Math.random() * 1 : 0.8 + Math.random() * 0.4,
                  delay: isOpen ? Math.random() * 0.5 : Math.random() * 0.2,
                  ease: isOpen ? "easeOut" : [0.6, 0, 0.4, 1]
                }}
              />
            ))}

            {/* Closing whoosh effect */}
            {!isOpen && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`whoosh-${i}`}
                    className="absolute w-0.5 h-8 bg-gradient-to-t from-transparent via-blue-400/60 to-transparent rounded-full"
                    style={{
                      left: `${45 + Math.random() * 10}%`,
                      top: `${45 + Math.random() * 10}%`,
                    }}
                    initial={{
                      scale: 0,
                      rotate: Math.random() * 360,
                      opacity: 0
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      rotate: Math.random() * 360 + 180,
                      opacity: [0, 0.8, 0],
                      x: [0, (Math.random() - 0.5) * 200],
                      y: [0, (Math.random() - 0.5) * 200]
                    }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.05,
                      ease: [0.6, 0, 0.4, 1]
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* Magical closing spiral */}
            <AnimatePresence>
              {!isOpen && (
                <motion.div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-32 h-32 border-2 border-blue-400/40 rounded-full"
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{
                      scale: [1, 0.5, 0],
                      rotate: [0, 180, 360],
                      opacity: [0.6, 0.8, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.6, 0, 0.4, 1]
                    }}
                  />
                  <motion.div
                    className="absolute w-16 h-16 border border-purple-400/60 rounded-full"
                    initial={{ scale: 1, rotate: 0 }}
                    animate={{
                      scale: [1, 0.3, 0],
                      rotate: [0, -270, -540],
                      opacity: [0.8, 1, 0]
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 0.1,
                      ease: [0.6, 0, 0.4, 1]
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Genie Modal Content */}
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={genieVariants}
            className={`relative ${className}`}
            style={{
              willChange: 'transform, opacity',
              ...style
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default GenieModal;
