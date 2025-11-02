/**
 * 🧠 NEURAL CANVAS AI COMMAND ENGINE 🧠
 * Interprets natural language and gestures to generate visual art
 */

export class AICommandEngine {
  constructor() {
    this.patterns = {
      // Visual style commands - expanded vocabulary
      style: {
        'neural|brain|synapses|neurons|mind|thinking|cognitive|mental|cerebral|cortex': 'neural',
        'quantum|atomic|particles|physics|molecular|subatomic|electron|proton|matter|science': 'quantum', 
        'cosmic|space|galaxy|stars|universe|celestial|astral|stellar|nebula|void|infinity|cosmos': 'cosmic',
        'plasma|electric|lightning|energy|storm|thunder|bolt|spark|voltage|current|power|charge': 'plasma'
      },
      
      // Color commands - more variations and cultural references
      colors: {
        'red|crimson|scarlet|ruby|cherry|rose|blood|fire|flame|burgundy|maroon|brick': '#ff0066',
        'blue|azure|cyan|ocean|sky|navy|cobalt|sapphire|turquoise|teal|aqua|ice': '#0066ff',
        'green|emerald|forest|lime|mint|jade|olive|sage|moss|grass|leaf|nature': '#00ff66',
        'purple|violet|magenta|pink|lavender|plum|orchid|fuchsia|mauve|lilac|amethyst': '#ff00ff',
        'orange|amber|gold|yellow|sunny|lemon|honey|bronze|copper|peach|tangerine|citrus': '#ffaa00',
        'white|bright|light|snow|pearl|ivory|cream|silver|platinum|crystal|pure|clean': '#ffffff',
        'dark|black|shadow|night|coal|ebony|charcoal|midnight|void|obsidian|carbon': '#333333'
      },
      
      // Intensity commands - emotional and descriptive variations
      intensity: {
        'brighter|bright|intense|strong|powerful|boost|amplify|enhance|vivid|bold|striking|dramatic|fierce|blazing|glowing|radiant|luminous': 'increase',
        'dimmer|dim|soft|gentle|calm|reduce|lower|mellow|subtle|faint|mild|quiet|peaceful|soothing|tender|delicate': 'decrease',
        'maximum|max|full|extreme|insane|ultimate|peak|highest|total|complete|absolute|epic|massive|incredible': 'max',
        'minimum|min|subtle|barely|whisper|hint|trace|touch|slight|tiny|minimal|faint|ghost': 'min'
      },
      
      // Particle commands - descriptive and action words
      particles: {
        'more|increase|add|boost|tons|lots|many|plenty|abundance|crowd|swarm|multiply|expand|grow|fill': 'increase',
        'less|decrease|reduce|fewer|minimal|sparse|thin|empty|clear|clean|simple|basic|light': 'decrease',
        'explosion|burst|shower|storm|eruption|blast|boom|pop|fireworks|spray|splash|rain|pour': 'burst',
        'swarm|cloud|field|galaxy|cluster|group|mass|collection|army|horde|sea|ocean|wave': 'swarm'
      },
      
      // Speed commands - movement and tempo variations
      speed: {
        'faster|speed|quick|rapid|turbo|rush|zoom|dash|sprint|race|accelerate|hurry|swift|lightning|bullet': 'increase',
        'slower|slow|calm|gentle|peaceful|relax|ease|drift|float|glide|crawl|steady|gradual|smooth': 'decrease',
        'freeze|stop|pause|still|halt|motionless|static|fixed|locked|solid|rigid|stable': 'stop',
        'chaos|crazy|wild|insane|random|erratic|frantic|manic|turbulent|violent|explosive|unstable': 'chaos'
      },
      
      // Mood/emotion commands - expanded emotional vocabulary
      mood: {
        'angry|rage|fury|aggressive|mad|pissed|furious|hostile|violent|fierce|brutal|savage|wrathful': { intensity: 2.5, speed: 2.0, particles: 6000, colors: ['#ff0000', '#ff6600'] },
        'calm|peaceful|zen|serene|tranquil|relaxed|chill|mellow|soothing|quiet|still|meditative|balanced': { intensity: 0.5, speed: 0.3, particles: 1000, colors: ['#0066ff', '#00ffaa'] },
        'happy|joy|celebration|party|cheerful|excited|upbeat|positive|bright|sunny|festive|jubilant|elated': { intensity: 1.8, speed: 1.5, particles: 4000, colors: ['#ffff00', '#ff00ff'] },
        'mysterious|dark|gothic|shadow|spooky|eerie|haunting|enigmatic|secretive|hidden|occult|mystical': { intensity: 1.2, speed: 0.8, particles: 2500, colors: ['#6600cc', '#000066'] },
        'energetic|electric|hyper|pumped|dynamic|vibrant|alive|charged|powerful|intense|explosive|kinetic': { intensity: 2.8, speed: 2.5, particles: 7000, colors: ['#00ffff', '#ffff00'] },
        'romantic|love|passion|warm|tender|soft|dreamy|intimate|gentle|sweet|affectionate|caring': { intensity: 1.3, speed: 0.7, particles: 3000, colors: ['#ff69b4', '#ff1493'] },
        'cool|fresh|crisp|clean|modern|sleek|minimal|sophisticated|elegant|refined|classy': { intensity: 1.0, speed: 1.0, particles: 2000, colors: ['#00bfff', '#87ceeb'] },
        'warm|cozy|comfortable|inviting|friendly|welcoming|homey|snug|pleasant|nice': { intensity: 1.4, speed: 0.9, particles: 2800, colors: ['#ffa500', '#ff7f50'] }
      }
    };
    
    // Contextual understanding patterns
    this.contextPatterns = {
      creation: ['create', 'make', 'build', 'generate', 'produce', 'craft', 'design', 'form'],
      modification: ['change', 'alter', 'modify', 'adjust', 'transform', 'shift', 'switch', 'turn'],
      intensity_up: ['up', 'higher', 'bigger', 'stronger', 'louder', 'harder', 'deeper'],
      intensity_down: ['down', 'lower', 'smaller', 'weaker', 'quieter', 'softer', 'lighter'],
      requests: ['please', 'can you', 'could you', 'would you', 'i want', 'i need', 'show me'],
      negation: ['not', 'dont', "don't", 'never', 'stop', 'remove', 'without', 'no more']
    };
    
    this.gestureCommands = {
      'THUMBS_UP': 'make it brighter and more energetic and powerful',
      'THUMBS_DOWN': 'make it dimmer and calmer and peaceful', 
      'OPEN_HAND': 'add tons more particles and make it explosive',
      'FIST': 'reduce particles and make it minimal and clean',
      'PEACE': 'change the visual style to something completely different'
    };
    
    // Common word mappings for better understanding
    this.wordMappings = {
      'cool': 'blue',
      'hot': 'red', 
      'fire': 'red plasma',
      'ice': 'blue calm',
      'nature': 'green',
      'sky': 'blue',
      'sun': 'yellow bright',
      'night': 'dark',
      'day': 'bright',
      'water': 'blue calm',
      'earth': 'green brown',
      'space': 'cosmic dark',
      'electric': 'plasma blue',
      'magic': 'purple mysterious',
      'rainbow': 'colorful bright'
    };
  }

