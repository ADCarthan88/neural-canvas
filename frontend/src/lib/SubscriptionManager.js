/**
 * Subscription Manager - Freemium Revenue Engine
 * Handles Stripe integration, feature gates, and conversion optimization
 */

export class SubscriptionManager {
  constructor() {
    this.stripe = null;
    this.currentPlan = 'free';
    this.subscriptionStatus = 'inactive';
    this.trialEndDate = null;
    this.features = this.initializeFeatures();
    this.conversionTracking = {
      featureAttempts: {},
      upgradePrompts: 0,
      lastUpgradePrompt: 0
    };
  }

  // Subscription tiers with strategic pricing
  subscriptionPlans = {
    free: {
      name: 'Free',
      price: 0,
      interval: null,
      features: {
        basicModes: true,
        aslBasic: true,
        voiceControl: true,
        exports: 5, // per month
        maxParticles: 1000,
        aiAssistant: 'limited', // 10 suggestions per day
        collaboration: false,
        vrAr: false,
        nftMinting: false,
        advancedAI: false,
        customThemes: false,
        prioritySupport: false,
        analytics: false
      },
      limitations: {
        watermark: true,
        exportFormats: ['PNG'],
        maxSessions: 30, // minutes per day
        adSupported: true
      }
    },
    
    pro: {
      name: 'Pro',
      price: 4.99,
      interval: 'month',
      popular: true,
      features: {
        basicModes: true,
        aslBasic: true,
        aslAdvanced: true, // Multi-language ASL
        voiceControl: true,
        exports: 100, // per month
        maxParticles: 5000,
        aiAssistant: 'full',
        collaboration: true,
        vrAr: 'basic',
        nftMinting: false,
        advancedAI: true,
        customThemes: true,
        prioritySupport: false,
        analytics: 'basic'
      },
      limitations: {
        watermark: false,
        exportFormats: ['PNG', 'JPG', 'WebP'],
        maxSessions: 180, // minutes per day
        adSupported: false
      }
    },
    
    ultimate: {
      name: 'Ultimate',
      price: 9.99,
      interval: 'month',
      features: {
        basicModes: true,
        aslBasic: true,
        aslAdvanced: true,
        voiceControl: true,
        exports: 'unlimited',
        maxParticles: 10000,
        aiAssistant: 'premium',
        collaboration: true,
        vrAr: 'full',
        nftMinting: true,
        advancedAI: true,
        customThemes: true,
        prioritySupport: true,
        analytics: 'advanced',
        apiAccess: true,
        whiteLabel: true
      },
      limitations: {
        watermark: false,
        exportFormats: ['PNG', 'JPG', 'WebP', 'MP4', 'GIF'],
        maxSessions: 'unlimited',
        adSupported: false
      }
    }
  };

  // Initialize Stripe
  async initialize(stripePublishableKey) {
    if (typeof window !== 'undefined' && window.Stripe) {
      this.stripe = window.Stripe(stripePublishableKey);
      await this.loadUserSubscription();
      return true;
    }
    return false;
  }

