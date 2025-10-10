import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { ScrollEffects } from '../effects';
import TutorialButton from './TutorialButton';

const WelcomeSection = ({ showWelcomeBanner = true }) => {
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get the user's first name
  const getUserName = () => {
    if (loading) {
      return 'Loading...';
    }
    return user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  };

  // Optimized text scramble effect
  const TextScramble = ({ text, speed = 25 }) => {
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
      if (!text) return;

      const chars = '!<>-_\\/[]{}—=+*^?#';
      let iteration = 0;

      const interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          setDisplayText(text);
          setIsComplete(true);
          clearInterval(interval);
        }

        iteration += 0.5; // Faster progression
      }, speed);

      return () => clearInterval(interval);
    }, [text, speed]);

    return <span>{displayText}</span>;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Large Welcome Message Container - Conditional */}
      {showWelcomeBanner && (
        <div className={`bg-blue-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden transition-all duration-1000 ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
        }`}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>

          <div className="relative z-10 text-center">
            {/* User Profile Photo */}
            {!loading && user?.image && user.image !== '/images/AI AGENT 5.png' && (
              <ScrollEffects effect="scale" delay={0.2}>
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 backdrop-blur-sm">
                    <img
                      src={user.image}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide the image container if it fails to load
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </ScrollEffects>
            )}

            {/* Large Welcome Message */}
            {loading ? (
              <div className="space-y-4 flex justify-center">
                <div className="h-16 bg-white/20 rounded animate-pulse w-96"></div>
              </div>
            ) : (
              <ScrollEffects effect="fadeUp" delay={0.4}>
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
                  style={{
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <TextScramble
                    text={`Welcome, ${getUserName()}!`}
                    speed={25}
                  />
                </h1>
              </ScrollEffects>
            )}
          </div>
        </div>
      )}

      {/* AI Workspace Information Container */}
      <div className={`bg-blue-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>

        <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="flex-1 text-left mb-6 md:mb-0">
            <ScrollEffects effect="fadeUp" delay={0.6}>
              <h2 className="text-2xl md:text-3xl text-white mb-4 font-medium flex items-center">
                <Sparkles className="h-8 w-8 mr-3 text-cyan-300" />
                AI-Amplified™ Workspace
              </h2>
            </ScrollEffects>

            <ScrollEffects effect="fadeUp" delay={0.8}>
              <div className="space-y-2 text-blue-100 mb-6">
                <p className="text-xl">Select your tools. Start your work. Ask for help.</p>
                <p className="text-xl font-semibold">Get amplified results.</p>
              </div>
            </ScrollEffects>

            <ScrollEffects effect="fadeUp" delay={1.0}>
              <TutorialButton />
            </ScrollEffects>
          </div>

          {/* Robot Team Illustration */}
          <div className="flex-shrink-0 md:ml-8">
            <ScrollEffects effect="scale" delay={0.6}>
              <div className="relative">
                <div className="w-96 h-48 md:w-[32rem] md:h-64 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm p-4 border border-white/20">
                  <img
                    src="/images/robot-team.png"
                    alt="Bold Business AI Robot Team"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute -top-3 -right-3 bg-cyan-400 text-blue-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  AI Team Ready!
                </div>
                <div className="absolute -bottom-3 -left-3 bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-medium shadow-md">
                  Powered by ARIA
                </div>
              </div>
            </ScrollEffects>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
