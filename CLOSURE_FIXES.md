# State Closure Fixes for ASLNeuralCanvas

## Problem Summary
The ASL gesture recognition and voice command features were broken due to three interrelated React state closure bugs:

1. **Gesture Command Stale Closure**: `executeGestureCommand` had incomplete dependency array `[primaryColor]` but read `spellMode` and `lastLetterTs`, causing old state values to be used after first gesture detection.

2. **Voice Commands Stale Closure**: `voiceCommands` was defined inline and captured state values at render time. The `recognition.onresult` callback held a reference to the old `voiceCommands` object, so voice commands would always reference stale state.

3. **State Update Churn**: `lastLetterTs` was stored as state, causing unnecessary re-renders. This compounded the closure issues since the component re-rendered frequently without updating callback dependencies.

## Solutions Applied

### Fix 1: Complete the `executeGestureCommand` Dependency Array
**File**: `frontend/src/components/ASLNeuralCanvas.jsx`

**Before**:
```jsx
const executeGestureCommand = useCallback((gesture) => {
  // ... gesture logic that reads spellMode and lastLetterTs
}, [primaryColor]); // ❌ Missing dependencies!
```

**After**:
```jsx
const executeGestureCommand = useCallback((gesture) => {
  // ... gesture logic, now using lastLetterTsRef instead of state
  if (spellMode) {
    const now = Date.now();
    if (now - lastLetterTsRef.current > LETTER_COOLDOWN_MS) {
      setDynamicPrompt(prev => prev + gesture.toLowerCase());
      lastLetterTsRef.current = now;
    }
  }
}, [spellMode, LETTER_COOLDOWN_MS]); // ✅ Complete dependencies
```

**Changes**:
- Added `spellMode` and `LETTER_COOLDOWN_MS` to dependency array
- Updated letter capture logic to use `lastLetterTsRef.current` instead of state-based `lastLetterTs`
- Moved color cycling logic into a functional setter to avoid reading `primaryColor` in dependency array

### Fix 2: Replace Inline `voiceCommands` with `useCallback`
**File**: `frontend/src/components/ASLNeuralCanvas.jsx`

**Before**:
```jsx
// ❌ Defined inline - recreated each render, old reference persists in recognition.onresult
const voiceCommands = {
  'make it brighter': () => setIntensity(Math.min(3, intensity + 0.5)),
  // ... other commands reading stale state
};

useEffect(() => {
  // ...
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    const isCommand = Object.keys(voiceCommands).find(cmd => transcript.includes(cmd));
    if (isCommand) {
      voiceCommands[isCommand](); // ❌ Always calls old voiceCommands object!
    }
  };
}, [isListening, primaryColor, intensity, particleCount, speed, morphing]);
```

**After**:
```jsx
// ✅ Extract command logic into useCallback with proper dependencies
const handleVoiceCommand = useCallback((transcript) => {
  const commandMap = {
    'make it brighter': () => setIntensity(prev => Math.min(3, prev + 0.5)),
    'make it dimmer': () => setIntensity(prev => Math.max(0, prev - 0.5)),
    // ... other commands using functional setters (no direct state reads)
  };
  
  const isCommand = Object.keys(commandMap).find(cmd => transcript.includes(cmd));
  if (isCommand) {
    commandMap[isCommand]();
  } else {
    setDynamicPrompt(prev => prev + transcript + ' ');
  }
}, []); // ✅ Empty dependencies - all commands use functional setters

useEffect(() => {
  // ...
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    handleVoiceCommand(transcript); // ✅ Calls current handleVoiceCommand via closure
  };
}, [isListening, handleVoiceCommand]); // ✅ handleVoiceCommand has stable identity
```

**Changes**:
- Moved command definitions into `handleVoiceCommand` callback
- Used functional state setters (`setIntensity(prev => ...)`) instead of reading current state
- Reduced dependencies to just `isListening` and `handleVoiceCommand`
- `handleVoiceCommand` has empty dependency array since it only uses functional setters