  // Load user's current subscription
  async loadUserSubscription() {
    try {
      const response = await fetch('/api/subscription/status', {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.currentPlan = data.plan || 'free';
        this.subscriptionStatus = data.status || 'inactive';
        this.trialEndDate = data.trialEndDate ? new Date(data.trialEndDate) : null;
        
        console.log(`💰 Loaded subscription: ${this.currentPlan} (${this.subscriptionStatus})`);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  }

  // Check if user has access to a feature
  hasFeature(featureName) {
    const plan = this.subscriptionPlans[this.currentPlan];
    if (!plan) return false;

    // Check if in trial period
    if (this.isInTrial() && this.currentPlan !== 'free') {
      return true;
    }

    return plan.features[featureName] === true || 
           (typeof plan.features[featureName] === 'string' && plan.features[featureName] !== 'false');
  }

  // Check feature with usage limits
  canUseFeature(featureName, currentUsage = 0) {
    const plan = this.subscriptionPlans[this.currentPlan];
    if (!plan) return { allowed: false, limit: 0, remaining: 0 };

    const featureValue = plan.features[featureName];
    
    if (featureValue === true || featureValue === 'unlimited') {
      return { allowed: true, limit: 'unlimited', remaining: 'unlimited' };
    }
    
    if (typeof featureValue === 'number') {
      const remaining = Math.max(0, featureValue - currentUsage);
      return { 
        allowed: remaining > 0, 
        limit: featureValue, 
        remaining 
      };
    }
    
    return { allowed: false, limit: 0, remaining: 0 };
  }

  // Feature gate with upgrade prompt
  async gateFeature(featureName, context = {}) {
    if (this.hasFeature(featureName)) {
      return { allowed: true };
    }

    // Track feature attempt for conversion optimization
    this.trackFeatureAttempt(featureName, context);

    // Show upgrade prompt with smart timing
    const shouldShowPrompt = this.shouldShowUpgradePrompt(featureName);
    
    return {
      allowed: false,
      requiresUpgrade: true,
      showPrompt: shouldShowPrompt,
      recommendedPlan: this.getRecommendedPlan(featureName),
      message: this.getFeatureGateMessage(featureName)
    };
  }

  // Smart upgrade prompt timing
  shouldShowUpgradePrompt(featureName) {
    const now = Date.now();
    const lastPrompt = this.conversionTracking.lastUpgradePrompt;
    const timeSinceLastPrompt = now - lastPrompt;
    
    // Don't spam prompts - wait at least 5 minutes
    if (timeSinceLastPrompt < 5 * 60 * 1000) return false;
    
    // Show prompt after 3 attempts of premium features
    const attempts = this.conversionTracking.featureAttempts[featureName] || 0;
    return attempts >= 3;
  }

  // Track feature attempts for conversion optimization
  trackFeatureAttempt(featureName, context) {
    this.conversionTracking.featureAttempts[featureName] = 
      (this.conversionTracking.featureAttempts[featureName] || 0) + 1;
    
    // Send analytics
    this.sendAnalytics('feature_gate_hit', {
      feature: featureName,
      plan: this.currentPlan,
      attempts: this.conversionTracking.featureAttempts[featureName],
      context
    });
  }

  // Get recommended plan for feature
  getRecommendedPlan(featureName) {
    // Check which is the cheapest plan that includes this feature
    for (const [planName, plan] of Object.entries(this.subscriptionPlans)) {
      if (plan.features[featureName]) {
        return planName;
      }
    }
    return 'pro'; // Default fallback
  }

  // Get user-friendly feature gate messages
  getFeatureGateMessage(featureName) {
    const messages = {
      vrAr: 'Experience immersive VR/AR creation with Pro!',
      nftMinting: 'Mint your art as NFTs with Ultimate!',
      collaboration: 'Create together in real-time with Pro!',
      aslAdvanced: 'Unlock all 10 sign languages with Pro!',
      advancedAI: 'Get premium AI suggestions with Pro!',
      exports: 'Unlimited high-quality exports with Pro!',
      customThemes: 'Personalize with custom themes in Pro!',
      analytics: 'Track your creative progress with Pro!'
    };
    
    return messages[featureName] || 'Unlock this premium feature!';
  }

  // Start subscription checkout
  async startCheckout(planName, options = {}) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      // Create checkout session
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          plan: planName,
          trialDays: options.trialDays || 7,
          successUrl: options.successUrl || window.location.origin + '/subscription/success',
          cancelUrl: options.cancelUrl || window.location.origin + '/subscription/cancel'
        })
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const { error } = await this.stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
      
      // Track conversion attempt
      this.sendAnalytics('checkout_started', {
        plan: planName,
        fromFeature: options.fromFeature
      });
      
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });
      
      if (response.ok) {
        this.subscriptionStatus = 'canceled';
        this.sendAnalytics('subscription_canceled', { plan: this.currentPlan });
        return true;
      }
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
    return false;
  }

  // Update subscription
  async updateSubscription(newPlan) {
    try {
      const response = await fetch('/api/subscription/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ plan: newPlan })
      });
      
      if (response.ok) {
        this.currentPlan = newPlan;
        this.sendAnalytics('subscription_updated', { 
          oldPlan: this.currentPlan,
          newPlan 
        });
        return true;
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
    return false;
  }

  // Check if user is in trial
  isInTrial() {
    return this.trialEndDate && new Date() < this.trialEndDate;
  }

  // Get trial days remaining
  getTrialDaysRemaining() {
    if (!this.isInTrial()) return 0;
    const msRemaining = this.trialEndDate.getTime() - Date.now();
    return Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  }

  // Usage tracking for limits
  async trackUsage(featureName, amount = 1) {
    try {
      await fetch('/api/subscription/track-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          feature: featureName,
          amount,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Usage tracking failed:', error);
    }
  }

  // Get current usage for a feature
  async getCurrentUsage(featureName) {
    try {
      const response = await fetch(`/api/subscription/usage/${featureName}`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.usage || 0;
      }
    } catch (error) {
      console.error('Failed to get usage:', error);
    }
    return 0;
  }

  // Conversion optimization - show upgrade at optimal moments
  getUpgradePromptTiming() {
    const timings = {
      afterCreation: 'You just created something amazing! Upgrade to save unlimited creations.',
      afterExportLimit: 'You\'ve reached your export limit. Upgrade for unlimited exports!',
      afterCollabAttempt: 'Want to create with friends? Upgrade to unlock collaboration!',
      afterVRAttempt: 'Ready for immersive VR creation? Upgrade to enter the metaverse!',
      weeklyReminder: 'You\'re creating incredible art! Upgrade to unlock your full potential.'
    };
    
    return timings;
  }

  // A/B test different pricing strategies
  getPricingVariant() {
    const variants = {
      standard: this.subscriptionPlans,
      discounted: {
        ...this.subscriptionPlans,
        pro: { ...this.subscriptionPlans.pro, price: 3.99 },
        ultimate: { ...this.subscriptionPlans.ultimate, price: 7.99 }
      },
      annual: {
        ...this.subscriptionPlans,
        pro: { ...this.subscriptionPlans.pro, price: 39.99, interval: 'year' },
        ultimate: { ...this.subscriptionPlans.ultimate, price: 79.99, interval: 'year' }
      }
    };
    
    // Simple A/B test based on user ID hash
    const userId = this.getUserId();
    const variant = ['standard', 'discounted', 'annual'][userId % 3];
    return variants[variant];
  }

  // Analytics and conversion tracking
  sendAnalytics(event, data) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...data,
        subscription_plan: this.currentPlan,
        subscription_status: this.subscriptionStatus
      });
    }
    
    // Also send to your analytics service
    console.log('📊 Analytics:', event, data);
  }

  // Utility methods
  getAuthToken() {
    return localStorage.getItem('auth_token') || '';
  }

  getUserId() {
    return localStorage.getItem('user_id') || Math.random().toString(36);
  }

  initializeFeatures() {
    return {
      exports: 0,
      aiSuggestions: 0,
      collaborationMinutes: 0,
      sessionMinutes: 0
    };
  }

  // Get subscription plans for display
  getPlans() {
    return this.subscriptionPlans;
  }

  // Get current plan info
  getCurrentPlan() {
    return {
      name: this.currentPlan,
      ...this.subscriptionPlans[this.currentPlan],
      status: this.subscriptionStatus,
      trialDaysRemaining: this.getTrialDaysRemaining()
    };
  }
}