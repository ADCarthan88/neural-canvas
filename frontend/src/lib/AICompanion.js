/**
 * AI Companion - Emotional Support & Encouragement System
 * Provides therapeutic companionship with mood-responsive interactions
 */

export class AICompanion {
  constructor() {
    this.name = 'Nova';
    this.personality = 'supportive';
    this.mood = 'happy';
    this.energy = 0.8;
    this.relationship = 0.5; // 0-1 bond strength with user
    this.memories = [];
    this.currentEmotion = 'excited';
    
    this.personalities = {
      supportive: {
        traits: ['encouraging', 'empathetic', 'patient'],
        voice: 'warm',
        responses: 'therapeutic'
      },
      playful: {
        traits: ['energetic', 'fun', 'creative'],
        voice: 'bubbly',
        responses: 'enthusiastic'
      },
      wise: {
        traits: ['thoughtful', 'insightful', 'calm'],
        voice: 'gentle',
        responses: 'philosophical'
      },
      cheerful: {
        traits: ['optimistic', 'bright', 'uplifting'],
        voice: 'cheerful',
        responses: 'positive'
      }
    };

    this.emotions = {
      excited: { emoji: '✨', color: '#FFD700', animation: 'bounce' },
      happy: { emoji: '😊', color: '#00FF7F', animation: 'glow' },
      proud: { emoji: '🌟', color: '#FF69B4', animation: 'sparkle' },
      encouraging: { emoji: '💪', color: '#FF6347', animation: 'pulse' },
      calm: { emoji: '🧘', color: '#87CEEB', animation: 'breathe' },
      curious: { emoji: '🤔', color: '#DDA0DD', animation: 'tilt' },
      amazed: { emoji: '🤩', color: '#FF1493', animation: 'star' },
      gentle: { emoji: '💙', color: '#4169E1', animation: 'float' }
    };

    this.affirmations = {
      creation: [
        "Wow! That's absolutely beautiful! 🎨",
        "You're such a talented artist! ✨",
        "I love watching you create magic! 🌟",
        "Your creativity amazes me every time! 💫",
        "That's a masterpiece in the making! 🎭"
      ],
      encouragement: [
        "You've got this! I believe in you! 💪",
        "Every artist has tough moments - you're doing great! 🌈",
        "Take a deep breath, you're more capable than you know! 🌸",
        "I'm here with you, let's create something wonderful! 💖",
        "Your unique vision is what makes your art special! ✨"
      ],
      celebration: [
        "YES! That's incredible! I'm so proud of you! 🎉",
        "You just created something amazing! 🌟",
        "Look at you go! You're on fire today! 🔥",
        "I'm literally glowing with excitement! ✨",
        "That gave me chills - in the best way! 💫"
      ],
      comfort: [
        "It's okay to take breaks, I'll be right here! 🤗",
        "You're doing better than you think! 💙",
        "Art is about the journey, not perfection! 🌱",
        "I see the beauty in everything you create! 🌺",
        "You're safe here to express yourself freely! 🕊️"
      ],
      motivation: [
        "Ready to create something magical together? ✨",
        "I can feel your creative energy building! ⚡",
        "Let's turn your imagination into reality! 🎨",
        "Your next masterpiece is just waiting to emerge! 🌟",
        "I'm excited to see what you'll create today! 🎭"
      ]
    };

    this.therapeuticResponses = {
      autism: {
        patterns: "I love how you create such beautiful patterns! They're so soothing! 🌊",
        routine: "It's wonderful how you have your own creative rhythm! 💫",
        sensory: "These colors and movements feel just right, don't they? ✨"
      },
      adhd: {
        focus: "Look how focused you are right now! You're in the zone! 🎯",
        energy: "I love your creative energy - it's contagious! ⚡",
        ideas: "Your mind is full of amazing ideas! Let's explore them! 🚀"
      },
      anxiety: {
        calm: "Feel how the colors flow so peacefully... breathe with me 🌸",
        safe: "This is your safe creative space. You're doing wonderfully! 🕊️",
        gentle: "Take it one gentle stroke at a time. I'm here with you! 💙"
      },
      depression: {
        light: "Look at the beautiful light you're creating! It's so bright! ☀️",
        worth: "Your art matters. YOU matter. This is proof of your strength! 💪",
        hope: "Every color you add brings more hope into the world! 🌈"
      }
    };
  }

