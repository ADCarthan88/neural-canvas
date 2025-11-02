/**
 * Subscription Modal - Conversion-Optimized Pricing Interface
 * Beautiful, persuasive upgrade prompts with psychological triggers
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubscriptionModal({ 
  isVisible, 
  onClose, 
  subscriptionManager, 
  triggeredByFeature = null,
  showTrial = true 
}) {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState({});
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showAnnual, setShowAnnual] = useState(false);

  useEffect(() => {
    if (subscriptionManager) {
      setPlans(subscriptionManager.getPlans());
      setCurrentPlan(subscriptionManager.getCurrentPlan());
    }
  }, [subscriptionManager]);

  const handleUpgrade = async (planName) => {
    setIsLoading(true);
    try {
      await subscriptionManager.startCheckout(planName, {
        trialDays: showTrial ? 7 : 0,
        fromFeature: triggeredByFeature
      });
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      vrAr: '🥽',
      nftMinting: '💎',
      collaboration: '👥',
      aslAdvanced: '🌍',
      advancedAI: '🧠',
      exports: '📸',
      customThemes: '🎨',
      analytics: '📊'
    };
    return icons[feature] || '✨';
  };

  const getUpgradeMessage = () => {
    if (triggeredByFeature) {
      const messages = {
        vrAr: 'Step into the future with immersive VR/AR creation!',
        nftMinting: 'Turn your art into valuable NFTs on the blockchain!',
        collaboration: 'Create together with friends in real-time!',
        aslAdvanced: 'Communicate in all 10 international sign languages!',
        advancedAI: 'Unlock the full power of our therapeutic AI assistant!',
        exports: 'Save unlimited high-quality creations!',
        customThemes: 'Express yourself with personalized themes!',
        analytics: 'Track your creative journey and progress!'
      };
      return messages[triggeredByFeature] || 'Unlock premium features!';
    }
    return 'Unleash your full creative potential!';
  };

  const calculateSavings = (monthlyPrice) => {
    const annualPrice = monthlyPrice * 10; // 2 months free
    const monthlyCost = monthlyPrice * 12;
    return monthlyCost - annualPrice;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {triggeredByFeature ? (
                  <>
                    {getFeatureIcon(triggeredByFeature)} Unlock Premium Features
                  </>
                ) : (
                  '🚀 Upgrade to Neural Canvas Pro'
                )}
              </h2>
              <p className="text-gray-300 text-lg">
                {getUpgradeMessage()}
              </p>
              {showTrial && (
                <div className="mt-3 inline-flex items-center bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
                  <span className="text-green-400 font-semibold">🎉 7-Day Free Trial</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${!showAnnual ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setShowAnnual(!showAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                showAnnual ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                showAnnual ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
            <span className={`font-medium ${showAnnual ? 'text-white' : 'text-gray-400'}`}>
              Annual
            </span>
            {showAnnual && (
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                Save 17%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border border-gray-600 rounded-xl p-6 relative">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <div className="text-3xl font-bold text-gray-400 mb-1">$0</div>
                <div className="text-gray-500 text-sm">Forever</div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Basic neural modes
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Voice & ASL control
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  5 exports per month
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="text-red-400 mr-3">✗</span>
                  Collaboration
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="text-red-400 mr-3">✗</span>
                  VR/AR experiences
                </li>
              </ul>
              
              <button
                disabled
                className="w-full py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
              >
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-purple-500 rounded-xl p-6 relative bg-gradient-to-b from-purple-500/10 to-transparent">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-white mb-1">
                  ${showAnnual ? '39.99' : '4.99'}
                </div>
                <div className="text-gray-400 text-sm">
                  {showAnnual ? 'per year' : 'per month'}
                </div>
                {showAnnual && (
                  <div className="text-green-400 text-sm font-semibold mt-1">
                    Save $19.89/year
                  </div>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Everything in Free
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Multi-language ASL (10 languages)
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Real-time collaboration
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Basic VR/AR experiences
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  100 exports per month
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Advanced AI assistant
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  No watermarks
                </li>
              </ul>
              
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : showTrial ? 'Start Free Trial' : 'Upgrade to Pro'}
              </button>
            </div>

            {/* Ultimate Plan */}
            <div className="border border-yellow-500/50 rounded-xl p-6 relative bg-gradient-to-b from-yellow-500/10 to-transparent">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Ultimate</h3>
                <div className="text-4xl font-bold text-white mb-1">
                  ${showAnnual ? '79.99' : '9.99'}
                </div>
                <div className="text-gray-400 text-sm">
                  {showAnnual ? 'per year' : 'per month'}
                </div>
                {showAnnual && (
                  <div className="text-green-400 text-sm font-semibold mt-1">
                    Save $39.89/year
                  </div>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Full VR/AR experiences
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  NFT minting & blockchain
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Unlimited exports
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Premium AI assistant
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  Priority support
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  API access
                </li>
              </ul>
              
              <button
                onClick={() => handleUpgrade('ultimate')}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : showTrial ? 'Start Free Trial' : 'Upgrade to Ultimate'}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlight */}
        {triggeredByFeature && (
          <div className="p-6 border-t border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="text-center">
              <div className="text-4xl mb-3">{getFeatureIcon(triggeredByFeature)}</div>
              <h3 className="text-xl font-bold text-white mb-2">
                You're about to unlock: {triggeredByFeature.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </h3>
              <p className="text-gray-300">
                Join thousands of creators who've upgraded to access premium features
              </p>
            </div>
          </div>
        )}

        {/* Trust Signals */}
        <div className="p-6 border-t border-purple-500/30">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">🔒</div>
              <div className="text-white font-semibold">Secure Payments</div>
              <div className="text-gray-400 text-sm">Powered by Stripe</div>
            </div>
            <div>
              <div className="text-2xl mb-2">↩️</div>
              <div className="text-white font-semibold">Cancel Anytime</div>
              <div className="text-gray-400 text-sm">No long-term commitment</div>
            </div>
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-white font-semibold">Instant Access</div>
              <div className="text-gray-400 text-sm">Upgrade immediately</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-500/30 text-center">
          <p className="text-gray-400 text-sm">
            Questions? Contact us at{' '}
            <a href="mailto:support@neuralcanvas.app" className="text-purple-400 hover:text-purple-300">
              support@neuralcanvas.app
            </a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}