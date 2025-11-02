/**
 * AI Creative Assistant - Therapeutic & Adaptive Art Companion
 * Learns user patterns, provides mood enhancement, and therapeutic support
 */

export class AICreativeAssistant {
  constructor() {
    this.userProfile = {
      preferences: {},
      moodHistory: [],
      interactionPatterns: {},
      therapeuticNeeds: null,
      learningStyle: 'adaptive',
      sensoryPreferences: {},
      calmingTriggers: [],
      energizingTriggers: []
    };
    
    this.moodStates = {
      calm: { colors: ['#4A90E2', '#7ED321', '#50E3C2'], intensity: 0.3, speed: 0.5 },
      happy: { colors: ['#F5A623', '#BD10E0', '#B8E986'], intensity: 0.8, speed: 1.2 },
      energetic: { colors: ['#D0021B', '#F5A623', '#7ED321'], intensity: 1.5, speed: 2.0 },
      focused: { colors: ['#9013FE', '#4A90E2', '#50E3C2'], intensity: 0.6, speed: 0.8 },
      relaxed: { colors: ['#B8E986', '#50E3C2', '#4A90E2'], intensity: 0.4, speed: 0.3 },
      creative: { colors: ['#BD10E0', '#F5A623', '#D0021B'], intensity: 1.0, speed: 1.5 },
      anxious: { colors: ['#4A90E2', '#50E3C2', '#B8E986'], intensity: 0.2, speed: 0.4 },
      overwhelmed: { colors: ['#7ED321', '#B8E986'], intensity: 0.1, speed: 0.2 }
    };

    this.therapeuticProfiles = {
      autism: {
        preferences: {
          predictablePatterns: true,
          softTransitions: true,
          reducedStimulation: true,
          symmetricalDesigns: true
        },
        calmingElements: {
          colors: ['#4A90E2', '#50E3C2', '#B8E986'],
          patterns: ['spiral', 'wave', 'geometric'],
          intensity: 0.3,
          speed: 0.5
        },
        avoidTriggers: {
          flashingLights: true,
          suddenChanges: true,
          chaotic: true
        }
      },
      adhd: {
        preferences: {
          engagingVisuals: true,
          interactiveElements: true,
          rewardSystems: true,
          focusAids: true
        },
        focusElements: {
          colors: ['#9013FE', '#4A90E2'],
          patterns: ['tunnel', 'center-focus'],
          intensity: 0.7,
          speed: 0.8
        }
      },
      anxiety: {
        preferences: {
          breathingPatterns: true,
          gentleMovement: true,
          earthyColors: true,
          slowTransitions: true
        },
        calmingElements: {
          colors: ['#7ED321', '#50E3C2', '#B8E986'],
          patterns: ['breathing', 'wave', 'flow'],
          intensity: 0.2,
          speed: 0.3
        }
      },
      depression: {
        preferences: {
          upliftingColors: true,
          energizingPatterns: true,
          progressiveBuilding: true,
          achievementRewards: true
        },
        upliftingElements: {
          colors: ['#F5A623', '#BD10E0', '#D0021B'],
          patterns: ['sunrise', 'growth', 'expansion'],
          intensity: 0.6,
          speed: 1.0
        }
      }
    };

    this.styleLibrary = {
      minimalist: { complexity: 0.2, colors: 2, patterns: 'simple' },
      vibrant: { complexity: 0.8, colors: 5, patterns: 'dynamic' },
      organic: { complexity: 0.6, colors: 3, patterns: 'natural' },
      geometric: { complexity: 0.4, colors: 3, patterns: 'structured' },
      psychedelic: { complexity: 1.0, colors: 7, patterns: 'chaotic' },
      meditative: { complexity: 0.3, colors: 2, patterns: 'flowing' },
      energetic: { complexity: 0.9, colors: 4, patterns: 'explosive' },
      soothing: { complexity: 0.2, colors: 2, patterns: 'gentle' }
    };

    this.sessionData = {
      startTime: null,
      interactions: [],
      moodProgression: [],
      effectiveElements: [],
      preferences: {}
    };
  }

  // Initialize user profile with optional therapeutic needs
  initializeUser(therapeuticProfile = null, preferences = {}) {
    this.userProfile.therapeuticNeeds = therapeuticProfile;
    this.userProfile.preferences = { ...this.userProfile.preferences, ...preferences };
    
    if (therapeuticProfile && this.therapeuticProfiles[therapeuticProfile]) {
      const profile = this.therapeuticProfiles[therapeuticProfile];
      this.userProfile.sensoryPreferences = profile.preferences;
      this.userProfile.calmingTriggers = profile.calmingElements;
    }

    this.sessionData.startTime = Date.now();
    console.log(`🧠 AI Assistant initialized for ${therapeuticProfile || 'general'} user`);
  }

