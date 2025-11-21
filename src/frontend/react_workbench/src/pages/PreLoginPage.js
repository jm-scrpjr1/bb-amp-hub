import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// ARCHIVED: Functional TalentFit modal - preserved for later use
// import TalentFitModal from '../components/TalentFitModal';
import TalentFitHowItWorksModal from '../components/TalentFitHowItWorksModal';
import SmartProjectOrganizerModal from '../components/SmartProjectOrganizerModal';
import PermittingCodeModal from '../components/PermittingCodeModal';
import TaskCalendarModal from '../components/TaskCalendarModal';
import RoleBasedSkillModal from '../components/RoleBasedSkillModal';

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
  const [isTalentFitModalOpen, setIsTalentFitModalOpen] = useState(false);
  const [isSmartProjectOrganizerModalOpen, setIsSmartProjectOrganizerModalOpen] = useState(false);
  const [isPermittingCodeModalOpen, setIsPermittingCodeModalOpen] = useState(false);
  const [isTaskCalendarModalOpen, setIsTaskCalendarModalOpen] = useState(false);
  const [isRoleBasedSkillModalOpen, setIsRoleBasedSkillModalOpen] = useState(false);

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

  // Placeholder item names for each category
  const promptNames = [
    'Smart Project Organizer',
    'Email Polisher',
    'Smart Task Prioritizer',
    'Social Post Generator'
  ];

  const automationNames = [
    'Permitting & Code Research Assistant',
    'Campaign Crafter',
    'Deck Designer',
    'Marketing Plan Generator'
  ];

  const aiAgentNames = [
    'Task & Calendar Optimizer',
    'AI Recruiter Assistant',
    'Competitor Comparison Tool',
    'Customer Feedback Analyzer'
  ];

  const trainingNames = [
    'Role-Based Skill Accelerator',
    'AI Readiness Assessment',
    'AI Prompt Tutor',
    'Role-Based AI Playbooks'
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-y-auto scroll-smooth">
      {/* Dissolve particles - THANOS SNAP EFFECT */}
      {particles.map(particle => (
        <DissolveParticle key={particle.id} x={particle.x} y={particle.y} delay={particle.delay} size={particle.size} />
      ))}

      {/* Top Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/images/Iconic.png)'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Sticky Header with Logo and Navigation - iOS-like Glass Design */}
        <motion.div
          className="fixed top-0 left-0 right-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            borderBottom: '1px solid rgba(6, 229, 236, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 80px rgba(6, 229, 236, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Subtle top highlight line for iOS effect */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(6, 229, 236, 0.3) 50%, transparent 100%)'
            }}
          />

          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            {/* Logo with subtle glow */}
            <motion.img
              src="/images/BOLD LIGHT LOGO.svg"
              alt="Bold Business Logo"
              className="h-12 w-auto"
              whileHover={{ scale: 1.05 }}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(6, 229, 236, 0.3))'
              }}
            />

            {/* Navigation Items */}
            <div className="flex items-center gap-8">
              {/* About Bold AI Workbench */}
              <motion.div
                className="relative text-cyan-300 font-semibold text-base cursor-pointer transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/explore')}
                style={{
                  textShadow: '0 0 20px rgba(6, 229, 236, 0.5)'
                }}
              >
                <span className="relative z-10">About Bold AI Workbench</span>
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle, rgba(6, 229, 236, 0.15) 0%, transparent 70%)',
                    filter: 'blur(10px)'
                  }}
                />
              </motion.div>

              {/* Featured Tools Dropdown */}
              <div className="relative group">
                <motion.div
                  className="relative text-cyan-300 font-semibold text-base cursor-pointer flex items-center gap-2 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  style={{
                    textShadow: '0 0 20px rgba(6, 229, 236, 0.5)'
                  }}
                >
                  <span className="relative z-10">Featured Tools</span>
                  <motion.span
                    className="text-sm relative z-10"
                    animate={{ y: [0, 2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ▼
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle, rgba(6, 229, 236, 0.15) 0%, transparent 70%)',
                      filter: 'blur(10px)'
                    }}
                  />
                </motion.div>

                {/* Dropdown Menu - Enhanced Glass Effect */}
                <motion.div
                  className="absolute top-full right-0 mt-3 w-72 rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
                  style={{
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(6, 229, 236, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(6, 229, 236, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  initial={{ y: -10, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                >
                  <div className="space-y-2">
                    {['Smart Project Organizer', 'Task & Calendar Optimizer', 'Permitting & Code Research Assistant', 'Role-Based Skill Accelerator'].map((item, idx) => (
                      <motion.div
                        key={idx}
                        className="relative text-white cursor-pointer px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden"
                        whileHover={{ scale: 1.02, x: 4 }}
                        style={{
                          background: 'rgba(6, 229, 236, 0.05)'
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: 'linear-gradient(90deg, rgba(6, 229, 236, 0.15) 0%, rgba(6, 229, 236, 0.05) 100%)',
                            boxShadow: 'inset 0 0 20px rgba(6, 229, 236, 0.2)'
                          }}
                        />
                        <span className="relative z-10 font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Free Prompt Tutor */}
              <motion.div
                className="relative text-cyan-300 font-semibold text-base cursor-pointer transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                style={{
                  textShadow: '0 0 20px rgba(6, 229, 236, 0.5)'
                }}
              >
                <span className="relative z-10">Free Prompt Tutor</span>
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle, rgba(6, 229, 236, 0.15) 0%, transparent 70%)',
                    filter: 'blur(10px)'
                  }}
                />
              </motion.div>
            </div>
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
            {/* Get Started Button with unreal glow */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated glow background */}
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle, rgba(6, 229, 236, 0.6) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)',
                  padding: '4px'
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Inner glow pulse */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(6, 229, 236, 0.2) 0%, transparent 70%)'
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

              {/* Button */}
              <button
                onClick={() => navigate('/auth/signin')}
                className="relative bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all w-full md:w-auto"
              >
                Get Started with SSO Login →
              </button>
            </motion.div>

            {/* Explore Now Button with unreal glow */}
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated glow background */}
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle, rgba(6, 229, 236, 0.6) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%)',
                  padding: '4px'
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Inner glow pulse */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(6, 229, 236, 0.2) 0%, transparent 70%)'
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

              {/* Button */}
              <button
                onClick={scrollToRobots}
                className="relative border-2 border-cyan-400 text-cyan-400 px-10 py-4 rounded-full font-bold text-lg hover:bg-cyan-400/10 transition-all w-full md:w-auto"
              >
                Explore Now →
              </button>
            </motion.div>
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
      <div id="robots-section" className="relative w-full min-h-screen bg-gradient-to-b from-slate-900 via-blue-900/50 to-slate-900 py-8 px-6 overflow-visible">
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

        <div className="relative z-10 max-w-7xl mx-auto pt-20">
          {/* Section Header */}
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-3">
              <img
                src="/images/BOLD LIGHT LOGO.svg"
                alt="Bold AI Workbench"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-xl text-cyan-400 font-semibold mb-3">
              Talent + Tools Deliver AI Amplified Results™
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
              <div id="prompts-section" className="space-y-2 scroll-mt-24">
                {promptNames.map((name, index) => {
                  const isInteractive = name === 'Smart Project Organizer';
                  return (
                  <motion.div
                    key={`prompt-${index}`}
                    className={`group relative bg-slate-900/40 backdrop-blur-xl rounded-3xl p-4 cursor-pointer overflow-visible transition-all duration-500 h-20 flex items-center ${
                      isInteractive
                        ? 'border-2 border-cyan-400/60'
                        : 'border border-cyan-400/30'
                    }`}
                    whileHover={{ scale: 1.08, y: -8 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => {
                      if (isInteractive) {
                        setIsSmartProjectOrganizerModalOpen(true);
                      }
                    }}
                  >
                    {/* Enhanced Glow for Interactive Items - STRONGER */}
                    {isInteractive && (
                      <>
                        {/* Outer pulsing glow */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          animate={{
                            boxShadow: [
                              '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.3)',
                              '0 0 60px rgba(6, 229, 236, 1), 0 0 100px rgba(6, 229, 236, 0.6), inset 0 0 50px rgba(6, 229, 236, 0.5)',
                              '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.3)'
                            ]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        {/* Additional radial glow layer */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.3) 0%, transparent 70%)',
                            filter: 'blur(15px)'
                          }}
                          animate={{
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </>
                    )}

                    {/* Animated Glow Background on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.3) 0%, transparent 70%)',
                        filter: 'blur(25px)'
                      }}></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 40px rgba(6, 229, 236, 0.4), 0 0 60px rgba(6, 229, 236, 0.6)'
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

                    {/* Content with Glowing Text */}
                    <div className="relative z-10 w-full">
                      <div
                        className={`text-xl font-bold leading-tight ${
                          isInteractive ? 'text-cyan-200' : 'text-cyan-300'
                        }`}
                        style={isInteractive ? {
                          textShadow: '0 0 20px rgba(6, 229, 236, 0.8), 0 0 40px rgba(6, 229, 236, 0.5)'
                        } : {}}
                      >
                        {name}
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </motion.div>
                  );
                })}

                {/* View More Button for Prompts */}
                <button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full border-2 border-cyan-400 text-cyan-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-cyan-400/10 transition-all mt-4"
                >
                  View More →
                </button>
              </div>

              {/* Automations Column */}
              <div id="automations-section" className="space-y-2 scroll-mt-24">
                {automationNames.map((name, index) => {
                  const isInteractive = name === 'Permitting & Code Research Assistant';
                  return (
                  <motion.div
                    key={`automation-${index}`}
                    className={`group relative bg-slate-900/40 backdrop-blur-xl rounded-3xl p-4 cursor-pointer overflow-visible transition-all duration-500 h-20 flex items-center ${
                      isInteractive
                        ? 'border-2 border-cyan-400/60'
                        : 'border border-cyan-400/30'
                    }`}
                    whileHover={{ scale: 1.08, y: -8 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => {
                      if (isInteractive) {
                        setIsPermittingCodeModalOpen(true);
                      }
                    }}
                  >
                    {/* Enhanced Glow for Interactive Items - STRONGER */}
                    {isInteractive && (
                      <>
                        {/* Outer pulsing glow */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          animate={{
                            boxShadow: [
                              '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.3)',
                              '0 0 60px rgba(6, 229, 236, 1), 0 0 100px rgba(6, 229, 236, 0.6), inset 0 0 50px rgba(6, 229, 236, 0.5)',
                              '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.3)'
                            ]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        {/* Additional radial glow layer */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.3) 0%, transparent 70%)',
                            filter: 'blur(15px)'
                          }}
                          animate={{
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </>
                    )}

                    {/* Animated Glow Background on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
                        filter: 'blur(25px)'
                      }}></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 40px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.6)'
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
                          <p className="text-sm font-bold text-cyan-100 text-center leading-tight">Automate your workflows in seconds! ⚡</p>
                          <div className="absolute -bottom-3 left-6 w-4 h-4 bg-slate-900/90 border-r-2 border-b-2 border-cyan-400/70 rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(6, 229, 236, 0.8))'
                            }}></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content with Glowing Text */}
                    <div className="relative z-10 w-full">
                      <div
                        className={`text-xl font-bold leading-tight ${
                          isInteractive ? 'text-cyan-200' : 'text-cyan-300'
                        }`}
                        style={isInteractive ? {
                          textShadow: '0 0 20px rgba(6, 229, 236, 0.8), 0 0 40px rgba(6, 229, 236, 0.5)'
                        } : {}}
                      >
                        {name}
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </motion.div>
                )})}

                {/* View More Button for Automations */}
                <button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full border-2 border-cyan-400 text-cyan-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-cyan-400/10 transition-all mt-4"
                >
                  View More →
                </button>
              </div>

              {/* AI Agents Column */}
              <div id="ai-agents-section" className="space-y-2 scroll-mt-24">
                {aiAgentNames.map((name, index) => {
                  const isInteractive = name === 'Task & Calendar Optimizer';
                  return (
                  <motion.div
                    key={`ai-agent-${index}`}
                    className={`group relative bg-slate-900/40 backdrop-blur-xl rounded-3xl p-4 cursor-pointer overflow-visible transition-all duration-500 h-20 flex items-center ${
                      isInteractive
                        ? 'border-2 border-cyan-400/60'
                        : 'border border-cyan-400/30'
                    }`}
                    whileHover={{ scale: 1.08, y: -8 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => {
                      if (isInteractive) {
                        setIsTaskCalendarModalOpen(true);
                      }
                    }}
                  >
                    {/* Enhanced Glow for Interactive Items - STRONGER */}
                    {isInteractive && (
                      <>
                        {/* Outer pulsing glow */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          animate={{
                            boxShadow: [
                              '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.3)',
                              '0 0 60px rgba(6, 229, 236, 1), 0 0 100px rgba(6, 229, 236, 0.6), inset 0 0 50px rgba(6, 229, 236, 0.5)',
                              '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.3)'
                            ]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        {/* Additional radial glow layer */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.3) 0%, transparent 70%)',
                            filter: 'blur(15px)'
                          }}
                          animate={{
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </>
                    )}

                    {/* Animated Glow Background on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.3) 0%, transparent 70%)',
                        filter: 'blur(25px)'
                      }}></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 40px rgba(6, 229, 236, 0.4), 0 0 60px rgba(6, 229, 236, 0.6)'
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
                          <p className="text-sm font-bold text-cyan-100 text-center leading-tight">Intelligent agents working for you! 🧠</p>
                          <div className="absolute -bottom-3 left-6 w-4 h-4 bg-slate-900/90 border-r-2 border-b-2 border-cyan-400/70 rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(6, 229, 236, 0.8))'
                            }}></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content with Glowing Text */}
                    <div className="relative z-10 w-full">
                      <div
                        className={`text-xl font-bold leading-tight ${
                          isInteractive ? 'text-cyan-200' : 'text-cyan-300'
                        }`}
                        style={isInteractive ? {
                          textShadow: '0 0 20px rgba(6, 229, 236, 0.8), 0 0 40px rgba(6, 229, 236, 0.5)'
                        } : {}}
                      >
                        {name}
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </motion.div>
                )})}

                {/* View More Button for AI Agents */}
                <button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full border-2 border-cyan-400 text-cyan-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-cyan-400/10 transition-all mt-4"
                >
                  View More →
                </button>
              </div>

              {/* Training Column */}
              <div id="training-section" className="space-y-2 scroll-mt-24">
                {trainingNames.map((name, index) => {
                  const isInteractive = name === 'Role-Based Skill Accelerator';
                  return (
                  <motion.div
                    key={`training-${index}`}
                    className={`group relative bg-slate-900/40 backdrop-blur-xl rounded-3xl p-4 cursor-pointer overflow-visible transition-all duration-500 h-20 flex items-center ${
                      isInteractive
                        ? 'border-2 border-cyan-400/60'
                        : 'border border-cyan-400/30'
                    }`}
                    whileHover={{ scale: 1.08, y: -8 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => {
                      if (isInteractive) {
                        setIsRoleBasedSkillModalOpen(true);
                      }
                    }}
                  >
                    {/* Enhanced Glow for Interactive Items - STRONGER */}
                    {isInteractive && (
                      <>
                        {/* Outer pulsing glow */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          animate={{
                            boxShadow: [
                              '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.3)',
                              '0 0 60px rgba(6, 229, 236, 1), 0 0 100px rgba(6, 229, 236, 0.6), inset 0 0 50px rgba(6, 229, 236, 0.5)',
                              '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4), inset 0 0 30px rgba(6, 229, 236, 0.3)'
                            ]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        {/* Additional radial glow layer */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.3) 0%, transparent 70%)',
                            filter: 'blur(15px)'
                          }}
                          animate={{
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </>
                    )}

                    {/* Animated Glow Background on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.3) 0%, transparent 70%)',
                        filter: 'blur(25px)'
                      }}></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 40px rgba(6, 229, 236, 0.4), 0 0 60px rgba(6, 229, 236, 0.6)'
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
                          <p className="text-sm font-bold text-cyan-100 text-center leading-tight">Master AI with expert training! 🎓</p>
                          <div className="absolute -bottom-3 left-6 w-4 h-4 bg-slate-900/90 border-r-2 border-b-2 border-cyan-400/70 rotate-45"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(6, 229, 236, 0.8))'
                            }}></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content with Glowing Text */}
                    <div className="relative z-10 w-full">
                      <div
                        className={`text-xl font-bold leading-tight ${
                          isInteractive ? 'text-cyan-200' : 'text-cyan-300'
                        }`}
                        style={isInteractive ? {
                          textShadow: '0 0 20px rgba(6, 229, 236, 0.8), 0 0 40px rgba(6, 229, 236, 0.5)'
                        } : {}}
                      >
                        {name}
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </motion.div>
                )})}

                {/* View More Button for Training */}
                <button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full border-2 border-cyan-400 text-cyan-400 px-4 py-2 rounded-full font-bold text-sm hover:bg-cyan-400/10 transition-all mt-4"
                >
                  View More →
                </button>
              </div>
            </div>

            {/* Description Text - ONCE below all columns */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-lg text-white max-w-4xl mx-auto leading-relaxed mb-2">
                Your space to explore and use over 400 proprietary AI-powered tools designed to make work faster, smarter, and easier.
              </p>
              <p className="text-base text-gray-400">
                Tools are grouped into four simple categories so you can quickly find what you need.
              </p>
            </motion.div>

            {/* Bold AI Workbench Section - Vertical Stacked Layout */}
            <motion.div
              className="relative mt-40 mb-32 px-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Main content - no container, full width */}
              <div className="relative max-w-6xl mx-auto space-y-20">
                {/* Row 1: Waving Robot */}
                <motion.div
                  className="flex justify-center"
                  animate={{
                    y: [0, -15, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <img
                    src="/images/Client Facing Images/bench-buddy.webp"
                    alt="Bench Buddy Robot"
                    className="w-72 h-72 md:w-96 md:h-96 lg:w-[432px] lg:h-[432px] object-contain"
                    style={{
                      filter: 'drop-shadow(0 0 30px rgba(6, 229, 236, 0.7))'
                    }}
                  />
                </motion.div>

                {/* Row 2: Title and Description */}
                <div className="text-center space-y-6 px-4">
                  <motion.h2
                    className="text-5xl md:text-6xl font-bold text-white mb-6"
                    style={{
                      textShadow: '0 0 50px rgba(6, 229, 236, 0.6), 0 0 100px rgba(6, 229, 236, 0.3)'
                    }}
                  >
                    Bold AI Workbench
                  </motion.h2>
                  <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                    Bold AI Workbench gives our employees AI tools and training to support their day-to-day work.
                  </p>
                  <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                    Learn more about our AI Amplified Talent on the Bold Business website.
                  </p>
                </div>

                {/* Visit Bold Business Button - Between description and lady */}
                <div className="flex justify-center pt-8">
                  <motion.a
                    href="https://www.boldbusiness.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Pulsing glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4)',
                          '0 0 50px rgba(6, 229, 236, 0.8), 0 0 100px rgba(6, 229, 236, 0.6)',
                          '0 0 30px rgba(6, 229, 236, 0.6), 0 0 60px rgba(6, 229, 236, 0.4)'
                        ]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div className="relative px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-full border-2 border-cyan-400 shadow-2xl group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300">
                      Visit Bold Business
                    </div>
                  </motion.a>
                </div>

                {/* Row 3: Lady with floating badges - PROPERLY SCALED */}
                <div className="relative flex justify-center min-h-[600px] py-12">
                  <motion.img
                    src="/images/Client Facing Images/Get-Free-Prompt-Tutor-Access.webp"
                    alt="Professional using AI tools"
                    className="w-full max-w-3xl h-auto object-contain relative z-10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                  />

                  {/* Floating badges - positioned like reference image with better spacing */}
                  {[
                    { text: 'Fun to use', position: 'top-16 left-1/2 -translate-x-1/2', delay: 0.3 },
                    { text: 'Easy to Start', position: 'top-40 left-12 md:left-24', delay: 0.4 },
                    { text: 'Built to scale', position: 'top-36 right-12 md:right-24', delay: 0.5 },
                    { text: 'Work moves faster', position: 'top-64 right-8 md:right-16', delay: 0.6 },
                    { text: 'Always-on help', position: 'top-72 left-8 md:left-16', delay: 0.7 }
                  ].map((badge, index) => (
                    <motion.div
                      key={index}
                      className={`absolute ${badge.position} z-20`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: badge.delay }}
                      viewport={{ once: true }}
                      animate={{
                        y: [0, -12, 0]
                      }}
                      transition={{
                        y: {
                          duration: 3 + index * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      <motion.div
                        className="relative bg-white text-blue-700 px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base shadow-2xl whitespace-nowrap border-2 border-blue-100"
                        animate={{
                          boxShadow: [
                            '0 4px 20px rgba(6, 229, 236, 0.3)',
                            '0 8px 40px rgba(6, 229, 236, 0.5)',
                            '0 4px 20px rgba(6, 229, 236, 0.3)'
                          ]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2
                        }}
                      >
                        {badge.text}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        {/* END of max-w-6xl container */}

        {/* Our Success Stories Section - FULL WIDTH - White Liquid Glass Effect */}
        <div
          className="relative w-screen py-20 overflow-hidden mt-20"
          style={{
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)'
          }}
        >
          {/* Base gradient background - Vibrant pastel */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 30%, #fce7f3 60%, #dbeafe 100%)'
            }}
          />

          {/* iOS White/Light Liquid Glass Overlay - Enhanced */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 255, 0.3) 50%, rgba(255, 255, 255, 0.4) 100%)',
              backdropFilter: 'blur(80px) saturate(180%) brightness(110%)',
              WebkitBackdropFilter: 'blur(80px) saturate(180%) brightness(110%)',
              boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(255, 255, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.05)'
            }}
          />

          {/* Animated glowing orbs - Enhanced visibility */}
          <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none opacity-50">
            <div
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(199, 210, 254, 0.4) 50%, transparent 70%)',
                filter: 'blur(120px)',
                animationDuration: '8s'
              }}
            />
            <div
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(233, 213, 255, 0.8) 0%, rgba(191, 219, 254, 0.4) 50%, transparent 70%)',
                filter: 'blur(120px)',
                animationDuration: '10s',
                animationDelay: '1s'
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(252, 231, 243, 0.7) 0%, transparent 70%)',
                filter: 'blur(100px)',
                animationDuration: '12s',
                animationDelay: '2s'
              }}
            />
          </div>

          {/* Content Container with Image and Text */}
          <div className="relative z-30 max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between gap-12 mb-16">
              {/* Left Side - Image (Flipped and 1.5x bigger) */}
              <div className="flex-shrink-0">
                <img
                  src="/images/Client%20Facing%20Images/Our-Talents-Stories.webp"
                  alt="Our Talents Stories"
                  className="h-auto object-contain"
                  style={{
                    width: '750px', // 1.5x of 500px
                    transform: 'scaleX(-1)', // Flip horizontally
                    filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))'
                  }}
                />
              </div>

              {/* Right Side - Title */}
              <div className="flex-1">
                <h2
                  className="text-7xl font-bold text-blue-700"
                  style={{
                    textShadow: '0 2px 10px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  Our Success Stories
                </h2>
              </div>
            </div>
          </div>

          <div className="relative z-30 overflow-hidden w-full cursor-grab active:cursor-grabbing">
            <motion.div
              className="flex gap-8"
              drag="x"
              dragConstraints={{ left: -10000, right: 0 }}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
              animate={{
                x: ['0%', '-50%']
              }}
              transition={{
                x: {
                  duration: 100,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop"
                }
              }}
              onAnimationComplete={() => {
                // Reset position seamlessly when animation completes
                return;
              }}
              style={{
                width: 'max-content',
                willChange: 'transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
                {/* Duplicate the testimonials 2 times for seamless infinite loop */}
                {[...Array(2)].map((_, duplicateIndex) => (
                  <div key={duplicateIndex} className="flex gap-8">
                    {[
                      { text: "Bold's 'AI-Amplified Talent' is different because instead of just sending over people to fill seats, they match roles with real expertise and AI support. This way, clients don't just get staff—they get people who can make an impact right away and work smarter.", author: "Darah Palanas" },
                      { text: "Bold's AI helps in repetitive tasks, giving us more free time to focus on other things that require strategic thinkings", author: "Louise Vivero" },
                      { text: "Bold's approach uses AI to enhance human expertise. By adding AI insights, tools, and workflows, teams can work smarter, adapt faster, and scale while keeping quality high.", author: "Josephine Gentapa" },
                      { text: "I believe that focusing on AI initiatives is crucial for us to maintain our competitive edge and stay ahead in the market.", author: "Wendy Toll" },
                      { text: "Bold Business is evolving with AI to transform the future of work", author: "Camille Garcia" },
                      { text: "What excites me most is how Bold's move toward AI-amplified talent delivery isn't just about adopting new technology — it's about scaling human potential.", author: "Viviana De Ossa" },
                      { text: "These new tools make our work easier, more efficient, and to stay competitive in today's fast-moving industry.", author: "Michelle Quising" },
                      { text: "Bold's approach focuses on making human talent more powerful by using AI as a strategic partner which is really amazing.", author: "Vina Vizconde" },
                      { text: "Traditional staffing fills roles with people. Bold's AI-Amplified Talent fills roles with outcomes. We combine skilled professionals with AI-driven processes so they deliver faster, smarter, and with greater impact from day one.", author: "Evwina Basan" }
                    ].map((testimonial, index) => (
                      <div
                        key={`${duplicateIndex}-${index}`}
                        className="relative inline-block rounded-2xl p-8 border-2 border-blue-400/40 flex-shrink-0 transition-all duration-300 hover:border-blue-500/70 hover:scale-[1.02] hover:shadow-2xl group"
                        style={{
                          width: '684px',  // 380 * 1.8
                          height: '252px',  // 140 * 1.8
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(99, 102, 241, 0.95) 100%)',
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                          boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                          transform: 'translateZ(0)',
                          willChange: 'transform'
                        }}
                      >
                        <p className="text-white text-base leading-relaxed mb-4 whitespace-normal line-clamp-4 font-medium">"{testimonial.text}"</p>
                        <p className="text-blue-100 font-bold text-sm absolute bottom-6">- {testimonial.author}</p>

                        {/* Glowing edge effect on hover */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                            boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.2)'
                          }}
                        />

                        {/* Subtle corner accents */}
                        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
                        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg" />
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
        </div>
        {/* END of Our Success Stories Section */}

        {/* FAQ Section - Modern Card Grid Layout */}
        <div className="relative py-24 px-6 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />

          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

          <div className="relative max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <motion.h2
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                className="text-xl text-blue-200/80 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Everything you need to know about the Bold AI Workbench
              </motion.p>
            </div>

            {/* FAQ Grid - 2 columns */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: "What is the Bold AI Workbench?",
                  a: "The Bold AI Workbench is our proprietary platform that equips Bold associates with curated AI tools, workflows, and automation capabilities to deliver faster, smarter, and more consistent performance."
                },
                {
                  q: "How does the AI Workbench help Bold associates perform better?",
                  a: "It streamlines repetitive tasks, reinforces SOPs, and delivers real-time prompts and process guidance-enabling associates to focus on high-value work while reducing error and training time."
                },
                {
                  q: "Is the AI Workbench used by all Bold associates?",
                  a: "Yes. Every Bold associate has access to the Workbench, ensuring consistency and AI-enabled performance across all accounts."
                },
                {
                  q: "What kinds of tasks does the Workbench support?",
                  a: "From candidate screening and knowledge retrieval to time tracking, communications, and reporting, the Workbench enhances everyday workflows with smart automation and intelligent prompts."
                },
                {
                  q: "Is the Workbench customizable for different teams or clients?",
                  a: "Yes. The AI Workbench can be tailored to specific roles, SOPs, and client needs, ensuring relevance and precision in every environment."
                },
                {
                  q: "How does the Workbench improve onboarding and training?",
                  a: "New associates ramp faster with embedded training modules, real-time coaching tools, and knowledge retrieval bots that guide them through tasks step-by-step."
                },
                {
                  q: "Does using the Workbench require technical skills?",
                  a: "Not at all. The platform is designed for ease of use, with intuitive interfaces and guided actions so associates can leverage AI without needing technical expertise."
                },
                {
                  q: "How is performance measured through the Workbench?",
                  a: "Integrated analytics and dashboards provide visibility into task completion, efficiency metrics, SLA adherence, and quality assurance in real time."
                },
                {
                  q: "What's the difference between Bold associates and traditional staffing?",
                  a: "Our associates are not just placed-they're equipped. With the AI Workbench, every team member is backed by automation, process discipline, and performance insights from day one."
                },
                {
                  q: "Is the Workbench secure and compliant with data standards?",
                  a: "Yes. The platform is built with enterprise-grade security, data privacy protocols, and role-based access controls to ensure client and employee information is protected."
                },
                {
                  q: "What types of AI tools are integrated into the Workbench?",
                  a: "The Workbench includes tools for process automation, document handling, generative AI content, knowledge bots, dashboards, and more-curated specifically for Bold's operational needs."
                },
                {
                  q: "How does the AI Workbench support quality assurance?",
                  a: "It reinforces SOPs in real time, flags inconsistencies, and integrates with QA workflows to help associates self-correct and stay aligned with client expectations."
                },
                {
                  q: "Can the Workbench help reduce response times or SLAs?",
                  a: "Yes. associates complete tasks faster with fewer errors by using Workbench automations, task prompts, and content templates tailored to their role."
                },
                {
                  q: "How does Bold train associates to use the Workbench?",
                  a: "Training is built in. associates learn through embedded onboarding modules, guided workflows, and in-platform reinforcement using tools like Gemini."
                },
                {
                  q: "Can clients see what's happening inside the Workbench?",
                  a: "While clients don't use the Workbench directly, they benefit from it through transparent reporting, performance dashboards, and measurable improvements in speed and quality."
                },
                {
                  q: "How often is the AI Workbench updated?",
                  a: "The platform is continuously optimized with new tools, automations, and process enhancements based on associate feedback, QA findings, and evolving client needs."
                },
                {
                  q: "What industries or roles does the Workbench support?",
                  a: "It's designed for cross-functional teams including HR, customer service, content, operations, and recruiting-adapting easily to vertical-specific workflows."
                },
                {
                  q: "How is the AI Workbench different from other platforms?",
                  a: "Unlike generic tools, the Workbench is tailored to Bold's operational DNA. It's built to equip people-not replace them-through smart, scalable AI integration."
                },
                {
                  q: "Can the Workbench help reduce training costs?",
                  a: "Yes. Faster onboarding, self-serve guidance, and consistent process delivery significantly reduce the time and cost associated with traditional training programs."
                },
                {
                  q: "What's next for the AI Workbench?",
                  a: "We're continuously expanding its capabilities-including new Gemini bots, deeper role-based customization, and smarter QA automation to further elevate associate performance."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="group relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl rounded-2xl p-8 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  {/* Question number badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-black text-lg">{index + 1}</span>
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/10 group-hover:to-indigo-400/10 transition-all duration-300 pointer-events-none" />

                  {/* Question */}
                  <h3 className="text-xl font-bold text-blue-100 mb-4 pr-8 leading-tight">
                    {faq.q}
                  </h3>

                  {/* Answer */}
                  <p className="text-blue-200/80 leading-relaxed">
                    {faq.a}
                  </p>

                  {/* Decorative corner accent */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-400/30 rounded-br-xl group-hover:border-blue-400/60 transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        {/* END of FAQ Section */}

        {/* Amplify Your People CTA Section */}
        <div className="relative py-24 px-6 overflow-hidden">
          {/* Dynamic gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />

          {/* Animated floating orbs */}
          <div className="absolute top-10 left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              className="relative bg-gradient-to-br from-blue-600/60 to-indigo-700/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-blue-300/30 shadow-2xl shadow-blue-900/50"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-indigo-400/20 blur-xl" />

              <div className="relative grid md:grid-cols-2 gap-12 items-center p-12 md:p-16">
                {/* Left side - Image */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  {/* Glow effect behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl blur-2xl transform scale-105" />

                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/50 transform hover:scale-105 transition-transform duration-500">
                    <img
                      src="/images/Client%20Facing%20Images/Amplify-your-people.-Multiply-your-impact.webp"
                      alt="Amplify your people with AI"
                      className="w-full h-auto"
                    />
                    {/* Overlay gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
                  </div>

                  {/* Floating accent elements */}
                  <motion.div
                    className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl opacity-80 blur-xl"
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 10, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl opacity-60 blur-xl"
                    animate={{
                      y: [0, 20, 0],
                      rotate: [0, -10, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>

                {/* Right side - Content */}
                <motion.div
                  className="relative space-y-8"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  {/* Headline */}
                  <div>
                    <motion.h2
                      className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      Amplify your people.
                    </motion.h2>
                    <motion.h2
                      className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      Multiply your impact.
                    </motion.h2>
                  </div>

                  {/* Description */}
                  <motion.p
                    className="text-xl text-blue-100 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    See our AI Amplified journey on the Bold Business website.
                  </motion.p>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <a
                      href="https://www.boldbusiness.com/ai-amplified-talent/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-blue-900 font-black text-xl rounded-2xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                    >
                      <span>Explore the AI Journey</span>
                      <svg
                        className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </motion.div>

                  {/* Decorative elements */}
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
                </motion.div>
              </div>

              {/* Bottom decorative wave */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400" />
            </motion.div>
          </div>
        </div>
        {/* END of Amplify Your People CTA Section */}

        {/* Footer Section */}
        <footer className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-8 border-t border-blue-800/30">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="text-center">
            <p className="text-blue-200/60 text-sm">
              © 2025 Bold AI Workbench. All Rights Reserved.
            </p>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        </footer>

      </div>

      {/* TalentFit "How It Works" Modal - Shows demo images and advantages */}
      <TalentFitHowItWorksModal
        isOpen={isTalentFitModalOpen}
        onClose={() => setIsTalentFitModalOpen(false)}
      />

      {/* Smart Project Organizer Modal */}
      <SmartProjectOrganizerModal
        isOpen={isSmartProjectOrganizerModalOpen}
        onClose={() => setIsSmartProjectOrganizerModalOpen(false)}
      />

      {/* Permitting & Code Research Assistant Modal */}
      <PermittingCodeModal
        isOpen={isPermittingCodeModalOpen}
        onClose={() => setIsPermittingCodeModalOpen(false)}
      />

      {/* Task & Calendar Optimizer Modal */}
      <TaskCalendarModal
        isOpen={isTaskCalendarModalOpen}
        onClose={() => setIsTaskCalendarModalOpen(false)}
      />

      {/* Role-Based Skill Accelerator Modal */}
      <RoleBasedSkillModal
        isOpen={isRoleBasedSkillModalOpen}
        onClose={() => setIsRoleBasedSkillModalOpen(false)}
      />

      {/* ARCHIVED: Functional TalentFit Modal - Preserved for later use
      <TalentFitModal
        isOpen={isTalentFitModalOpen}
        onClose={() => setIsTalentFitModalOpen(false)}
      />
      */}
    </div>
  );
};

export default PreLoginPage;

