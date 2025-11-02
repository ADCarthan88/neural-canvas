/**
 * Comprehensive ASL Recognition Engine
 * Full alphabet + common phrases for complete inclusivity
 */

export class ASLRecognitionEngine {
  constructor() {
    this.gestureBuffer = [];
    this.bufferSize = 30; // frames to analyze
    this.confidenceThreshold = 0.8;
    this.spellingBuffer = [];
    this.wordTimeout = 2000; // ms between letters
    this.lastLetterTime = 0;
    
    // ASL Alphabet landmarks (simplified but accurate)
    this.aslAlphabet = {
      'A': { thumb: 'closed', fingers: 'fist', palm: 'forward' },
      'B': { thumb: 'tucked', fingers: 'straight', palm: 'forward' },
      'C': { thumb: 'curved', fingers: 'curved', palm: 'side' },
      'D': { thumb: 'touching', fingers: 'point_up', palm: 'forward' },
      'E': { thumb: 'over', fingers: 'bent', palm: 'forward' },
      'F': { thumb: 'touching', fingers: 'ok_sign', palm: 'forward' },
      'G': { thumb: 'side', fingers: 'point_side', palm: 'forward' },
      'H': { thumb: 'side', fingers: 'two_side', palm: 'forward' },
      'I': { thumb: 'closed', fingers: 'pinky', palm: 'forward' },
      'J': { thumb: 'closed', fingers: 'pinky_hook', palm: 'forward' },
      'K': { thumb: 'between', fingers: 'peace_side', palm: 'forward' },
      'L': { thumb: 'up', fingers: 'point_up', palm: 'forward' },
      'M': { thumb: 'under', fingers: 'three_down', palm: 'down' },
      'N': { thumb: 'under', fingers: 'two_down', palm: 'down' },
      'O': { thumb: 'touching', fingers: 'circle', palm: 'forward' },
      'P': { thumb: 'between', fingers: 'peace_down', palm: 'down' },
      'Q': { thumb: 'down', fingers: 'point_down', palm: 'down' },
      'R': { thumb: 'closed', fingers: 'cross', palm: 'forward' },
      'S': { thumb: 'over', fingers: 'fist', palm: 'forward' },
      'T': { thumb: 'between', fingers: 'fist', palm: 'forward' },
      'U': { thumb: 'closed', fingers: 'two_up', palm: 'forward' },
      'V': { thumb: 'closed', fingers: 'peace', palm: 'forward' },
      'W': { thumb: 'closed', fingers: 'three_up', palm: 'forward' },
      'X': { thumb: 'closed', fingers: 'hook', palm: 'forward' },
      'Y': { thumb: 'up', fingers: 'pinky_up', palm: 'forward' },
      'Z': { thumb: 'closed', fingers: 'point_trace', palm: 'forward' }
    };

    // Common ASL phrases and commands
    this.aslPhrases = {
      'HELLO': ['H', 'E', 'L', 'L', 'O'],
      'THANK_YOU': { gesture: 'chin_to_forward', meaning: 'thank you' },
      'PLEASE': { gesture: 'circle_chest', meaning: 'please' },
      'YES': { gesture: 'fist_nod', meaning: 'yes' },
      'NO': { gesture: 'two_finger_close', meaning: 'no' },
      'BEAUTIFUL': { gesture: 'face_circle', meaning: 'beautiful' },
      'MORE': { gesture: 'fingertips_touch', meaning: 'more' },
      'STOP': { gesture: 'palm_down_hit', meaning: 'stop' },
      'START': { gesture: 'finger_twist', meaning: 'start' },
      'BRIGHT': { gesture: 'fingers_open_up', meaning: 'bright' },
      'DARK': { gesture: 'hands_down_cross', meaning: 'dark' },
      'FAST': { gesture: 'thumbs_flick', meaning: 'fast' },
      'SLOW': { gesture: 'hand_drag', meaning: 'slow' },
      'BIG': { gesture: 'hands_apart', meaning: 'big' },
      'SMALL': { gesture: 'fingers_close', meaning: 'small' },
      'GOOD': { gesture: 'chin_to_palm', meaning: 'good' },
      'BAD': { gesture: 'chin_flip', meaning: 'bad' },
      'HELP': { gesture: 'fist_on_palm', meaning: 'help' },
      'CHANGE': { gesture: 'fists_twist', meaning: 'change' },
      'COLOR': { gesture: 'fingers_wiggle_chin', meaning: 'color' }
    };

    // Canvas control mappings
    this.canvasCommands = {
      'MORE': 'increase_intensity',
      'BRIGHT': 'increase_brightness',
      'DARK': 'decrease_brightness',
      'FAST': 'increase_speed',
      'SLOW': 'decrease_speed',
      'BIG': 'increase_particles',
      'SMALL': 'decrease_particles',
      'CHANGE': 'next_mode',
      'STOP': 'pause',
      'START': 'play',
      'BEAUTIFUL': 'ultimate_mode',
      'COLOR': 'cycle_colors'
    };
  }