  // Analyze current mood and suggest appropriate visual settings
  analyzeMoodAndSuggest(currentMood, userInput = null) {
    const suggestion = {
      mood: currentMood,
      confidence: 0.8,
      reasoning: '',
      visualSettings: {},
      therapeuticBenefits: [],
      alternatives: []
    };

    // Get base mood settings
    if (this.moodStates[currentMood]) {
      suggestion.visualSettings = { ...this.moodStates[currentMood] };
    }

    // Apply therapeutic modifications
    if (this.userProfile.therapeuticNeeds) {
      suggestion.visualSettings = this.applyTherapeuticModifications(
        suggestion.visualSettings, 
        currentMood
      );
      suggestion.therapeuticBenefits = this.getTherapeuticBenefits(currentMood);
    }

    // Learn from user patterns
    suggestion.visualSettings = this.applyLearningAdjustments(suggestion.visualSettings);

    // Add reasoning
    suggestion.reasoning = this.generateReasoning(currentMood, suggestion.visualSettings);

    // Generate alternatives
    suggestion.alternatives = this.generateAlternatives(currentMood);

    // Record interaction
    this.recordInteraction('mood_analysis', { mood: currentMood, suggestion });

    return suggestion;
  }

  // Apply therapeutic modifications based on user's needs
  applyTherapeuticModifications(settings, mood) {
    const profile = this.userProfile.therapeuticNeeds;
    if (!profile || !this.therapeuticProfiles[profile]) return settings;

    const therapeuticSettings = { ...settings };
    const profileData = this.therapeuticProfiles[profile];

    switch (profile) {
      case 'autism':
        // Reduce overstimulation
        therapeuticSettings.intensity = Math.min(settings.intensity, 0.5);
        therapeuticSettings.speed = Math.min(settings.speed, 0.7);
        
        // Use calming colors if mood is anxious/overwhelmed
        if (['anxious', 'overwhelmed'].includes(mood)) {
          therapeuticSettings.colors = profileData.calmingElements.colors;
          therapeuticSettings.intensity = 0.2;
          therapeuticSettings.speed = 0.3;
        }
        break;

      case 'adhd':
        // Enhance focus elements
        if (mood === 'focused') {
          therapeuticSettings.colors = profileData.focusElements.colors;
          therapeuticSettings.intensity = 0.7;
        }
        break;

      case 'anxiety':
        // Always apply calming modifications
        therapeuticSettings.intensity = Math.min(settings.intensity, 0.4);
        therapeuticSettings.speed = Math.min(settings.speed, 0.5);
        therapeuticSettings.colors = profileData.calmingElements.colors;
        break;

      case 'depression':
        // Boost uplifting elements
        if (['calm', 'relaxed'].includes(mood)) {
          therapeuticSettings.colors = profileData.upliftingElements.colors;
          therapeuticSettings.intensity = Math.max(settings.intensity, 0.6);
        }
        break;
    }

    return therapeuticSettings;
  }

  // Get therapeutic benefits for current mood/settings
  getTherapeuticBenefits(mood) {
    const profile = this.userProfile.therapeuticNeeds;
    const benefits = [];

    switch (profile) {
      case 'autism':
        benefits.push('Reduces sensory overload');
        benefits.push('Provides predictable patterns');
        if (['calm', 'relaxed'].includes(mood)) {
          benefits.push('Promotes self-regulation');
        }
        break;

      case 'adhd':
        benefits.push('Enhances focus and attention');
        benefits.push('Provides engaging stimulation');
        if (mood === 'focused') {
          benefits.push('Supports concentration');
        }
        break;

      case 'anxiety':
        benefits.push('Promotes relaxation');
        benefits.push('Reduces stress response');
        benefits.push('Encourages deep breathing');
        break;

      case 'depression':
        benefits.push('Boosts mood and energy');
        benefits.push('Provides positive stimulation');
        benefits.push('Encourages engagement');
        break;
    }

    return benefits;
  }

  // Apply learning-based adjustments
  applyLearningAdjustments(settings) {
    const adjustedSettings = { ...settings };
    
    // Analyze user's historical preferences
    const colorPreferences = this.analyzeColorPreferences();
    const intensityPreferences = this.analyzeIntensityPreferences();
    const speedPreferences = this.analyzeSpeedPreferences();

    // Apply learned preferences
    if (colorPreferences.length > 0) {
      adjustedSettings.colors = this.blendColors(settings.colors, colorPreferences);
    }

    if (intensityPreferences.average) {
      adjustedSettings.intensity = this.blendValues(
        settings.intensity, 
        intensityPreferences.average, 
        0.3
      );
    }

    if (speedPreferences.average) {
      adjustedSettings.speed = this.blendValues(
        settings.speed, 
        speedPreferences.average, 
        0.3
      );
    }

    return adjustedSettings;
  }

