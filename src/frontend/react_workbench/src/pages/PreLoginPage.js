import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Particle dissolve effect component - EPIC THANOS SNAP
const DissolveParticle = ({ x, y, delay, size = 3 }) => {
  const randomX = (Math.random() - 0.5) * 400;
  const randomY = (Math.random() - 0.5) * 400;

  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        zIndex: 50
      }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: 0,
        scale: 0,
        x: randomX,
        y: randomY,
        rotate: Math.random() * 360
      }}
      transition={{ delay, duration: 1.2, ease: "easeOut" }}
    >
      <div className={`w-${size} h-${size} bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-lg shadow-cyan-400/50`} />
    </motion.div>
  );
};

// Basketball Bounce Component with Futuristic Effects
const BasketballBounceRobot = ({
  src,
  alt,
  message,
  delay = 0,
  showBubble = true
}) => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
      const messageInterval = setInterval(() => {
        setShowMessage(prev => !prev);
      }, 4000);
      return () => clearInterval(messageInterval);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Basketball bounce: high bounce, then progressively lower bounces
  const bounceVariants = {
    animate: {
      y: [0, -120, 0, -80, 0, -50, 0, -25, 0, -10, 0],
      transition: {
        duration: 2.2,
        repeat: Infinity,
        ease: "easeOut",
        times: [0, 0.15, 0.3, 0.45, 0.55, 0.65, 0.72, 0.8, 0.87, 0.94, 1]
      }
    }
  };

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center overflow-visible"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5, type: "spring" }}
    >

      {/* Robot Image with Basketball Bounce */}
      <motion.div
        className="w-40 h-40 relative"
        {...bounceVariants}
        whileHover={{ scale: 1.15 }}
        style={{ willChange: 'transform' }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain drop-shadow-lg"
          onError={(e) => {
            console.warn(`Failed to load robot image: ${src}`);
            e.target.src = '/images/default.png';
          }}
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

        {/* Bounce Impact Flash Effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/0 via-cyan-300/40 to-cyan-400/0"
          animate={{
            opacity: [0, 0.8, 0, 0, 0.6, 0, 0, 0.4, 0, 0, 0.2, 0],
            scale: [1, 1.3, 1, 1, 1.2, 1, 1, 1.1, 1, 1, 1.05, 1]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            times: [0, 0.15, 0.3, 0.45, 0.48, 0.55, 0.72, 0.75, 0.87, 0.9, 0.94, 1],
            ease: "easeOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
};



const PreLoginPage = () => {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [particles, setParticles] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState({
    prompts: 0,
    automations: 0,
    'ai-agents': 0,
    training: 0
  });
  const [showBubble, setShowBubble] = useState({
    prompts: true,
    automations: true,
    'ai-agents': true,
    training: true
  });

  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollingElement.scrollTop;
      const docHeight = e.target.scrollingElement.scrollHeight - window.innerHeight;
      const scrolled = scrollTop / docHeight;
      setScrollProgress(scrolled);

      // Generate EPIC particles when scrolling - THANOS SNAP EFFECT
      if (scrolled > 0 && scrolled < 0.6) {
        // Create multiple particles per scroll event for dramatic effect
        const particleCount = Math.floor(Math.random() * 8) + 4; // 4-12 particles
        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 60,
          delay: i * 0.05,
          size: Math.floor(Math.random() * 4) + 2
        }));
        setParticles(prev => [...prev.slice(-50), ...newParticles]);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotate messages every 4 seconds and toggle bubble visibility
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => ({
        prompts: (prev.prompts + 1) % 4,
        automations: (prev.automations + 1) % 4,
        'ai-agents': (prev['ai-agents'] + 1) % 4,
        training: (prev.training + 1) % 4
      }));
      setShowBubble(prev => ({
        prompts: !prev.prompts,
        automations: !prev.automations,
        'ai-agents': !prev['ai-agents'],
        training: !prev.training
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toolCategories = [
    {
      id: 'prompts',
      title: 'Instant Prompts',
      image: '/images/PROMPT 1.png',
      animation: 'bounce',
      messages: [
        "Need the perfect prompt? I've got you covered! 🎯",
        "Unlock your creativity with AI prompts! ✨",
        "78 prompts ready to supercharge your work! 🚀",
        "Let's craft something amazing together! 💡"
      ]
    },
    {
      id: 'automations',
      title: 'Guided Builders',
      image: '/images/AUTOMATION 3.png',
      animation: 'shake',
      messages: [
        "Why do it manually when I can automate it? ⚡",
        "Automate your workflows in seconds! 🤖",
        "Save time, boost productivity! ⏱️",
        "Let's eliminate the repetitive work! 🎯"
      ]
    },
    {
      id: 'ai-agents',
      title: 'Agentic Workflows',
      image: '/images/AI AGENT 1.png',
      animation: 'float',
      messages: [
        "Meet my AI squad - we're quite the team! 👥",
        "Intelligent agents working for you! 🧠",
        "Automate complex workflows effortlessly! 🌟",
        "Your AI team is ready to go! 🚀"
      ]
    },
    {
      id: 'training',
      title: 'Knowledge and Trainings',
      image: '/images/AI TRAINING 3.png',
      animation: 'bounce',
      messages: [
        "Let's level up your AI skills! 📚",
        "Master AI with expert training! 🎓",
        "Continuous learning, continuous growth! 📈",
        "Become an AI expert today! 🌟"
      ]
    }
  ];

  const scrollToRobots = () => {
    const robotsSection = document.getElementById('robots-section');
    if (robotsSection) {
      robotsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-y-scroll scroll-smooth">
      {/* Dissolve particles - THANOS SNAP EFFECT */}
      {particles.map(particle => (
        <DissolveParticle key={particle.id} x={particle.x} y={particle.y} delay={particle.delay} size={particle.size} />
      ))}

      {/* Top Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/Iconic.png)',
          backgroundAttachment: 'fixed',
          opacity: 1 - scrollProgress * 1.5
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Logo in top LEFT with unreal glow effect */}
        <motion.div
          className="absolute top-6 left-6 z-20 group"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            {/* Animated glow background - multiple layers for unreal effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle, rgba(6, 229, 236, 0.6) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)',
                width: '90px',
                height: '90px',
                left: '-18px',
                top: '-18px'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Inner glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                width: '90px',
                height: '90px',
                left: '-18px',
                top: '-18px',
                background: 'radial-gradient(circle, rgba(6, 229, 236, 0.3) 0%, transparent 70%)'
              }}
              animate={{
                boxShadow: [
                  '0 0 15px rgba(6, 229, 236, 0.4), inset 0 0 15px rgba(6, 229, 236, 0.2)',
                  '0 0 40px rgba(6, 229, 236, 0.8), inset 0 0 30px rgba(168, 85, 247, 0.3)',
                  '0 0 15px rgba(6, 229, 236, 0.4), inset 0 0 15px rgba(6, 229, 236, 0.2)'
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Logo image - SVG with premium glow */}
            <motion.img
              src="/images/BOLD LIGHT LOGO.svg"
              alt="Bold Business Logo"
              className="relative h-14 w-auto drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 25px rgba(6, 229, 236, 0.9)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.4))',
              }}
              whileHover={{
                filter: 'drop-shadow(0 0 35px rgba(6, 229, 236, 1)) drop-shadow(0 0 70px rgba(168, 85, 247, 0.6))'
              }}
            />
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 text-center max-w-2xl px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 leading-tight">
            Ready to amplify your talent?
          </h1>
          <div className="flex flex-col gap-4 items-center">
            <motion.button
              onClick={() => navigate('/auth/signin')}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all w-full md:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started with SSO Login →
            </motion.button>
            <motion.button
              onClick={scrollToRobots}
              className="border-2 border-cyan-400 text-cyan-400 px-10 py-4 rounded-full font-bold text-lg hover:bg-cyan-400/10 transition-all w-full md:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Now →
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-white text-center">
            <p className="text-sm mb-2">Scroll to explore</p>
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Bottom Feature Section */}
      <div id="robots-section" className="relative w-full h-screen bg-gradient-to-b from-slate-900 via-blue-900/50 to-slate-900 py-8 px-6 overflow-hidden">
        {/* Decorative background elements - ENHANCED & VIBRANT */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Cyan glow - top left */}
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>

          {/* Purple glow - bottom right */}
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          ></motion.div>

          {/* Blue accent - center */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          ></motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Bold AI Workbench™
            </h2>
            <p className="text-xl text-cyan-400 font-semibold mb-3">
              Talent + Tools Deliver AI Amplified Results™
            </p>
            <p className="text-base text-gray-300 max-w-3xl mx-auto mb-2">
              Welcome to the AI Workbench — your space to explore and use over 400 proprietary AI-powered tools designed to make work faster, smarter, and easier.
            </p>
            <p className="text-sm text-gray-400">
              Tools are grouped into four simple categories so you can quickly find what you need:
            </p>
          </motion.div>

          {/* Tool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {toolCategories.map((tool, index) => (
              <motion.div
                key={tool.id}
                className="group relative overflow-visible"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>

                {/* Card */}
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 h-full flex flex-col items-center justify-center hover:border-cyan-400/50 transition-all duration-300 group-hover:bg-white/15 overflow-visible">
                  {/* Chat Bubble - positioned outside card */}
                  {showBubble[tool.id] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute -top-20 -right-8 z-50 pointer-events-none"
                    >
                      <div className="relative">
                        <div className="relative bg-slate-900/80 backdrop-blur-md rounded-3xl px-8 py-5 border-2 border-cyan-400/60 shadow-2xl w-64"
                          style={{
                            boxShadow: '0 0 20px rgba(6, 229, 236, 0.6), 0 0 40px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(6, 229, 236, 0.1)'
                          }}>
                          <p className="text-sm font-semibold text-cyan-100 text-center leading-relaxed">{tool.messages[currentMessageIndex[tool.id]]}</p>
                          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-slate-900/80 border-r border-b border-cyan-400/60 rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(6, 229, 236, 0.6))'
                            }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Robot Display */}
                  <div className="w-full h-56 mb-4 flex items-center justify-center">
                    <BasketballBounceRobot
                      src={tool.image}
                      alt={tool.title}
                      message={tool.messages[currentMessageIndex[tool.id]]}
                      delay={index * 200}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white text-center">
                    {tool.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Placeholder Items Grid - Column Based Layout */}
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Prompts Column */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <motion.div
                    key={`prompt-${num}`}
                    className="group relative bg-slate-900/40 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-4 cursor-pointer overflow-visible transition-all duration-500"
                    whileHover={{ scale: 1.08, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Animated Glow Background on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.2) 0%, transparent 70%)',
                        filter: 'blur(20px)'
                      }}></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 30px rgba(6, 229, 236, 0.3), 0 0 40px rgba(6, 229, 236, 0.4)'
                      }}></div>

                    {/* Neon Chat Bubble */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      whileHover={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute -top-14 -right-6 z-50 pointer-events-none"
                    >
                      <div className="relative">
                        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl px-6 py-3 border-2 border-cyan-400/70 shadow-2xl w-40"
                          style={{
                            boxShadow: '0 0 30px rgba(6, 229, 236, 0.8), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.2)'
                          }}>
                          <p className="text-sm font-bold text-cyan-100 text-center leading-tight">78 prompts ready to supercharge your work! 🚀</p>
                          <div className="absolute -bottom-3 left-6 w-4 h-4 bg-slate-900/90 border-r-2 border-b-2 border-cyan-400/70 rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(6, 229, 236, 0.8))'
                            }}></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="text-xl font-bold text-cyan-300">
                        Instant Prompt {num}
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Automations Column */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <motion.div
                    key={`automation-${num}`}
                    className="group relative bg-slate-900/40 backdrop-blur-xl border border-green-400/30 rounded-3xl p-4 cursor-pointer overflow-visible transition-all duration-500"
                    whileHover={{ scale: 1.08, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Animated Glow Background on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                        filter: 'blur(20px)'
                      }}></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 30px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.4)'
                      }}></div>

                    {/* Neon Chat Bubble */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      whileHover={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute -top-14 -right-6 z-50 pointer-events-none"
                    >
                      <div className="relative">
                        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl px-6 py-3 border-2 border-green-400/70 shadow-2xl w-40"
                          style={{
                            boxShadow: '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4), inset 0 0 30px rgba(34, 197, 94, 0.2)'
                          }}>
                          <p className="text-sm font-bold text-green-100 text-center leading-tight">Automate your workflows in seconds! ⚡</p>
                          <div className="absolute -bottom-3 left-6 w-4 h-4 bg-slate-900/90 border-r-2 border-b-2 border-green-400/70 rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))'
                            }}></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="text-xl font-bold text-green-300">
                        Guided Builder {num}
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-green-400/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Agents Column */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <motion.div
                    key={`ai-agent-${num}`}
                    className="group relative bg-slate-900/40 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-4 cursor-pointer overflow-visible transition-all duration-500"
                    whileHover={{ scale: 1.08, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Animated Glow Background on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
                        filter: 'blur(20px)'
                      }}></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 30px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.4)'
                      }}></div>

                    {/* Neon Chat Bubble */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      whileHover={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute -top-14 -right-6 z-50 pointer-events-none"
                    >
                      <div className="relative">
                        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl px-6 py-3 border-2 border-purple-400/70 shadow-2xl w-40"
                          style={{
                            boxShadow: '0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(168, 85, 247, 0.2)'
                          }}>
                          <p className="text-sm font-bold text-purple-100 text-center leading-tight">Intelligent agents working for you! 🧠</p>
                          <div className="absolute -bottom-3 left-6 w-4 h-4 bg-slate-900/90 border-r-2 border-b-2 border-purple-400/70 rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.8))'
                            }}></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="text-xl font-bold text-purple-300">
                        Agentic Workflow {num}
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-400/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Training Column */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <motion.div
                    key={`training-${num}`}
                    className="group relative bg-slate-900/40 backdrop-blur-xl border border-pink-400/30 rounded-3xl p-4 cursor-pointer overflow-visible transition-all duration-500"
                    whileHover={{ scale: 1.08, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Animated Glow Background on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
                        filter: 'blur(20px)'
                      }}></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 30px rgba(236, 72, 153, 0.3), 0 0 40px rgba(236, 72, 153, 0.4)'
                      }}></div>

                    {/* Neon Chat Bubble */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      whileHover={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute -top-14 -right-6 z-50 pointer-events-none"
                    >
                      <div className="relative">
                        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl px-6 py-3 border-2 border-pink-400/70 shadow-2xl w-40"
                          style={{
                            boxShadow: '0 0 30px rgba(236, 72, 153, 0.8), 0 0 60px rgba(236, 72, 153, 0.4), inset 0 0 30px rgba(236, 72, 153, 0.2)'
                          }}>
                          <p className="text-sm font-bold text-pink-100 text-center leading-tight">Master AI with expert training! 🎓</p>
                          <div className="absolute -bottom-3 left-6 w-4 h-4 bg-slate-900/90 border-r-2 border-b-2 border-pink-400/70 rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.8))'
                            }}></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="text-xl font-bold text-pink-300">
                        Training {num}
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-pink-400/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>


        </div>
      </div>
    </div>
  );
};

export default PreLoginPage;

