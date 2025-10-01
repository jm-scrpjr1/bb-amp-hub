'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Animated Robot Component with Floating Messages
const AnimatedRobot = ({
  src,
  alt,
  message,
  delay = 0,
  initialPosition = { x: 0, y: 0 },
  animationType = 'bounce'
}: {
  src: string;
  alt: string;
  message: string;
  delay?: number;
  initialPosition?: { x: number; y: number };
  animationType?: 'bounce' | 'shake' | 'float' | 'wiggle';
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [position, setPosition] = useState(initialPosition);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);

      // Continuous message cycle: show for 4 seconds, hide for 2 seconds, repeat
      const messageInterval = setInterval(() => {
        setShowMessage(prev => !prev);
      }, 3000); // Toggle every 3 seconds (show 3s, hide 3s)

      return () => clearInterval(messageInterval);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

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
    const newPosition = getRandomPosition();
    setPosition(newPosition);
    setShowMessage(!showMessage); // Toggle message on click
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
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5, type: "spring" }}
    >
      {/* Floating Message Cloud */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: -20 }}
            className="absolute -top-24 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-cyan-200/50">
              <p className="text-base font-medium text-gray-800 whitespace-nowrap">{message}</p>
              {/* Speech bubble tail */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/95"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot Image - 3.5x larger (16 * 3.5 = 56) */}
      <motion.div
        className="w-56 h-56 relative cursor-pointer"
        {...getAnimationVariants()}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRobotClick}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain drop-shadow-lg"
        />

        {/* Glowing effect */}
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
      </motion.div>
    </motion.div>
  );
};

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Witty messages for each robot
  const robotMessages = [
    "Ready to amplify your productivity? 🚀",
    "Let's make work feel like play! 🎮",
    "Your AI-powered future starts here! ⚡",
    "Bold ideas need bold tools! 💡",
    "Time to unlock your potential! 🔓",
    "Welcome to the AI revolution! 🤖"
  ];

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Robots */}
      <div className="absolute inset-0">
        <AnimatedRobot
          src="/images/Cyan.png"
          alt="Cyan AI Robot"
          message={robotMessages[0]}
          delay={500}
          initialPosition={{ x: 12, y: 15 }}
          animationType="bounce"
        />
        <AnimatedRobot
          src="/images/Cyan.png"
          alt="Cyan AI Robot"
          message={robotMessages[1]}
          delay={1000}
          initialPosition={{ x: 88, y: 18 }}
          animationType="float"
        />
        <AnimatedRobot
          src="/images/Cyan.png"
          alt="Cyan AI Robot"
          message={robotMessages[2]}
          delay={1500}
          initialPosition={{ x: 8, y: 82 }}
          animationType="wiggle"
        />
        <AnimatedRobot
          src="/images/Cyan.png"
          alt="Cyan AI Robot"
          message={robotMessages[3]}
          delay={2000}
          initialPosition={{ x: 92, y: 85 }}
          animationType="shake"
        />
        <AnimatedRobot
          src="/images/Cyan.png"
          alt="Cyan AI Robot"
          message={robotMessages[4]}
          delay={2500}
          initialPosition={{ x: 15, y: 55 }}
          animationType="bounce"
        />
        <AnimatedRobot
          src="/images/Cyan.png"
          alt="Cyan AI Robot"
          message={robotMessages[5]}
          delay={3000}
          initialPosition={{ x: 85, y: 65 }}
          animationType="float"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(6, 229, 236, 0.3), 0 0 50px rgba(6, 229, 236, 0.2)'
          }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center relative overflow-hidden"
              animate={{
                background: [
                  'linear-gradient(45deg, #22d3ee, #3b82f6, #8b5cf6)',
                  'linear-gradient(45deg, #3b82f6, #8b5cf6, #22d3ee)',
                  'linear-gradient(45deg, #8b5cf6, #22d3ee, #3b82f6)',
                  'linear-gradient(45deg, #22d3ee, #3b82f6, #8b5cf6)'
                ],
                boxShadow: [
                  '0 0 30px rgba(6, 229, 236, 0.4)',
                  '0 0 50px rgba(6, 229, 236, 0.6)',
                  '0 0 30px rgba(6, 229, 236, 0.4)'
                ]
              }}
              transition={{
                background: { duration: 4, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </motion.svg>

              {/* Animated ring effects */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </motion.div>

            <motion.h1
              className="text-4xl font-bold text-white mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.span
                animate={{
                  textShadow: [
                    '0 0 10px rgba(6, 229, 236, 0.5)',
                    '0 0 20px rgba(6, 229, 236, 0.8)',
                    '0 0 10px rgba(6, 229, 236, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                AI Workbench™
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-cyan-300 text-xl font-semibold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <motion.span
                animate={{
                  color: ['#67e8f9', '#22d3ee', '#06b6d4', '#67e8f9']
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                AI-Amplified™ Workspace
              </motion.span>
            </motion.p>

            <motion.p
              className="text-white/80 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              Sign in to access your intelligent workspace
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 20px rgba(6, 229, 236, 0.3)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white/95 hover:bg-white text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <motion.p
              className="text-white/60 text-xs"
              animate={{
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Powered by Bold Business AI-Amplified™ Technology
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
