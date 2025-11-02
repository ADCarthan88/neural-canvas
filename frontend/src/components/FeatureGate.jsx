/**
 * Feature Gate Component
 * Smart feature blocking with conversion-optimized upgrade prompts
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeatureGate({ 
  feature, 
  subscriptionManager, 
  onUpgradeClick,
  children,
  fallback = null,
  showUsage = false 
}) {
  const [hasAccess, setHasAccess] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [gateResult, setGateResult] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [feature, subscriptionManager]);

  const checkAccess = async () => {
    if (!subscriptionManager) return;

    try {
      const result = await subscriptionManager.gateFeature(feature);
      setGateResult(result);
      setHasAccess(result.allowed);

      if (showUsage && result.allowed) {
        const usage = await subscriptionManager.getCurrentUsage(feature);
        const canUse = subscriptionManager.canUseFeature(feature, usage);
        setUsageInfo(canUse);
      }

      if (result.showPrompt) {
        setShowPrompt(true);
      }
    } catch (error) {
      console.error('Feature gate check failed:', error);
      setHasAccess(false);
    }
  };

  const handleUpgrade = () => {
    setShowPrompt(false);
    onUpgradeClick(feature);
  };

  // If user has access, render children
  if (hasAccess) {
    return (
      <>
        {children}
        {showUsage && usageInfo && (
          <UsageIndicator usageInfo={usageInfo} feature={feature} />
        )}
        <UpgradePrompt 
          isVisible={showPrompt}
          onUpgrade={handleUpgrade}
          onDismiss={() => setShowPrompt(false)}
          gateResult={gateResult}
        />
      </>
    );
  }

  // If no access, show fallback or gate UI
  return (
    <>
      {fallback || (
        <FeatureGateUI 
          feature={feature}
          gateResult={gateResult}
          onUpgrade={handleUpgrade}
        />
      )}
    </>
  );
}

// Usage indicator for limited features
function UsageIndicator({ usageInfo, feature }) {
  if (!usageInfo || usageInfo.limit === 'unlimited') return null;

  const percentage = (usageInfo.remaining / usageInfo.limit) * 100;
  const isLow = percentage < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-4 right-4 z-40 p-3 rounded-lg border ${
        isLow ? 'bg-red-500/20 border-red-500/30' : 'bg-blue-500/20 border-blue-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-white">
          {feature}: {usageInfo.remaining}/{usageInfo.limit}
        </div>
        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isLow ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {isLow && (
        <div className="text-xs text-red-300 mt-1">
          Running low! Upgrade for unlimited access.
        </div>
      )}
    </motion.div>
  );
}

// Feature gate UI when access is blocked
function FeatureGateUI({ feature, gateResult, onUpgrade }) {
  const getFeatureInfo = (feature) => {
    const info = {
      vrAr: {
        icon: '🥽',
        title: 'VR/AR Experiences',
        description: 'Step into immersive virtual and augmented reality',
        benefits: ['Full 360° experiences', 'Hand tracking support', 'Spatial audio']
      },
      nftMinting: {
        icon: '💎',
        title: 'NFT Minting',
        description: 'Turn your creations into valuable blockchain assets',
        benefits: ['Multi-chain support', 'Royalty settings', 'Marketplace integration']
      },
      collaboration: {
        icon: '👥',
        title: 'Real-time Collaboration',
        description: 'Create together with friends and colleagues',
        benefits: ['Live cursor sharing', 'Voice chat', 'Session recording']
      },
      aslAdvanced: {
        icon: '🌍',
        title: 'Multi-language ASL',
        description: 'Communicate in 10 international sign languages',
        benefits: ['Global accessibility', 'Cultural sensitivity', 'Educational value']
      },
      advancedAI: {
        icon: '🧠',
        title: 'Advanced AI Assistant',
        description: 'Unlock the full power of therapeutic AI',
        benefits: ['Unlimited suggestions', 'Mood analysis', 'Learning patterns']
      },
      exports: {
        icon: '📸',
        title: 'Unlimited Exports',
        description: 'Save your creations in any format, anytime',
        benefits: ['All formats (PNG, JPG, MP4)', 'High resolution', 'No watermarks']
      }
    };

    return info[feature] || {
      icon: '✨',
      title: 'Premium Feature',
      description: 'Unlock advanced functionality',
      benefits: ['Enhanced capabilities', 'Professional tools', 'Priority support']
    };
  };

  const featureInfo = getFeatureInfo(feature);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[400px] p-8"
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">{featureInfo.icon}</div>
        <h3 className="text-2xl font-bold text-white mb-3">
          {featureInfo.title}
        </h3>
        <p className="text-gray-300 mb-6">
          {featureInfo.description}
        </p>
        
        <div className="space-y-2 mb-8">
          {featureInfo.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center justify-center gap-2 text-gray-300">
              <span className="text-green-400">✓</span>
              {benefit}
            </div>
          ))}
        </div>

        <button
          onClick={onUpgrade}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
        >
          Upgrade to Unlock
        </button>

        <div className="mt-4 text-sm text-gray-400">
          Starting at $4.99/month • 7-day free trial
        </div>
      </div>
    </motion.div>
  );
}

// Smart upgrade prompt that appears at optimal moments
function UpgradePrompt({ isVisible, onUpgrade, onDismiss, gateResult }) {
  if (!isVisible || !gateResult) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 shadow-2xl border border-purple-400">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚀</div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">
                Ready to unlock more?
              </h4>
              <p className="text-purple-100 text-sm mb-3">
                {gateResult.message}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onUpgrade}
                  className="bg-white text-purple-600 font-semibold py-2 px-4 rounded text-sm hover:bg-gray-100 transition-colors"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={onDismiss}
                  className="text-purple-100 hover:text-white py-2 px-4 text-sm transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-purple-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// HOC for wrapping components with feature gates
export function withFeatureGate(WrappedComponent, feature) {
  return function FeatureGatedComponent(props) {
    return (
      <FeatureGate feature={feature} {...props}>
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
}

// Hook for checking feature access in components
export function useFeatureAccess(feature, subscriptionManager) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!subscriptionManager) return;
      
      try {
        const result = await subscriptionManager.gateFeature(feature);
        setHasAccess(result.allowed);
      } catch (error) {
        console.error('Feature access check failed:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [feature, subscriptionManager]);

  return { hasAccess, loading };
}