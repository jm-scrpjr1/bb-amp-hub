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
    switch (animationType) {
      case 'bounce':
        return {
          animate: {
            y: [0, -30, 0],
            x: [0, 8, -8, 0],
            rotate: [0, 8, -8, 0],
            scale: [1, 1.1, 1]
          },
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'shake':
        return {
          animate: {
            x: [0, -10, 10, -10, 10, 0],
            y: [0, -5, 5, -5, 5, 0],
            rotate: [0, -3, 3, -3, 3, 0]
          },
          transition: {
            duration: 1.2,
            repeat: Infinity,
            repeatDelay: 2
          }
        };
      case 'float':
        return {
          animate: {
            y: [0, -25, 0],
            x: [0, 12, -12, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          },
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'wiggle':
        return {
          animate: {
            rotate: [0, 15, -15, 15, -15, 0],
            scale: [1, 1.15, 0.95, 1.15, 0.95, 1],
            x: [0, 5, -5, 0],
            y: [0, -8, 8, 0]
          },
          transition: {
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }
        };
      case 'gentle':
        return {
          animate: {
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0],
            scale: [1, 1.02, 1]
          },
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      default:
        return {
          animate: {
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
            rotate: [0, 5, -5, 0]
          },
          transition: {
            duration: 4,
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
              className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-10"
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
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
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
                '0 0 20px rgba(6, 229, 236, 0.3)',
                '0 0 40px rgba(6, 229, 236, 0.6)',
                '0 0 20px rgba(6, 229, 236, 0.3)'
              ]
            }}
            transition={{
              duration: 2,
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