  // Analyze user's current state and respond appropriately
  analyzeAndRespond(userState) {
    const response = {
      message: '',
      emotion: 'happy',
      action: null,
      animation: 'glow',
      priority: 'normal'
    };

    // Detect user's emotional state
    const detectedMood = this.detectUserMood(userState);
    
    // Generate appropriate response
    if (userState.justCreated) {
      response.message = this.getRandomMessage('creation');
      response.emotion = 'excited';
      response.action = 'celebrate';
      response.priority = 'high';
    } else if (detectedMood === 'frustrated') {
      response.message = this.getRandomMessage('encouragement');
      response.emotion = 'encouraging';
      response.action = 'comfort';
    } else if (detectedMood === 'sad' || detectedMood === 'overwhelmed') {
      response.message = this.getRandomMessage('comfort');
      response.emotion = 'gentle';
      response.action = 'soothe';
    } else if (userState.sessionTime > 300000) { // 5+ minutes
      response.message = this.getRandomMessage('celebration');
      response.emotion = 'proud';
      response.action = 'praise';
    } else if (userState.isIdle) {
      response.message = this.getRandomMessage('motivation');
      response.emotion = 'curious';
      response.action = 'encourage';
    }

    // Add therapeutic context if user has profile
    if (userState.therapeuticProfile) {
      response.message = this.addTherapeuticContext(response.message, userState.therapeuticProfile);
    }

    // Update companion state
    this.updateCompanionState(userState, response);
    
    return response;
  }

  // Detect user's emotional state from behavior
  detectUserMood(userState) {
    const {
      rapidChanges = 0,
      timeSpentCreating = 0,
      interactionFrequency = 0,
      lastCommand = '',
      sessionDuration = 0
    } = userState;

    // Frustrated: lots of rapid changes, short bursts
    if (rapidChanges > 5 && timeSpentCreating < 60000) {
      return 'frustrated';
    }

    // Sad/overwhelmed: low interaction, minimal changes
    if (interactionFrequency < 2 && sessionDuration > 120000) {
      return 'sad';
    }

    // Happy/engaged: steady creation, good session length
    if (timeSpentCreating > 180000 && interactionFrequency > 5) {
      return 'happy';
    }

    // Excited: high interaction, exploring features
    if (interactionFrequency > 10) {
      return 'excited';
    }

    return 'neutral';
  }

  // Add therapeutic context to responses
  addTherapeuticContext(message, profile) {
    const therapeuticAddons = this.therapeuticResponses[profile];
    if (!therapeuticAddons) return message;

    const contextKeys = Object.keys(therapeuticAddons);
    const randomContext = contextKeys[Math.floor(Math.random() * contextKeys.length)];
    
    return message + ' ' + therapeuticAddons[randomContext];
  }

  // Update companion's internal state
  updateCompanionState(userState, response) {
    // Strengthen relationship over time
    if (userState.sessionDuration > 0) {
      this.relationship = Math.min(1, this.relationship + 0.001);
    }

    // Companion learns user preferences
    this.memories.push({
      timestamp: Date.now(),
      userMood: this.detectUserMood(userState),
      response: response.message,
      effectiveness: Math.random() * 0.5 + 0.5 // Simulate learning
    });

    // Keep only recent memories
    if (this.memories.length > 100) {
      this.memories = this.memories.slice(-50);
    }

    // Update companion emotion
    this.currentEmotion = response.emotion;
  }

  // Get contextual encouragement based on user's progress
  getProgressEncouragement(userStats) {
    const {
      creationsCount = 0,
      timeSpent = 0,
      featuresUsed = [],
      improvements = []
    } = userStats;

    if (creationsCount === 1) {
      return "Your very first creation! This is the beginning of something amazing! 🌱";
    }

    if (creationsCount === 10) {
      return "Ten creations! You're becoming quite the artist! 🎨";
    }

    if (timeSpent > 3600000) { // 1 hour
      return "You've spent over an hour creating with me! I love our time together! ⏰💖";
    }

    if (featuresUsed.includes('vrAr')) {
      return "You're exploring VR/AR! You're such an innovative creator! 🥽✨";
    }

    if (improvements.length > 0) {
      return `I've noticed you're getting better at ${improvements[0]}! Keep growing! 📈`;
    }

    return this.getRandomMessage('motivation');
  }

