import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedRobot = ({
  src,
  alt,
  message,
  delay = 0,
  initialPosition = { x: 0, y: 0 },
  animationType = 'bounce',
  size = 'w-24 h-24', // Default size, can be overridden
  showMessage = true,
  showGlow = true,
  className = '',
  onClick,
  style = {}
}) => {
  const [showMessageState, setShowMessageState] = useState(false);
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessageState(true);

        // Continuous message cycle: show for 4 seconds, hide for 2 seconds, repeat
        const messageInterval = setInterval(() => {
          setShowMessageState(prev => !prev);
        }, 3000); // Toggle every 3 seconds (show 3s, hide 3s)

        return () => clearInterval(messageInterval);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, showMessage]);

  // Function to generate safe random position avoiding center area
  const getRandomPosition = () => {
    const centerX = 50; // Center of screen
    const centerY = 50;
    const avoidRadius = 25; // Avoid 25% radius around center

    let newX, newY;
    do {
      newX = Math.random() * 80 + 10; // 10% to 90% of screen width
      newY = Math.random() * 80 + 10; // 10% to 90% of screen height
    } while (
      Math.abs(newX - centerX) < avoidRadius &&
      Math.abs(newY - centerY) < avoidRadius
    );

    return { x: newX, y: newY };
  };

  const handleRobotClick = () => {
    if (onClick) {
      onClick();
    } else {
      const newPosition = getRandomPosition();
      setPosition(newPosition);
      setShowMessageState(!showMessageState); // Toggle message on click
    }
  };

  const getAnimationVariants = () => {
    // Add random delays and variations to prevent synchronized movement - FASTER & MORE LIVELY
    const randomDelay = Math.random() * 0.5; // 0-0.5 second random delay (faster)
    const randomDuration = 0.8 + Math.random() * 0.7; // 0.8-1.5 second random duration (much faster)
    const randomIntensity = 1.2 + Math.random() * 0.8; // 1.2-2.0 intensity multiplier (more intense)

    switch (animationType) {
      case 'bounce':
        return {
          animate: {
            y: [0, -25 * randomIntensity, 0],
            x: [0, 10 * randomIntensity, -10 * randomIntensity, 0],
            rotate: [0, 8 * randomIntensity, -8 * randomIntensity, 0],
            scale: [1, 1.1 * randomIntensity, 1]
          },
          transition: {
            duration: randomDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: randomDelay
          }
        };
      case 'shake':
        return {
          animate: {
            x: [0, -12 * randomIntensity, 12 * randomIntensity, -12 * randomIntensity, 12 * randomIntensity, 0],
            y: [0, -6 * randomIntensity, 6 * randomIntensity, -6 * randomIntensity, 6 * randomIntensity, 0],
            rotate: [0, -4 * randomIntensity, 4 * randomIntensity, -4 * randomIntensity, 4 * randomIntensity, 0]
          },
          transition: {
            duration: 0.4 + Math.random() * 0.3, // Much faster
            repeat: Infinity,
            repeatDelay: 0.2 + Math.random() * 0.3, // Much shorter delay
            delay: randomDelay
          }
        };
      case 'float':
        return {
          animate: {
            y: [0, -22 * randomIntensity, 0],
            x: [0, 12 * randomIntensity, -12 * randomIntensity, 0],
            rotate: [0, 6 * randomIntensity, -6 * randomIntensity, 0],
            scale: [1, 1.08 * randomIntensity, 1]
          },
          transition: {
            duration: randomDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: randomDelay
          }
        };
      case 'wiggle':
        return {
          animate: {
            rotate: [0, 15 * randomIntensity, -15 * randomIntensity, 15 * randomIntensity, -15 * randomIntensity, 0],
            scale: [1, 1.15 * randomIntensity, 0.95, 1.15 * randomIntensity, 0.95, 1],
            x: [0, 8 * randomIntensity, -8 * randomIntensity, 0],
            y: [0, -10 * randomIntensity, 10 * randomIntensity, 0]
          },
          transition: {
            duration: 0.6 + Math.random() * 0.4, // Much faster
            repeat: Infinity,
            repeatDelay: 0.1 + Math.random() * 0.3, // Much shorter delay
            delay: randomDelay
          }
        };
      case 'gentle':
        return {
          animate: {
            y: [0, -15 * randomIntensity, 0],
            rotate: [0, 3 * randomIntensity, -3 * randomIntensity, 0],
            scale: [1, 1.05 * randomIntensity, 1]
          },
          transition: {
            duration: randomDuration + 0.3, // Still faster than before
            repeat: Infinity,
            ease: "easeInOut",
            delay: randomDelay
          }
        };
      default:
        return {
          animate: {
            y: [0, -20 * randomIntensity, 0],
            x: [0, 10 * randomIntensity, -10 * randomIntensity, 0],
            rotate: [0, 5 * randomIntensity, -5 * randomIntensity, 0],
            scale: [1, 1.06 * randomIntensity, 1]
          },
          transition: {
            duration: randomDuration,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        left: initialPosition.x ? `${position.x}%` : undefined,
        top: initialPosition.y ? `${position.y}%` : undefined,
        transform: (initialPosition.x || initialPosition.y) ? 'translate(-50%, -50%)' : undefined,
        ...style
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5, type: "spring" }}
    >
      {/* Floating Message Cloud */}
      {showMessage && (
        <AnimatePresence>
          {showMessageState && message && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -20 }}
              className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-cyan-200/50">
                <p className="text-base font-medium text-gray-800 whitespace-nowrap">{message}</p>
                {/* Speech bubble tail */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Robot Image */}
      <motion.div
        className={`${size} relative cursor-pointer`}
        {...getAnimationVariants()}
        whileHover={{
          scale: 1.25,
          rotate: [0, -8, 8, -8, 8, 0],
          y: [0, -5, 5, 0],
          transition: {
            duration: 0.3,
            type: "spring",
            stiffness: 400,
            rotate: { duration: 0.2, repeat: Infinity }
          }
        }}
        whileTap={{ scale: 0.9 }}
        onClick={handleRobotClick}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain drop-shadow-lg"
          onError={(e) => {
            console.warn(`Failed to load robot image: ${src}`);
            e.target.src = '/images/default.png'; // Fallback to default image
          }}
        />

        {/* Glowing effect */}
        {showGlow && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 25px rgba(6, 229, 236, 0.4)',
                '0 0 50px rgba(6, 229, 236, 0.8)',
                '0 0 25px rgba(6, 229, 236, 0.4)'
              ],
              scale: [1, 1.05, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedRobot;
