import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ExplorePage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const amplifiers = [
    {
      id: 'instant-prompts',
      title: 'Instant Prompts',
      image: '/images/About/InstantPrompts.webp',
      botsImage: '/images/About/InstantPromptsBots.png',
      description: 'Instant Prompts are one-click tools that deliver fast, high-quality results for everyday tasks.',
      details: 'Whether you need a polished email, a social post, a meeting summary, or a quick analysis, these prompts give your team immediate productivity boosts without any setup or training. They\'re designed for speed, simplicity, and accuracy—helping your people work smarter in seconds, not hours.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'agentic-workflows',
      title: 'Agentic Workflows',
      image: '/images/About/Agentic-Workflows.webp',
      botsImage: '/images/About/AgenticWorkflowsBots.png',
      description: 'Agentic Workflows are multi-step, AI-powered processes that act like digital teammates.',
      details: 'These tools don\'t just answer a question—they gather information, analyze it, make decisions, and produce a complete output. From automating onboarding tasks to mapping out marketing plans or analyzing feedback, Agentic Workflows remove friction, reduce errors, and keep work moving forward effortlessly.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'guided-builders',
      title: 'Guided Builders',
      image: '/images/About/Guided_Builders.png',
      botsImage: '/images/About/GuidedBuildersBots.png',
      description: 'Guided Builders help your team create high-quality, client-ready materials through structured, step-by-step guidance.',
      details: 'Instead of starting from a blank page, users follow an intelligent path that shapes proposals, reports, presentations, job descriptions, and more. The result: consistent, professional deliverables—built faster, with less effort, and tailored to your business.',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'knowledge-training',
      title: 'Knowledge & Training',
      image: '/images/About/K&T.png',
      botsImage: '/images/About/K&TBots.png',
      description: 'Knowledge & Training tools build AI literacy across your team and help employees master their roles more quickly.',
      details: 'From AI prompt tutoring to role-specific playbooks and skill accelerators, these tools teach people how to get the most from AI and from Bold\'s systems. They turn every worker into a more confident, more capable, AI-enabled performer—powering ongoing improvement across your organization.',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const benefits = [
    {
      title: 'Performance',
      description: 'People amplified by AI deliver faster, cleaner work.',
      icon: '⚡'
    },
    {
      title: 'Flexibility',
      description: 'Tools that adapt to how you already operate.',
      icon: '🔄'
    },
    {
      title: 'Peace of Mind',
      description: 'Simpler processes, smarter systems, fewer steps.',
      icon: '✨'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 overflow-y-auto scroll-smooth">
      {/* Sticky Navigation Bar */}
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
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(6, 229, 236, 0.3) 50%, transparent 100%)'
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-2xl font-bold text-white">
              Bold AI W
              <span className="text-cyan-400">o</span>
              rkbench
              <span className="text-xs align-super text-cyan-400">™</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-8">
            <motion.div
              className="relative text-cyan-300 font-semibold text-base cursor-pointer transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/explore')}
              style={{
                textShadow: '0 0 20px rgba(6, 229, 236, 0.5)'
              }}
            >
              <span className="relative z-10">About Bold AI Workbench</span>
            </motion.div>

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
              </motion.div>

              <motion.div
                className="absolute top-full right-0 mt-3 w-72 rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
                style={{
                  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: '1px solid rgba(6, 229, 236, 0.3)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(6, 229, 236, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
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
                      <span className="relative z-10 font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              className="relative text-cyan-300 font-semibold text-base cursor-pointer transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              style={{
                textShadow: '0 0 20px rgba(6, 229, 236, 0.5)'
              }}
            >
              <span className="relative z-10">Free Prompt Tutor</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section - "We've Reinvented How Work Gets Done" */}
      <div className="relative w-full pt-32 pb-10 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(6, 229, 236, 0.4) 0%, transparent 50%)',
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(2px 2px at 20% 30%, rgba(6, 229, 236, 0.3), transparent), radial-gradient(2px 2px at 60% 70%, rgba(99, 102, 241, 0.3), transparent), radial-gradient(1px 1px at 50% 50%, rgba(6, 229, 236, 0.4), transparent)',
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center py-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              We've Reinvented How Work Gets Done
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Every tool in the Bold AI Workbench turns hours into minutes. Helping teams{' '}
              <span className="text-cyan-400 font-bold">think faster</span>,{' '}
              <span className="text-purple-400 font-bold">build smarter</span>, and{' '}
              <span className="text-green-400 font-bold">perform better</span>.
            </motion.p>
          </motion.div>

          <motion.div
            className="relative flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {/* Multiple layered glows for UNREAL effect */}
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(6, 229, 236, 0.8) 0%, rgba(99, 102, 241, 0.6) 30%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />

            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(6, 229, 236, 0.5) 40%, transparent 70%)',
                filter: 'blur(80px)',
              }}
            />

            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              style={{
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.9) 0%, rgba(168, 85, 247, 0.6) 35%, transparent 65%)',
                filter: 'blur(100px)',
              }}
            />

            <motion.img
              src="/images/About/3 Circles.webp"
              alt="AI Bots"
              className="relative z-10 h-auto drop-shadow-2xl"
              style={{
                width: '80%',
                maxWidth: '450px',
                filter: 'drop-shadow(0 0 60px rgba(6, 229, 236, 0.9)) drop-shadow(0 0 100px rgba(139, 92, 246, 0.7)) drop-shadow(0 0 140px rgba(34, 211, 238, 0.5))'
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* 4 AI Amplifiers Section */}
      <div className="relative w-full py-10 px-6" style={{ background: 'rgba(15, 23, 42, 0.3)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="text-cyan-400 text-lg font-semibold mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Introducing Our
            </motion.p>
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-white mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                textShadow: '0 0 40px rgba(6, 229, 236, 0.5)'
              }}
            >
              4 AI Amplifiers
            </motion.h2>
          </motion.div>

          {/* Amplifiers Grid */}
          <div className="space-y-32 overflow-visible">
            {amplifiers.map((amplifier, index) => (
              <motion.div
                key={amplifier.id}
                className="space-y-8 overflow-visible"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                {/* Banner Image */}
                <motion.div
                  className="relative w-full rounded-3xl my-16 overflow-visible"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* ULTRA BRIGHT outer glow layers with WHITE cores - SCREEN BLEND MODE */}
                  <motion.div
                    className="absolute -inset-12 rounded-3xl blur-[80px] z-0"
                    style={{
                      background: `radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, ${amplifier.color.split(' ')[1]} 30%, ${amplifier.color.split(' ')[3]} 60%, transparent 80%)`,
                      mixBlendMode: 'screen'
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.9, 1, 0.9],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  <motion.div
                    className="absolute -inset-16 rounded-3xl blur-[120px] z-0"
                    style={{
                      background: `radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, ${amplifier.color.split(' ')[1]} 20%, ${amplifier.color.split(' ')[3]} 50%, transparent 75%)`,
                      mixBlendMode: 'screen'
                    }}
                    animate={{
                      scale: [1.2, 1.4, 1.2],
                      opacity: [0.8, 1, 0.8],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  <motion.div
                    className="absolute -inset-20 rounded-3xl blur-[160px] z-0"
                    style={{
                      background: `radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, ${amplifier.color.split(' ')[3]} 15%, ${amplifier.color.split(' ')[1]} 40%, transparent 70%)`,
                      mixBlendMode: 'screen'
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 0.95, 0.7],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                  />

                  <motion.div
                    className="absolute -inset-24 rounded-3xl blur-[200px] z-0"
                    style={{
                      background: `radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, ${amplifier.color.split(' ')[1]} 10%, ${amplifier.color.split(' ')[3]} 35%, transparent 65%)`,
                      mixBlendMode: 'screen'
                    }}
                    animate={{
                      scale: [1.1, 1.6, 1.1],
                      opacity: [0.6, 0.9, 0.6],
                      rotate: [360, 180, 0],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2
                    }}
                  />

                  <div className="relative z-10 rounded-3xl overflow-hidden"
                    style={{
                      boxShadow: `0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px ${amplifier.color.split(' ')[1]}, 0 0 140px ${amplifier.color.split(' ')[3]}, 0 20px 100px ${amplifier.color.split(' ')[1]}90`
                    }}
                  >
                    <img
                      src={amplifier.image}
                      alt={`${amplifier.title} Banner`}
                      className="w-full h-auto"
                    />
                  </div>
                </motion.div>

                {/* Content Grid */}
                <div className={`grid md:grid-cols-2 gap-12 items-center overflow-visible ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Image Side */}
                  <motion.div
                    className={`relative overflow-visible ${index % 2 === 1 ? 'md:order-2' : ''}`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative p-16 overflow-visible">
                      {/* MEGA ULTRA INTENSE layered glows with WHITE CORES for BOT IMAGES - SCREEN BLEND */}
                      <motion.div
                        className="absolute -inset-16 rounded-3xl blur-[80px] z-0"
                        style={{
                          background: `radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, ${amplifier.color.split(' ')[1]} 20%, ${amplifier.color.split(' ')[3]} 45%, transparent 70%)`,
                          mixBlendMode: 'screen'
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 1, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      <motion.div
                        className="absolute -inset-20 rounded-3xl blur-[120px] z-0"
                        style={{
                          background: `radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, ${amplifier.color.split(' ')[1]} 15%, ${amplifier.color.split(' ')[3]} 40%, transparent 65%)`,
                          mixBlendMode: 'screen'
                        }}
                        animate={{
                          scale: [1.4, 1, 1.4],
                          opacity: [1, 1, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      <motion.div
                        className="absolute -inset-24 rounded-3xl blur-[160px] z-0"
                        style={{
                          background: `radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, ${amplifier.color.split(' ')[3]} 10%, ${amplifier.color.split(' ')[1]} 35%, transparent 60%)`,
                          mixBlendMode: 'screen'
                        }}
                        animate={{
                          scale: [1, 1.6, 1],
                          opacity: [0.9, 1, 0.9],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1.5
                        }}
                      />

                      <motion.div
                        className="absolute -inset-28 rounded-3xl blur-[200px] z-0"
                        style={{
                          background: `radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, ${amplifier.color.split(' ')[1]} 8%, ${amplifier.color.split(' ')[3]} 30%, transparent 55%)`,
                          mixBlendMode: 'screen'
                        }}
                        animate={{
                          scale: [1.3, 1.7, 1.3],
                          opacity: [0.8, 1, 0.8],
                          rotate: [360, 180, 0],
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 2
                        }}
                      />

                      <motion.img
                        src={amplifier.botsImage}
                        alt={amplifier.title}
                        className="relative z-10 w-full h-auto rounded-3xl"
                        animate={{
                          y: [0, -15, 0],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          filter: `drop-shadow(0 0 40px rgba(255, 255, 255, 1)) drop-shadow(0 0 80px ${amplifier.color.split(' ')[1]}) drop-shadow(0 0 120px ${amplifier.color.split(' ')[3]}) drop-shadow(0 0 160px ${amplifier.color.split(' ')[1]}) drop-shadow(0 20px 100px rgba(0, 0, 0, 0.8))`
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Content Side */}
                  <motion.div
                    className={`${index % 2 === 1 ? 'md:order-1' : ''}`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <motion.div
                      className="inline-block mb-4 px-4 py-2 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${amplifier.color.split(' ')[1]}20, ${amplifier.color.split(' ')[3]}20)`,
                        border: `1px solid ${amplifier.color.split(' ')[1]}40`
                      }}
                    >
                      <span className={`text-sm font-semibold bg-gradient-to-r ${amplifier.color} bg-clip-text text-transparent`}>
                        What it does?
                      </span>
                    </motion.div>

                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      {amplifier.title}
                    </h3>

                    <p className="text-xl text-gray-300 mb-4 font-semibold">
                      {amplifier.description}
                    </p>

                    <p className="text-lg text-gray-400 leading-relaxed">
                      {amplifier.details}
                    </p>

                    <motion.div
                      className="mt-8 relative inline-block"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* INTENSE Button glow layers */}
                      <motion.div
                        className="absolute -inset-4 rounded-xl blur-[40px]"
                        style={{
                          background: `linear-gradient(135deg, ${amplifier.color.split(' ')[1]}, ${amplifier.color.split(' ')[3]})`
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      <motion.div
                        className="absolute -inset-6 rounded-xl blur-[60px]"
                        style={{
                          background: `radial-gradient(circle, ${amplifier.color.split(' ')[1]} 0%, ${amplifier.color.split(' ')[3]} 100%)`
                        }}
                        animate={{
                          scale: [1.2, 1.5, 1.2],
                          opacity: [0.6, 0.9, 0.6],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                      />

                      <motion.div
                        className="absolute -inset-8 rounded-xl blur-[80px]"
                        style={{
                          background: `radial-gradient(circle, ${amplifier.color.split(' ')[3]} 0%, ${amplifier.color.split(' ')[1]} 60%, transparent 80%)`
                        }}
                        animate={{
                          scale: [1.1, 1.6, 1.1],
                          opacity: [0.5, 0.8, 0.5],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      />

                      <button
                        className={`relative z-10 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${amplifier.color} shadow-lg transition-all duration-300`}
                        style={{
                          boxShadow: `0 0 60px ${amplifier.color.split(' ')[1]}, 0 0 120px ${amplifier.color.split(' ')[3]}, 0 0 180px ${amplifier.color.split(' ')[1]}80, 0 10px 40px ${amplifier.color.split(' ')[1]}90`
                        }}
                      >
                        Learn More
                      </button>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative w-full py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="relative p-12 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(6, 229, 236, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(6, 229, 236, 0.2)'
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(6, 229, 236, 0.4) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
              Curious how this fits into our broader services?
            </h2>
            <p className="text-xl text-gray-300 mb-8 relative z-10">
              Visit the Bold Business website to learn more about AI Amplified Talent.
            </p>
            <motion.button
              className="relative z-10 px-10 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://boldbusiness.com', '_blank')}
              style={{
                boxShadow: '0 10px 30px rgba(6, 229, 236, 0.4)'
              }}
            >
              Visit Bold Business
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Why Bold's Workbench Changes the Game */}
      <div className="relative w-full py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.p
              className="text-cyan-400 text-2xl font-semibold mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Why Bold's
            </motion.p>
            <motion.h2
              className="text-6xl md:text-7xl font-bold text-white mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                textShadow: '0 0 40px rgba(6, 229, 236, 0.5)'
              }}
            >
              Workbench Changes the Game
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="relative p-8 rounded-2xl overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(6, 229, 236, 0.2)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(6, 229, 236, 0.1) 0%, transparent 70%)'
                  }}
                />

                <div className="relative z-10">
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {benefit.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300 text-lg">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/images/About/AboutUsBottomImage.png"
              alt="Bold AI Workbench"
              className="w-full h-auto rounded-3xl"
              style={{
                filter: 'drop-shadow(0 20px 60px rgba(6, 229, 236, 0.3))'
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative w-full py-12 px-6 bg-slate-950 border-t border-cyan-900/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Bold AI Workbench. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExplorePage;