  // Analyze user's color preferences from history
  analyzeColorPreferences() {
    const colorCounts = {};
    
    this.userProfile.moodHistory.forEach(entry => {
      if (entry.settings && entry.settings.colors) {
        entry.settings.colors.forEach(color => {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        });
      }
    });

    return Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([color]) => color);
  }

  // Analyze intensity preferences
  analyzeIntensityPreferences() {
    const intensities = this.userProfile.moodHistory
      .filter(entry => entry.settings && entry.settings.intensity)
      .map(entry => entry.settings.intensity);

    return {
      average: intensities.length > 0 ? intensities.reduce((a, b) => a + b) / intensities.length : null,
      preferred: this.findMostCommon(intensities)
    };
  }

  // Analyze speed preferences
  analyzeSpeedPreferences() {
    const speeds = this.userProfile.moodHistory
      .filter(entry => entry.settings && entry.settings.speed)
      .map(entry => entry.settings.speed);

    return {
      average: speeds.length > 0 ? speeds.reduce((a, b) => a + b) / speeds.length : null,
      preferred: this.findMostCommon(speeds)
    };
  }

  // Generate style suggestions based on current context
  generateStyleSuggestions(currentMood, timeOfDay = 'day') {
    const suggestions = [];
    
    // Base suggestions on mood
    const moodStyles = this.getMoodCompatibleStyles(currentMood);
    
    // Add therapeutic considerations
    const therapeuticStyles = this.getTherapeuticStyles();
    
    // Time-based suggestions
    const timeStyles = this.getTimeBasedStyles(timeOfDay);
    
    // Combine and rank suggestions
    const allStyles = [...moodStyles, ...therapeuticStyles, ...timeStyles];
    const rankedStyles = this.rankStyleSuggestions(allStyles);
    
    return rankedStyles.slice(0, 3).map(style => ({
      name: style,
      description: this.getStyleDescription(style),
      settings: this.styleLibrary[style],
      confidence: this.calculateStyleConfidence(style, currentMood)
    }));
  }

  // Get mood-compatible styles
  getMoodCompatibleStyles(mood) {
    const moodStyleMap = {
      calm: ['meditative', 'soothing', 'minimalist'],
      happy: ['vibrant', 'energetic', 'organic'],
      energetic: ['psychedelic', 'vibrant', 'energetic'],
      focused: ['geometric', 'minimalist', 'meditative'],
      relaxed: ['soothing', 'organic', 'meditative'],
      creative: ['psychedelic', 'vibrant', 'organic'],
      anxious: ['soothing', 'meditative', 'minimalist'],
      overwhelmed: ['minimalist', 'soothing']
    };

    return moodStyleMap[mood] || ['organic', 'minimalist'];
  }

  // Get therapeutic-appropriate styles
  getTherapeuticStyles() {
    const profile = this.userProfile.therapeuticNeeds;
    
    const therapeuticStyleMap = {
      autism: ['minimalist', 'geometric', 'soothing'],
      adhd: ['energetic', 'vibrant', 'geometric'],
      anxiety: ['soothing', 'meditative', 'organic'],
      depression: ['vibrant', 'energetic', 'organic']
    };

    return therapeuticStyleMap[profile] || [];
  }

  // Generate reasoning for suggestions
  generateReasoning(mood, settings) {
    let reasoning = `Based on your ${mood} mood, `;
    
    if (this.userProfile.therapeuticNeeds) {
      reasoning += `and your ${this.userProfile.therapeuticNeeds} profile, `;
    }
    
    reasoning += `I've selected ${settings.colors?.length || 'calming'} colors with ${
      settings.intensity > 0.7 ? 'high' : settings.intensity > 0.4 ? 'medium' : 'low'
    } intensity. `;
    
    if (this.userProfile.moodHistory.length > 5) {
      reasoning += `I've also learned from your previous sessions that you prefer ${
        this.analyzeColorPreferences()[0] || 'these colors'
      }.`;
    }

    return reasoning;
  }

  // Generate alternative suggestions
  generateAlternatives(mood) {
    const alternatives = [];
    const styles = this.getMoodCompatibleStyles(mood);
    
    styles.slice(1, 3).forEach(style => {
      alternatives.push({
        name: style,
        description: `Try ${style} style for a different experience`,
        settings: this.styleLibrary[style]
      });
    });

    return alternatives;
  }

  // Record user interaction for learning
  recordInteraction(type, data) {
    const interaction = {
      timestamp: Date.now(),
      type,
      data,
      sessionId: this.sessionData.startTime
    };

    this.sessionData.interactions.push(interaction);
    
    // Update mood history if it's a mood-related interaction
    if (type === 'mood_analysis' || type === 'mood_change') {
      this.userProfile.moodHistory.push({
        timestamp: Date.now(),
        mood: data.mood,
        settings: data.settings || data.suggestion?.visualSettings
      });
      
      // Keep only last 50 mood entries
      if (this.userProfile.moodHistory.length > 50) {
        this.userProfile.moodHistory = this.userProfile.moodHistory.slice(-50);
      }
    }
  }

  // Provide real-time mood enhancement suggestions
  provideMoodEnhancement(currentState) {
    const enhancement = {
      suggestion: '',
      action: null,
      reasoning: '',
      therapeuticValue: ''
    };

    // Detect if user seems stuck or frustrated
    if (this.detectFrustration()) {
      enhancement.suggestion = 'Take a calming breath and try a gentler approach';
      enhancement.action = 'switch_to_calm';
      enhancement.reasoning = 'I noticed some repetitive patterns that might indicate frustration';
      enhancement.therapeuticValue = 'Reduces stress and promotes self-awareness';
    }
    
    // Suggest energy boost if user seems low
    else if (this.detectLowEnergy()) {
      enhancement.suggestion = 'Let\'s add some vibrant colors to boost your energy!';
      enhancement.action = 'increase_vibrancy';
      enhancement.reasoning = 'Your interaction patterns suggest you might benefit from more stimulation';
      enhancement.therapeuticValue = 'Increases engagement and positive mood';
    }
    
    // Celebrate achievements
    else if (this.detectPositiveEngagement()) {
      enhancement.suggestion = 'You\'re creating something beautiful! Want to explore more?';
      enhancement.action = 'expand_creativity';
      enhancement.reasoning = 'Your sustained engagement shows you\'re in a creative flow';
      enhancement.therapeuticValue = 'Reinforces positive behavior and builds confidence';
    }

    return enhancement;
  }

  // Utility methods
  blendColors(original, preferred) {
    // Simple color blending - in production, use proper color theory
    return [...preferred.slice(0, 2), ...original.slice(0, 1)];
  }

  blendValues(original, learned, weight) {
    return original * (1 - weight) + learned * weight;
  }

  findMostCommon(array) {
    const counts = {};
    array.forEach(item => counts[item] = (counts[item] || 0) + 1);
    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0];
  }

  detectFrustration() {
    const recentInteractions = this.sessionData.interactions.slice(-10);
    const rapidChanges = recentInteractions.filter(i => 
      i.type === 'mood_change' && Date.now() - i.timestamp < 30000
    );
    return rapidChanges.length > 3;
  }

  detectLowEnergy() {
    const recentMoods = this.userProfile.moodHistory.slice(-5);
    return recentMoods.every(m => ['calm', 'relaxed', 'overwhelmed'].includes(m.mood));
  }

  detectPositiveEngagement() {
    const sessionDuration = Date.now() - this.sessionData.startTime;
    return sessionDuration > 300000 && this.sessionData.interactions.length > 20; // 5+ minutes, 20+ interactions
  }

  getStyleDescription(style) {
    const descriptions = {
      minimalist: 'Clean, simple designs that reduce visual clutter',
      vibrant: 'Bold, energetic colors that stimulate creativity',
      organic: 'Natural, flowing patterns inspired by nature',
      geometric: 'Structured, mathematical patterns that promote focus',
      psychedelic: 'Complex, dynamic visuals for maximum creativity',
      meditative: 'Gentle, rhythmic patterns for relaxation',
      energetic: 'High-energy visuals to boost motivation',
      soothing: 'Calming, therapeutic visuals for stress relief'
    };
    return descriptions[style] || 'A unique visual experience';
  }

  calculateStyleConfidence(style, mood) {
    // Simple confidence calculation based on mood-style compatibility
    const compatibleStyles = this.getMoodCompatibleStyles(mood);
    const index = compatibleStyles.indexOf(style);
    return index === -1 ? 0.3 : 1.0 - (index * 0.2);
  }

  rankStyleSuggestions(styles) {
    // Remove duplicates and return unique styles
    return [...new Set(styles)];
  }

  getTimeBasedStyles(timeOfDay) {
    const timeStyleMap = {
      morning: ['energetic', 'vibrant'],
      day: ['organic', 'geometric'],
      evening: ['soothing', 'meditative'],
      night: ['minimalist', 'soothing']
    };
    return timeStyleMap[timeOfDay] || timeStyleMap.day;
  }

  // Get user profile for persistence
  getUserProfile() {
    return this.userProfile;
  }

  // Load user profile from storage
  loadUserProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
  }
}