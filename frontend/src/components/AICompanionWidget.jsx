/**
 * AI Companion Widget - Emotional Support Interface
 * Beautiful, animated companion that provides encouragement and celebrates with users
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AICompanionWidget({ 
  companion, 
  userState, 
  onPersonalityChange,
  isVisible = true 
}) {
  const [companionResponse, setCompanionResponse] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPersonalityMenu, setShowPersonalityMenu] = useState(false);
  const messageTimeoutRef = useRef(null);

  // Update companion response when user state changes
  useEffect(() => {
    if (companion && userState) {
      const response = companion.analyzeAndRespond(userState);
      
      if (response.message && response.priority === 'high') {
        showCompanionMessage(response);
      }
    }
  }, [userState, companion]);

  // Show companion message with animation
  const showCompanionMessage = (response) => {
    setCompanionResponse(response);
    setShowMessage(true);
    setIsAnimating(true);

    // Clear existing timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    // Auto-hide message after delay
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
      setTimeout(() => setIsAnimating(false), 500);
    }, response.priority === 'high' ? 5000 : 3000);
  };

  // Get companion visual state
  const visualState = companion?.getVisualState() || {
    emoji: '✨',
    color: '#FFD700',
    animation: 'glow',
    energy: 0.8,
    relationship: 0.5
  };

  // Animation variants for different emotions
  const animations = {
    bounce: {
      y: [0, -10, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
    },
    glow: {
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    sparkle: {
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      transition: { duration: 1, repeat: Infinity }
    },
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 1.5, repeat: Infinity }
    },
    breathe: {
      scale: [1, 1.05, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    float: {
      y: [0, -5, 0],
      x: [0, 2, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    star: {
      rotate: [0, 180, 360],
      scale: [1, 1.3, 1],
      transition: { duration: 0.8, repeat: 3 }
    }
  };

  // Handle companion click for interaction
  const handleCompanionClick = () => {
    if (companion) {
      const encouragement = companion.getRandomMessage('motivation');
      showCompanionMessage({
        message: encouragement,
        emotion: 'happy',
        animation: 'bounce',
        priority: 'normal'
      });
    }
  };

  // Get relationship level display
  const getRelationshipLevel = () => {
    const level = Math.round(visualState.relationship * 100);
    if (level < 25) return { name: 'New Friend', color: '#87CEEB' };
    if (level < 50) return { name: 'Good Friend', color: '#98FB98' };
    if (level < 75) return { name: 'Best Friend', color: '#FFB6C1' };
    return { name: 'Soul Mate', color: '#FFD700' };
  };

  if (!isVisible) return null;

  const relationshipLevel = getRelationshipLevel();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Companion Message */}
      <AnimatePresence>
        {showMessage && companionResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-4 max-w-xs"
          >
            <div 
              className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20"
              style={{ 
                boxShadow: `0 0 20px ${visualState.color}40` 
              }}
            >
              <div className="text-white font-medium text-sm leading-relaxed">
                {companionResponse.message}
              </div>
              
              {/* Message tail */}
              <div 
                className="absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-purple-600/90 transform translate-y-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion Avatar */}
      <motion.div
        className="relative cursor-pointer"
        onClick={handleCompanionClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Relationship glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-60"
          style={{ backgroundColor: relationshipLevel.color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Main companion circle */}
        <motion.div
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30"
          style={{ 
            background: `linear-gradient(135deg, ${visualState.color}40, ${visualState.color}80)`,
            backdropFilter: 'blur(10px)'
          }}
          animate={animations[visualState.animation] || animations.glow}
        >
          {/* Companion emoji */}
          <motion.div 
            className="text-2xl"
            animate={isAnimating ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {visualState.emoji}
          </motion.div>

          {/* Energy indicator */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: visualState.energy > 0.7 ? '#00FF00' : visualState.energy > 0.4 ? '#FFFF00' : '#FF6600' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        {/* Relationship level indicator */}
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-semibold text-white shadow-lg"
          style={{ backgroundColor: relationshipLevel.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {relationshipLevel.name}
        </motion.div>
      </motion.div>

      {/* Personality Menu */}
      <AnimatePresence>
        {showPersonalityMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 bg-black/90 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-purple-500/30 min-w-48"
          >
            <h3 className="text-white font-semibold mb-3 text-sm">Companion Personality</h3>
            
            {Object.entries(companion?.personalities || {}).map(([key, personality]) => (
              <button
                key={key}
                onClick={() => {
                  onPersonalityChange?.(key);
                  setShowPersonalityMenu(false);
                }}
                className={`w-full text-left p-2 rounded-lg mb-2 text-sm transition-colors ${
                  companion?.personality === key 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="font-medium capitalize">{key}</div>
                <div className="text-xs opacity-75">
                  {personality.traits.join(', ')}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings button */}
      <motion.button
        className="absolute -top-2 -left-2 w-6 h-6 bg-gray-700/80 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xs border border-gray-500/50"
        onClick={() => setShowPersonalityMenu(!showPersonalityMenu)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ⚙️
      </motion.button>

      {/* Celebration particles */}
      <AnimatePresence>
        {companionResponse?.action === 'celebrate' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: ['#FFD700', '#FF69B4', '#00FF7F', '#87CEEB'][i % 4],
                  left: '50%',
                  top: '50%'
                }}
                initial={{ 
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 40,
                  y: Math.sin(i * 60 * Math.PI / 180) * 40,
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}