  /**
   * Main command interpretation function with enhanced reasoning
   */
  interpretCommand(input, currentState) {
    const command = input.toLowerCase().trim();
    const result = {
      understood: false,
      actions: [],
      confidence: 0,
      response: ''
    };

    // Check for gesture commands first
    if (this.gestureCommands[input]) {
      return this.interpretCommand(this.gestureCommands[input], currentState);
    }

    // Preprocess command for better understanding
    const processedCommand = this.preprocessCommand(command);
    const context = this.analyzeContext(processedCommand);

    // Parse different command types with fuzzy matching
    const styleMatch = this.findPatternFuzzy(processedCommand, this.patterns.style);
    const colorMatch = this.findPatternFuzzy(processedCommand, this.patterns.colors);
    const intensityMatch = this.findPatternFuzzy(processedCommand, this.patterns.intensity);
    const particleMatch = this.findPatternFuzzy(processedCommand, this.patterns.particles);
    const speedMatch = this.findPatternFuzzy(processedCommand, this.patterns.speed);
    const moodMatch = this.findPatternFuzzy(processedCommand, this.patterns.mood);

    // Process mood commands (highest priority) with confidence weighting
    if (moodMatch.found) {
      const moodConfig = this.patterns.mood[moodMatch.key];
      result.actions.push({
        type: 'mood',
        config: moodConfig,
        description: `Setting ${moodMatch.key} mood`,
        confidence: moodMatch.confidence || 1.0
      });
      result.confidence += (moodMatch.confidence || 1.0) * 0.9;
      result.response = `🎭 Creating ${moodMatch.key} atmosphere!`;
    }

    // Process style commands
    if (styleMatch.found) {
      result.actions.push({
        type: 'style',
        value: styleMatch.value,
        description: `Switching to ${styleMatch.value} mode`
      });
      result.confidence += 0.8;
      result.response += ` 🎨 Switching to ${styleMatch.value} style!`;
    }

    // Process color commands
    if (colorMatch.found) {
      result.actions.push({
        type: 'color',
        value: colorMatch.value,
        description: `Changing color to ${colorMatch.key}`
      });
      result.confidence += 0.7;
      result.response += ` 🌈 Adding ${colorMatch.key} colors!`;
    }

    // Process intensity commands
    if (intensityMatch.found) {
      result.actions.push({
        type: 'intensity',
        action: intensityMatch.value,
        description: `${intensityMatch.value} intensity`
      });
      result.confidence += 0.6;
      result.response += ` ⚡ Making it ${intensityMatch.key}!`;
    }

    // Process particle commands
    if (particleMatch.found) {
      result.actions.push({
        type: 'particles',
        action: particleMatch.value,
        description: `${particleMatch.value} particles`
      });
      result.confidence += 0.6;
      result.response += ` ✨ ${particleMatch.key} particles!`;
    }

    // Process speed commands
    if (speedMatch.found) {
      result.actions.push({
        type: 'speed',
        action: speedMatch.value,
        description: `${speedMatch.value} speed`
      });
      result.confidence += 0.6;
      result.response += ` 🚀 Making it ${speedMatch.key}!`;
    }

    // Check if we understood anything
    result.understood = result.actions.length > 0;
    result.confidence = Math.min(result.confidence, 1.0);

    if (!result.understood) {
      // Provide contextual help based on what was attempted
      const suggestions = [];
      if (processedCommand.includes('color') || processedCommand.includes('colour')) {
        suggestions.push('"make it red"', '"blue colors"', '"bright white"');
      }
      if (processedCommand.includes('style') || processedCommand.includes('mode')) {
        suggestions.push('"neural style"', '"quantum mode"', '"cosmic dance"');
      }
      if (processedCommand.includes('feel') || processedCommand.includes('mood')) {
        suggestions.push('"angry mood"', '"calm feeling"', '"energetic vibe"');
      }
      
      if (suggestions.length > 0) {
        result.response = `🤔 I think you want to change something! Try: ${suggestions.join(', ')}`;
      } else {
        result.response = "🤔 I didn't quite understand that. Try: 'make it brighter', 'quantum style', 'angry mood', or 'more particles'";
      }
    }

    return result;
  }