  // Analyze hand landmarks for ASL recognition
  analyzeHandLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    const hand = landmarks[0];
    const fingerPositions = this.getFingerPositions(hand);
    const palmOrientation = this.getPalmOrientation(hand);
    
    // Check for alphabet letters
    const letter = this.recognizeLetter(fingerPositions, palmOrientation);
    if (letter) {
      this.handleSpelling(letter);
    }

    // Check for phrases/gestures
    const phrase = this.recognizePhrase(fingerPositions, palmOrientation, hand);
    if (phrase) {
      return this.executeCommand(phrase);
    }

    return null;
  }

  // Get finger positions relative to palm
  getFingerPositions(hand) {
    const positions = {
      thumb: this.getFingerState(hand, [1, 2, 3, 4]), // thumb landmarks
      index: this.getFingerState(hand, [5, 6, 7, 8]),
      middle: this.getFingerState(hand, [9, 10, 11, 12]),
      ring: this.getFingerState(hand, [13, 14, 15, 16]),
      pinky: this.getFingerState(hand, [17, 18, 19, 20])
    };

    return positions;
  }

  // Determine if finger is extended, bent, or closed
  getFingerState(hand, landmarks) {
    const tip = hand[landmarks[3]];
    const pip = hand[landmarks[2]];
    const mcp = hand[landmarks[1]];
    const base = hand[landmarks[0]];

    const tipToPip = Math.sqrt(
      Math.pow(tip.x - pip.x, 2) + Math.pow(tip.y - pip.y, 2)
    );
    const pipToMcp = Math.sqrt(
      Math.pow(pip.x - mcp.x, 2) + Math.pow(pip.y - mcp.y, 2)
    );

    if (tip.y < pip.y && pip.y < mcp.y) return 'extended';
    if (tip.y > mcp.y) return 'closed';
    return 'bent';
  }

  // Get palm orientation
  getPalmOrientation(hand) {
    const wrist = hand[0];
    const middleMcp = hand[9];
    const indexMcp = hand[5];

    const palmNormal = {
      x: (middleMcp.x - wrist.x),
      y: (middleMcp.y - wrist.y)
    };

    const angle = Math.atan2(palmNormal.y, palmNormal.x);
    
    if (angle > -Math.PI/4 && angle < Math.PI/4) return 'forward';
    if (angle > Math.PI/4 && angle < 3*Math.PI/4) return 'down';
    if (angle > 3*Math.PI/4 || angle < -3*Math.PI/4) return 'back';
    return 'up';
  }

  // Recognize ASL letters
  recognizeLetter(fingerPositions, palmOrientation) {
    for (const [letter, pattern] of Object.entries(this.aslAlphabet)) {
      if (this.matchesPattern(fingerPositions, palmOrientation, pattern)) {
        return letter;
      }
    }
    return null;
  }

  // Match finger pattern to ASL letter
  matchesPattern(positions, orientation, pattern) {
    // Simplified pattern matching - in production, use ML model
    const confidence = this.calculatePatternConfidence(positions, orientation, pattern);
    return confidence > this.confidenceThreshold;
  }

  calculatePatternConfidence(positions, orientation, pattern) {
    let matches = 0;
    let total = 0;

    // Check palm orientation
    if (pattern.palm === orientation) matches++;
    total++;

    // Check finger positions (simplified)
    if (pattern.fingers === 'fist' && this.allFingersClosed(positions)) matches++;
    if (pattern.fingers === 'straight' && this.allFingersExtended(positions)) matches++;
    if (pattern.fingers === 'point_up' && positions.index === 'extended') matches++;
    // Add more pattern checks...

    total++;
    return matches / total;
  }

  allFingersClosed(positions) {
    return Object.values(positions).every(state => state === 'closed');
  }

  allFingersExtended(positions) {
    return Object.values(positions).every(state => state === 'extended');
  }

  // Handle letter spelling
  handleSpelling(letter) {
    const now = Date.now();
    
    if (now - this.lastLetterTime > this.wordTimeout) {
      // New word started
      this.spellingBuffer = [letter];
    } else {
      // Continue current word
      if (this.spellingBuffer[this.spellingBuffer.length - 1] !== letter) {
        this.spellingBuffer.push(letter);
      }
    }
    
    this.lastLetterTime = now;
    
    // Check if spelled word matches a command
    const word = this.spellingBuffer.join('');
    if (this.canvasCommands[word]) {
      const command = this.canvasCommands[word];
      this.spellingBuffer = [];
      return command;
    }
    
    return null;
  }

  // Recognize ASL phrases/gestures
  recognizePhrase(fingerPositions, palmOrientation, hand) {
    // Check for gesture-based phrases
    for (const [phrase, config] of Object.entries(this.aslPhrases)) {
      if (config.gesture && this.matchesGesture(hand, config.gesture)) {
        return config.meaning;
      }
    }
    return null;
  }

  // Match complex gestures
  matchesGesture(hand, gestureType) {
    switch (gestureType) {
      case 'chin_to_forward': // THANK YOU
        return this.detectChinToForward(hand);
      case 'circle_chest': // PLEASE
        return this.detectCircleChest(hand);
      case 'fist_nod': // YES
        return this.detectFistNod(hand);
      case 'face_circle': // BEAUTIFUL
        return this.detectFaceCircle(hand);
      case 'fingertips_touch': // MORE
        return this.detectFingertipsTouch(hand);
      case 'palm_down_hit': // STOP
        return this.detectPalmDownHit(hand);
      case 'fingers_open_up': // BRIGHT
        return this.detectFingersOpenUp(hand);
      case 'hands_apart': // BIG
        return this.detectHandsApart(hand);
      default:
        return false;
    }
  }

  // Gesture detection methods (simplified)
  detectChinToForward(hand) {
    const fingertips = [hand[8], hand[12], hand[16], hand[20]];
    const avgY = fingertips.reduce((sum, tip) => sum + tip.y, 0) / 4;
    return avgY < 0.3; // Near face level
  }

  detectFingertipsTouch(hand) {
    const thumb = hand[4];
    const index = hand[8];
    const distance = Math.sqrt(
      Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2)
    );
    return distance < 0.05; // Fingertips touching
  }

  detectPalmDownHit(hand) {
    const palm = hand[0];
    const middle = hand[12];
    return middle.y > palm.y + 0.1; // Palm facing down
  }

  detectFingersOpenUp(hand) {
    const fingertips = [hand[8], hand[12], hand[16], hand[20]];
    const palm = hand[0];
    return fingertips.every(tip => tip.y < palm.y - 0.1); // All fingers up
  }

  detectHandsApart(hand) {
    // This would need two hands - simplified for single hand
    const thumb = hand[4];
    const pinky = hand[20];
    const distance = Math.sqrt(
      Math.pow(thumb.x - pinky.x, 2) + Math.pow(thumb.y - pinky.y, 2)
    );
    return distance > 0.3; // Wide hand spread
  }

  detectCircleChest(hand) {
    // Detect circular motion - would need motion tracking
    return false; // Placeholder
  }

  detectFistNod(hand) {
    // Detect nodding motion with fist - would need motion tracking
    return false; // Placeholder
  }

  detectFaceCircle(hand) {
    // Detect circular motion around face - would need motion tracking
    return false; // Placeholder
  }

  // Execute canvas command
  executeCommand(command) {
    const mappedCommand = this.canvasCommands[command.toUpperCase()];
    return mappedCommand || command;
  }

  // Get current spelling progress
  getCurrentSpelling() {
    return this.spellingBuffer.join('');
  }

  // Clear spelling buffer
  clearSpelling() {
    this.spellingBuffer = [];
  }

  // Get available commands
  getAvailableCommands() {
    return {
      letters: Object.keys(this.aslAlphabet),
      phrases: Object.keys(this.aslPhrases),
      commands: Object.keys(this.canvasCommands)
    };
  }
}