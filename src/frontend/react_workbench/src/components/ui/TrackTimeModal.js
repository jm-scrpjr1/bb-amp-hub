import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, ExternalLink } from 'lucide-react';
import GenieModal from './GenieModal';

const TrackTimeModal = memo(function TrackTimeModal({ isOpen, onClose, triggerElement }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredPlatform, setHoveredPlatform] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const platforms = [
    {
      id: 'tsheet',
      name: 'TSheets',
      url: 'https://tsheets.intuit.com/',
      description: 'Intuit QuickBooks Time tracking solution',
      logo: (
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4-4H7v2h10V7z"/>
          </svg>
        </div>
      ),
      color: 'from-green-500 to-emerald-600',
      gradient: 'bg-gradient-to-br from-green-50 to-emerald-50'
    },
    {
      id: 'sprout',
      name: 'Sprout',
      url: 'https://sso.sprout.ph/realms/boldbusiness/protocol/openid-connect/auth?client_id=SproutSSO&redirect_uri=https%3A%2F%2Fboldbusiness.hrhub.ph%2F&response_type=code%20id_token&scope=openid%20profile&state=OpenIdConnect.AuthenticationProperties%3DxyHkJwBNCPVeyLt90QUQ8cestKkk1ZQRrUBbEAb0LATdzs5HF1jrsb1JVq9k29tzVg60mxmyJGpCVUoUURAMgd5JnEeJR59vYxRTEix9JvVnsEBvpS415RbtaFvjoFo4Exsy9nO8SKFidScjalAWgc29Oo0LwMHV5c2QauXgWU1Uk02WMdAMeKyd_wlVBSir17aNCA&response_mode=form_post&nonce=638932224909690080.NzliY2QwOGItZjM4OS00MmIxLWJkZGItYTY3MDRhZjQyNmI1YTlhNDZmOTAtYmJjOS00NGFjLTkxMDItMzA3ZjdjOTAzMDA5&x-client-SKU=ID_NET461&x-client-ver=5.3.0.0',
      description: 'Bold Business HR Hub time tracking',
      logo: (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.3)"/>
          </svg>
        </div>
      ),
      color: 'from-blue-500 to-indigo-600',
      gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50'
    },
    {
      id: 'aleluya',
      name: 'Aleluya',
      url: 'https://tranqui.aleluya.com/novelties_request_history',
      description: 'Aleluya time tracking and novelties',
      logo: (
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z"/>
            <path d="M12 7v10M7 12h10" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"/>
          </svg>
        </div>
      ),
      color: 'from-purple-500 to-violet-600',
      gradient: 'bg-gradient-to-br from-purple-50 to-violet-50'
    }
  ];

  const handlePlatformClick = useCallback((url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  if (!mounted) return null;

  return (
    <GenieModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-blue-300/50"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(37, 99, 235, 0.2), 0 0 50px rgba(37, 99, 235, 0.2)'
      }}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-600/20 blur-sm -z-10" />
      
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Clock className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h2
                className="text-xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Track My Time
              </motion.h2>
              <motion.p
                className="text-blue-100 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Choose your preferred time tracking platform
              </motion.p>
            </div>
          </div>

          <motion.div
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-sm border border-white/20"
            title="Close"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      {/* Platform Options */}
      <div className="p-8 bg-gradient-to-b from-gray-50/50 to-white">
        <motion.div
          className="grid gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.id}
              className={`relative group cursor-pointer rounded-2xl border-2 border-gray-200 hover:border-transparent transition-all duration-500 overflow-hidden ${platform.gradient} hover:shadow-2xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{
                scale: 1.03,
                y: -4,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePlatformClick(platform.url)}
              onMouseEnter={() => setHoveredPlatform(platform.id)}
              onMouseLeave={() => setHoveredPlatform(null)}
            >
              {/* Animated gradient border on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${platform.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
              <div className="absolute inset-[2px] bg-white rounded-2xl" />

              {/* Animated glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${platform.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`} />
              
              {/* Content */}
              <div className="relative p-6 flex items-center space-x-4">
                <motion.div
                  animate={hoveredPlatform === platform.id ? {
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {platform.logo}
                </motion.div>

                <div className="flex-1">
                  <motion.h3
                    className="text-lg font-semibold text-gray-900 group-hover:text-gray-800"
                    animate={hoveredPlatform === platform.id ? { x: [0, 2, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {platform.name}
                  </motion.h3>
                  <motion.p
                    className="text-sm text-gray-600 group-hover:text-gray-700"
                    animate={hoveredPlatform === platform.id ? { x: [0, 2, 0] } : {}}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {platform.description}
                  </motion.p>
                </div>

                <motion.div
                  className="text-gray-400 group-hover:text-gray-600"
                  animate={hoveredPlatform === platform.id ? {
                    x: [0, 3, 0],
                    rotate: [0, 15, 0]
                  } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <ExternalLink className="w-5 h-5" />
                </motion.div>
              </div>
              
              {/* Enhanced hover effect particles */}
              {hoveredPlatform === platform.id && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1.5 h-1.5 bg-gradient-to-r ${platform.color} rounded-full shadow-lg`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                        x: [0, (Math.random() - 0.5) * 200],
                        y: [0, (Math.random() - 0.5) * 200]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                      }}
                    />
                  ))}

                  {/* Ripple effect */}
                  <motion.div
                    className={`absolute inset-0 border-2 border-gradient-to-r ${platform.color} rounded-2xl`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: [0.8, 1.2],
                      opacity: [0.5, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        {/* Enhanced Footer */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Click on any platform to open it in a new tab
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure external links • Powered by Bold Business AI
          </p>
        </motion.div>
      </div>
    </GenieModal>
  );
});

export default TrackTimeModal;
