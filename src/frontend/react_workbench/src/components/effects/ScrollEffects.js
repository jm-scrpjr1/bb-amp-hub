import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ScrollEffects = ({
  children,
  effect = 'fadeUp',
  delay = 0,
  duration = 0.8,
  distance = 50,
  className = '',
  threshold = 0.1,
  once = true,
  stagger = false,
  staggerDelay = 0.1
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold, once });

  // Animation variants for different effects
  const getVariants = () => {
    const effects = {
      fadeUp: {
        hidden: { 
          opacity: 0, 
          y: distance,
          filter: 'blur(6px)'
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
      },
      slideLeft: {
        hidden: { 
          opacity: 0, 
          x: distance,
          filter: 'blur(4px)'
        },
        visible: { 
          opacity: 1, 
          x: 0,
          filter: 'blur(0px)',
          transition: {
            duration,
            delay,
            ease: "easeOut"
          }
        }
      },
      slideRight: {
        hidden: { 
          opacity: 0, 
          x: -distance,
          filter: 'blur(4px)'
        },
        visible: { 
          opacity: 1, 
          x: 0,
          filter: 'blur(0px)',
          transition: {
            duration,
            delay,
            ease: "easeOut"
          }
        }
      },
      scale: {
        hidden: { 
          opacity: 0, 
          scale: 0.8,
          filter: 'blur(8px)'
        },
        visible: { 
          opacity: 1, 
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            duration,
            delay,
            ease: "backOut"
          }
        }
      },
      blur: {
        hidden: { 
          opacity: 0,
          filter: 'blur(20px) brightness(0.5)'
        },
        visible: { 
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          transition: {
            duration: duration * 1.2,
            delay,
            ease: "easeOut"
          }
        }
      },
      rotate: {
        hidden: { 
          opacity: 0, 
          rotate: -180,
          scale: 0.5
        },
        visible: { 
          opacity: 1, 
          rotate: 0,
          scale: 1,
          transition: {
            duration,
            delay,
            ease: "backOut"
          }
        }
      },
      flip: {
        hidden: { 
          opacity: 0, 
          rotateY: 90,
          scale: 0.8
        },
        visible: { 
          opacity: 1, 
          rotateY: 0,
          scale: 1,
          transition: {
            duration,
            delay,
            ease: "backOut"
          }
        }
      }
    };

    return effects[effect];
  };

  // Stagger container variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: getVariants().hidden,
    visible: {
      ...getVariants().visible,
      transition: {
        ...getVariants().visible.transition,
        delay: 0 // Remove individual delay when staggering
      }
    }
  };

  if (stagger && React.Children.count(children) > 1) {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

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
};

export default ScrollEffects;