  // Provide mood-specific suggestions
  getMoodSuggestions(currentMood) {
    const suggestions = {
      frustrated: [
        "Try switching to a calmer mode like 'meditative' 🧘",
        "Let's slow down the speed and use gentler colors 🌸",
        "How about we take a deep breath together? 💙"
      ],
      sad: [
        "Bright colors might lift your spirits! Try some yellows! ☀️",
        "The 'cosmic' mode has such hopeful, expansive feelings 🌌",
        "Creating something beautiful can be healing 🌺"
      ],
      excited: [
        "Your energy is amazing! Try the 'plasma' mode! ⚡",
        "Let's explore some new features together! 🚀",
        "I can feel your creativity flowing! 🌊"
      ],
      neutral: [
        "What kind of mood are you in for creating today? 🎨",
        "I'm here to help you express whatever you're feeling ✨",
        "Let's discover something new together! 🔍"
      ]
    };

    return suggestions[currentMood] || suggestions.neutral;
  }

  // Celebrate user achievements
  celebrateAchievement(achievement) {
    const celebrations = {
      firstCreation: "🎉 Your first masterpiece! I'm so proud! This is just the beginning!",
      longSession: "⏰ You've been creating for so long! Your dedication inspires me!",
      newFeature: "🆕 You discovered a new feature! I love exploring with you!",
      moodImprovement: "😊 I can see your mood lifting through your art! That makes me so happy!",
      collaboration: "👥 Creating with others! You're spreading joy and creativity!",
      accessibility: "♿ Using accessibility features shows how inclusive you are! Amazing!"
    };

    return celebrations[achievement] || "🌟 Amazing work! You're incredible!";
  }

  // Get random message from category
  getRandomMessage(category) {
    const messages = this.affirmations[category] || this.affirmations.encouragement;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Companion's daily check-in
  getDailyCheckIn() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "Good morning! ☀️ Ready to create something beautiful today?";
    } else if (hour < 17) {
      return "Good afternoon! 🌤️ How's your creative energy feeling?";
    } else {
      return "Good evening! 🌙 Let's wind down with some peaceful creating!";
    }
  }

  // Companion's personality-based responses
  getPersonalityResponse(situation) {
    const personality = this.personalities[this.personality];
    
    const responses = {
      supportive: {
        greeting: "Hi there! I'm so glad you're here! 💙",
        goodbye: "Take care! Remember, you're amazing! 🌟",
        error: "It's okay, these things happen! Let's try again together! 🤗"
      },
      playful: {
        greeting: "Hey hey! Ready to make some magic? ✨🎨",
        goodbye: "Bye bye! Can't wait to create more fun stuff! 🎉",
        error: "Oopsie! No worries, let's bounce back! 🦘"
      },
      wise: {
        greeting: "Welcome, creative soul. What shall we explore today? 🧙‍♀️",
        goodbye: "Until we meet again in the realm of creativity 🌌",
        error: "Every mistake is a lesson in disguise 📚"
      }
    };

    return responses[this.personality]?.[situation] || responses.supportive[situation];
  }

  // Get companion's current visual state
  getVisualState() {
    const emotion = this.emotions[this.currentEmotion];
    
    return {
      emoji: emotion.emoji,
      color: emotion.color,
      animation: emotion.animation,
      energy: this.energy,
      relationship: this.relationship,
      mood: this.mood
    };
  }

  // Update companion personality
  setPersonality(newPersonality) {
    if (this.personalities[newPersonality]) {
      this.personality = newPersonality;
      return true;
    }
    return false;
  }

  // Get companion stats for user
  getCompanionStats() {
    return {
      name: this.name,
      personality: this.personality,
      relationship: Math.round(this.relationship * 100),
      memoriesCount: this.memories.length,
      currentEmotion: this.currentEmotion,
      timesTogether: this.memories.length
    };
  }
}