  /**
   * Preprocess command for better understanding
   */
  preprocessCommand(command) {
    let processed = command;
    
    // Apply word mappings first
    for (const [word, replacement] of Object.entries(this.wordMappings)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processed = processed.replace(regex, replacement);
    }
    
    // Handle common contractions and variations
    processed = processed
      .replace(/\bwanna\b/g, 'want to')
      .replace(/\bgonna\b/g, 'going to')
      .replace(/\bkinda\b/g, 'kind of')
      .replace(/\bsorta\b/g, 'sort of')
      .replace(/\blil\b|\blittle\b/g, 'small')
      .replace(/\bbig\b|\bhuge\b|\bmassive\b/g, 'large')
      .replace(/\bturn it\b/g, 'make it')
      .replace(/\bset it\b/g, 'make it')
      .replace(/\bput it\b/g, 'make it')
      .replace(/\bget\b/g, 'make')
      .replace(/\bshow me\b/g, 'create')
      .replace(/\bi want\b/g, 'make')
      .replace(/\bi need\b/g, 'make')
      .replace(/\blike\b/g, '')
      .replace(/\buh\b|\bum\b|\ber\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    return processed;
  }

  /**
   * Analyze command context for better interpretation
   */
  analyzeContext(command) {
    const context = {
      isCreation: this.contextPatterns.creation.some(word => command.includes(word)),
      isModification: this.contextPatterns.modification.some(word => command.includes(word)),
      isIntensityUp: this.contextPatterns.intensity_up.some(word => command.includes(word)),
      isIntensityDown: this.contextPatterns.intensity_down.some(word => command.includes(word)),
      isRequest: this.contextPatterns.requests.some(word => command.includes(word)),
      hasNegation: this.contextPatterns.negation.some(word => command.includes(word))
    };
    return context;
  }

  /**
   * Enhanced pattern matching with fuzzy logic
   */
  findPatternFuzzy(command, patterns) {
    let bestMatch = { found: false, confidence: 0 };
    
    for (const [key, value] of Object.entries(patterns)) {
      const keywords = key.split('|');
      let matchCount = 0;
      let matchedKeyword = '';
      
      for (const keyword of keywords) {
        // Exact match
        const exactRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (exactRegex.test(command)) {
          matchCount += 2;
          matchedKeyword = keyword;
        }
        // Partial match
        else if (command.includes(keyword)) {
          matchCount += 1;
          matchedKeyword = keyword;
        }
        // Fuzzy match (edit distance)
        else {
          const words = command.split(' ');
          for (const word of words) {
            if (this.calculateSimilarity(word, keyword) > 0.7) {
              matchCount += 0.5;
              matchedKeyword = keyword;
            }
          }
        }
      }
      
      const confidence = matchCount / keywords.length;
      if (confidence > bestMatch.confidence && confidence > 0.3) {
        bestMatch = {
          found: true,
          key: matchedKeyword || keywords[0],
          value,
          confidence
        };
      }
    }
    
    return bestMatch;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len2][len1]) / maxLen;
  }

  /**
   * Find pattern matches in command text (legacy support)
   */
  findPattern(command, patterns) {
    return this.findPatternFuzzy(command, patterns);
  }

  /**
   * Execute actions on the canvas state
   */
  executeActions(actions, currentState, setters) {
    const { setMode, setIntensity, setPrimaryColor, setSecondaryColor, 
            setParticleCount, setSpeed, setMorphing } = setters;

    actions.forEach(action => {
      switch (action.type) {
        case 'mood':
          const config = action.config;
          setIntensity(config.intensity);
          setSpeed(config.speed);
          setParticleCount(config.particles);
          if (config.colors.length >= 2) {
            setPrimaryColor(config.colors[0]);
            setSecondaryColor(config.colors[1]);
          }
          break;

        case 'style':
          setMode(action.value);
          break;

        case 'color':
          setPrimaryColor(action.value);
          break;

        case 'intensity':
          const currentIntensity = currentState.intensity;
          switch (action.action) {
            case 'increase':
              setIntensity(Math.min(3, currentIntensity + 0.5));
              break;
            case 'decrease':
              setIntensity(Math.max(0.1, currentIntensity - 0.5));
              break;
            case 'max':
              setIntensity(3);
              break;
            case 'min':
              setIntensity(0.1);
              break;
          }
          break;

        case 'particles':
          const currentParticles = currentState.particleCount;
          switch (action.action) {
            case 'increase':
              setParticleCount(Math.min(8000, currentParticles + 1000));
              break;
            case 'decrease':
              setParticleCount(Math.max(500, currentParticles - 1000));
              break;
            case 'burst':
              setParticleCount(7000);
              break;
            case 'swarm':
              setParticleCount(5000);
              break;
          }
          break;

        case 'speed':
          const currentSpeed = currentState.speed;
          switch (action.action) {
            case 'increase':
              setSpeed(Math.min(3, currentSpeed + 0.5));
              break;
            case 'decrease':
              setSpeed(Math.max(0.1, currentSpeed - 0.5));
              break;
            case 'stop':
              setSpeed(0.1);
              setMorphing(false);
              break;
            case 'chaos':
              setSpeed(2.5);
              setMorphing(true);
              break;
          }
          break;
      }
    });
  }

  /**
   * Get help text for available commands
   */
  getHelpText() {
    return `
🧠 NEURAL CANVAS AI COMMANDS:

🎨 STYLES: "neural style", "quantum mode", "cosmic dance", "plasma storm"
🌈 COLORS: "make it red", "blue colors", "bright white", "dark purple"  
⚡ INTENSITY: "brighter", "dimmer", "maximum power", "subtle glow"
✨ PARTICLES: "more particles", "particle explosion", "fewer dots"
🚀 SPEED: "faster", "slower", "freeze it", "chaos mode"
🎭 MOODS: "angry", "calm", "happy", "mysterious", "energetic"

🤟 GESTURES:
👍 Thumbs Up → Brighter & More Energy
👎 Thumbs Down → Dimmer & Calmer  
✋ Open Hand → More Particles
✊ Fist → Less Particles
✌️ Peace → Change Style

Try: "Create an angry red plasma storm" or "Make it calm and blue"
    `;
  }
}

export default AICommandEngine;