### Fix 3: Replace State-Based Letter Timing with useRef
**File**: `frontend/src/components/ASLNeuralCanvas.jsx`

**Before**:
```jsx
const [lastLetterTs, setLastLetterTs] = useState(0); // ❌ State update causes re-render
```

**After**:
```jsx
const lastLetterTsRef = useRef(0); // ✅ Ref - no re-render, fast access

// In executeGestureCommand:
if (now - lastLetterTsRef.current > LETTER_COOLDOWN_MS) {
  setDynamicPrompt(prev => prev + gesture.toLowerCase());
  lastLetterTsRef.current = now; // ✅ Update ref without triggering render
}
```

**Benefits**:
- Eliminates unnecessary re-renders
- Reduces dependency array churn
- Faster letter cooldown tracking

## Testing the Fixes

### Voice Commands
1. Click "Toggle Voice Control" button
2. Say any of the supported commands:
   - "make it brighter" / "make it dimmer"
   - "more particles" / "less particles"
   - "speed up" / "slow down"
   - "make it red" / "make it blue" / "make it green"
   - "psychedelic mode", "reset everything"
   - "generate image", "clear image"
3. **Expected**: Commands execute on first invocation AND all subsequent invocations ✅
4. **Before fix**: Only first command would execute, subsequent ones ignored ❌

### ASL Gestures
1. Click "Start Camera" button
2. Show gestures in front of camera:
   - Thumbs Up/Down (brightness control)
   - Open Hand/Fist (particle count)
   - Peace Sign (color cycling)
   - Point Up/Down (speed control)
   - A/B/C letters (spell mode capture)
3. **Expected**: Gestures detected (green glow in corner) AND state changes apply ✅
4. **Before fix**: Gestures detected in first 2-3 seconds, then stopped triggering changes ❌

### Spell Mode + Helia Save
1. Enable Spell Mode (toggle in control panel)
2. Show A, B, C letters in sequence to build a prompt
3. Click "Save to Helia" button
4. **Expected**: Session saves successfully and IPFS CID link is shareable ✅

## Technical Details

### Closure Lifecycle in React
The issue was a common React pattern problem:
- Callbacks are created with a closure over component state at render time
- If callback dependencies are incomplete, old state values persist in the closure
- Speech recognition holds a reference to the old callback, preventing new one from being used
- Gesture detection calls the old callback on every frame after first gesture

### Solution Pattern
1. **Complete dependency arrays**: Include all state/functions used in callback
2. **Use functional setters**: `setState(prev => prev + 1)` doesn't require state in dependencies
3. **Use useRef for non-render values**: Timing, flags that don't need re-renders
4. **Extract logic to useCallback**: Ensure callbacks are updated when dependencies change

## Files Modified
- `frontend/src/components/ASLNeuralCanvas.jsx` (executeGestureCommand, handleVoiceCommand, lastLetterTsRef)

## Related Files (No Changes Needed)
- `frontend/src/components/ASLAvatar.jsx` (already fixed - external model URL replaced with Three.js primitives)
- `frontend/src/app/asl/page.js` (already fixed - removed 'use client' directive)

## Verification Checklist
- [x] executeGestureCommand has complete dependency array
- [x] executeGestureCommand uses lastLetterTsRef instead of state
- [x] handleVoiceCommand created as useCallback with empty dependencies
- [x] Voice recognition onresult calls handleVoiceCommand (current reference)
- [x] All state setters use functional form (prev => ...) to avoid closure issues
- [x] Frontend compiles without errors
- [x] ASL page loads in browser
- [x] Backend server running on port 3001
- [x] NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:3001

## Next Steps
After verifying the fixes work:
1. Test voice commands work reliably on 5+ invocations
2. Test ASL gestures trigger state changes reliably
3. Test Spell Mode captures multiple letters without dropping
4. Commit changes to git
5. Consider expanding ASL letter set (D, E, I, L, O, Y)
6. Add backend tests for generation endpoint
