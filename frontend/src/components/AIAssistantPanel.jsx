/**
 * AI Creative Assistant Panel
 * Therapeutic interface for mood enhancement and personalized suggestions
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistantPanel({ 
  aiAssistant, 
  onApplySuggestion, 
  currentMood, 
  onMoodChange,
  isVisible,
  onClose 
}) {
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [moodEnhancement, setMoodEnhancement] = useState(null);
  const [styleOptions, setStyleOptions] = useState([]);
  const [therapeuticProfile, setTherapeuticProfile] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [learningInsights, setLearningInsights] = useState([]);
  const [assistantPersonality, setAssistantPersonality] = useState('supportive');

  const personalities = {
    supportive: { name: '🤗 Supportive', tone: 'caring', emoji: '💙' },
    energetic: { name: '⚡ Energetic', tone: 'enthusiastic', emoji: '🔥' },
    calm: { name: '🧘 Calm', tone: 'peaceful', emoji: '🌸' },
    playful: { name: '🎨 Playful', tone: 'fun', emoji: '🎭' },
    wise: { name: '🦉 Wise', tone: 'thoughtful', emoji: '✨' }
  };

  const therapeuticProfiles = {
    none: 'General User',
    autism: 'Autism Spectrum Support',
    adhd: 'ADHD Support',
    anxiety: 'Anxiety Support',
    depression: 'Depression Support',
    ptsd: 'PTSD Support',
    sensory: 'Sensory Processing Support'
  };

  const moodOptions = [
    { value: 'calm', label: '😌 Calm', color: '#4A90E2' },
    { value: 'happy', label: '😊 Happy', color: '#F5A623' },
    { value: 'energetic', label: '⚡ Energetic', color: '#D0021B' },
    { value: 'focused', label: '🎯 Focused', color: '#9013FE' },
    { value: 'relaxed', label: '😴 Relaxed', color: '#7ED321' },
    { value: 'creative', label: '🎨 Creative', color: '#BD10E0' },
    { value: 'anxious', label: '😰 Anxious', color: '#50E3C2' },
    { value: 'overwhelmed', label: '😵 Overwhelmed', color: '#B8E986' }
  ];

  // Initialize AI assistant when component mounts
  useEffect(() => {
    if (aiAssistant && !therapeuticProfile) {
      // Check if user has existing profile
      const savedProfile = localStorage.getItem('neuralCanvas_therapeuticProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setTherapeuticProfile(profile.type);
        aiAssistant.initializeUser(profile.type, profile.preferences);
      } else {
        setShowProfileSetup(true);
      }
    }
  }, [aiAssistant]);

  // Update suggestions when mood changes
  useEffect(() => {
    if (aiAssistant && currentMood) {
      const suggestion = aiAssistant.analyzeMoodAndSuggest(currentMood);
      setCurrentSuggestion(suggestion);
      
      const styles = aiAssistant.generateStyleSuggestions(currentMood);
      setStyleOptions(styles);
      
      const enhancement = aiAssistant.provideMoodEnhancement({ mood: currentMood });
      setMoodEnhancement(enhancement);
      
      // Generate learning insights
      updateLearningInsights();
    }
  }, [currentMood, aiAssistant]);

  const updateLearningInsights = () => {
    if (!aiAssistant) return;
    
    const insights = [];
    const profile = aiAssistant.getUserProfile();
    
    if (profile.moodHistory.length > 5) {
      const mostCommonMood = findMostCommonMood(profile.moodHistory);
      insights.push(`You tend to feel most ${mostCommonMood} during your sessions`);
    }
    
    if (profile.moodHistory.length > 10) {
      const colorPrefs = aiAssistant.analyzeColorPreferences();
      if (colorPrefs.length > 0) {
        insights.push(`You gravitate toward ${colorPrefs[0]} tones`);
      }
    }
    
    if (therapeuticProfile && therapeuticProfile !== 'none') {
      insights.push(`Optimized for ${therapeuticProfiles[therapeuticProfile].toLowerCase()}`);
    }
    
    setLearningInsights(insights);
  };

  const findMostCommonMood = (moodHistory) => {
    const moodCounts = {};
    moodHistory.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    return Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'balanced';
  };

  const handleProfileSetup = (profile, preferences = {}) => {
    setTherapeuticProfile(profile);
    aiAssistant.initializeUser(profile === 'none' ? null : profile, preferences);
    
    // Save to localStorage
    localStorage.setItem('neuralCanvas_therapeuticProfile', JSON.stringify({
      type: profile === 'none' ? null : profile,
      preferences
    }));
    
    setShowProfileSetup(false);
  };

  const applySuggestion = (suggestion) => {
    onApplySuggestion(suggestion.visualSettings);
    aiAssistant.recordInteraction('suggestion_applied', { suggestion });
  };

  const applyStyleSuggestion = (style) => {
    onApplySuggestion(style.settings);
    aiAssistant.recordInteraction('style_applied', { style });
  };

  const getPersonalityMessage = (message, tone) => {
    const toneModifiers = {
      caring: '💙 ',
      enthusiastic: '🔥 ',
      peaceful: '🌸 ',
      fun: '🎭 ',
      thoughtful: '✨ '
    };
    
    return `${toneModifiers[tone] || ''}${message}`;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed top-0 right-0 h-full w-96 bg-black/90 backdrop-blur-md border-l border-purple-500/30 z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="p-6 border-b border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            🧠 AI Creative Assistant
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Personality Selector */}
        <div className="mb-4">
          <label className="text-sm text-gray-300 block mb-2">Assistant Personality</label>
          <select
            value={assistantPersonality}
            onChange={(e) => setAssistantPersonality(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            {Object.entries(personalities).map(([key, personality]) => (
              <option key={key} value={key}>{personality.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile Setup Modal */}
      <AnimatePresence>
        {showProfileSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 z-10 p-6 flex flex-col"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              🌟 Personalize Your Experience
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Help me provide the best therapeutic support for you. This information is private and helps create a more personalized experience.
            </p>
            
            <div className="space-y-4 flex-1">
              {Object.entries(therapeuticProfiles).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleProfileSetup(key)}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-left text-white transition-colors"
                >
                  <div className="font-medium">{label}</div>
                  {key !== 'none' && (
                    <div className="text-xs text-gray-400 mt-1">
                      Optimized visual patterns and interactions
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              You can change this anytime in settings. All data stays on your device.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Mood */}
      <div className="p-6 border-b border-purple-500/30">
        <h3 className="text-lg font-semibold text-white mb-3">Current Mood</h3>
        <div className="grid grid-cols-2 gap-2">
          {moodOptions.map(mood => (
            <button
              key={mood.value}
              onClick={() => onMoodChange(mood.value)}
              className={`p-3 rounded text-sm font-medium transition-all ${
                currentMood === mood.value
                  ? 'bg-purple-600 text-white border-2 border-purple-400'
                  : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: currentMood === mood.value ? mood.color : undefined
              }}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Suggestion */}
      {currentSuggestion && (
        <div className="p-6 border-b border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-3">
            {personalities[assistantPersonality].emoji} AI Suggestion
          </h3>
          
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 mb-4">
            <div className="text-white font-medium mb-2">
              {getPersonalityMessage(
                `Perfect for your ${currentSuggestion.mood} mood!`,
                personalities[assistantPersonality].tone
              )}
            </div>
            <div className="text-gray-300 text-sm mb-3">
              {currentSuggestion.reasoning}
            </div>
            
            {/* Therapeutic Benefits */}
            {currentSuggestion.therapeuticBenefits.length > 0 && (
              <div className="mb-3">
                <div className="text-green-400 text-xs font-medium mb-1">
                  🌟 Therapeutic Benefits:
                </div>
                {currentSuggestion.therapeuticBenefits.map((benefit, index) => (
                  <div key={index} className="text-green-300 text-xs">
                    • {benefit}
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => applySuggestion(currentSuggestion)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium transition-colors"
            >
              Apply Suggestion
            </button>
          </div>

          {/* Confidence Indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Confidence:</span>
            <div className="flex items-center">
              <div className="w-20 h-2 bg-gray-700 rounded-full mr-2">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${currentSuggestion.confidence * 100}%` }}
                />
              </div>
              <span className="text-green-400">
                {Math.round(currentSuggestion.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Style Suggestions */}
      {styleOptions.length > 0 && (
        <div className="p-6 border-b border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-3">Style Options</h3>
          <div className="space-y-3">
            {styleOptions.map((style, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-white capitalize">{style.name}</div>
                  <div className="text-xs text-green-400">
                    {Math.round(style.confidence * 100)}%
                  </div>
                </div>
                <div className="text-gray-300 text-sm mb-3">{style.description}</div>
                <button
                  onClick={() => applyStyleSuggestion(style)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Try This Style
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Enhancement */}
      {moodEnhancement && moodEnhancement.suggestion && (
        <div className="p-6 border-b border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-3">
            💡 Enhancement Tip
          </h3>
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-200 font-medium mb-2">
              {getPersonalityMessage(
                moodEnhancement.suggestion,
                personalities[assistantPersonality].tone
              )}
            </div>
            <div className="text-blue-300 text-sm mb-2">
              {moodEnhancement.reasoning}
            </div>
            {moodEnhancement.therapeuticValue && (
              <div className="text-green-300 text-xs">
                🌟 {moodEnhancement.therapeuticValue}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Learning Insights */}
      {learningInsights.length > 0 && (
        <div className="p-6 border-b border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-3">
            📊 Learning Insights
          </h3>
          <div className="space-y-2">
            {learningInsights.map((insight, index) => (
              <div key={index} className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                <div className="text-yellow-200 text-sm">💡 {insight}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Therapeutic Profile */}
      {therapeuticProfile && therapeuticProfile !== 'none' && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            🎯 Your Profile
          </h3>
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="text-green-200 font-medium mb-2">
              {therapeuticProfiles[therapeuticProfile]}
            </div>
            <div className="text-green-300 text-sm">
              Personalized for your unique needs and preferences
            </div>
            <button
              onClick={() => setShowProfileSetup(true)}
              className="mt-3 text-green-400 text-sm hover:text-green-300 transition-colors"
            >
              Update Profile →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}