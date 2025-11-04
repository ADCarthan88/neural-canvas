# Neural Canvas - Development Guidelines

## Code Quality Standards

### File Headers and Documentation
- **JSDoc-style comments** for complex functions and modules
- **Descriptive file headers** with purpose and functionality (e.g., `/** * Advanced Touch Gestures Hook ... */`)
- **Inline comments** for complex logic, especially in mathematical calculations and gesture recognition
- **Emoji prefixes** in UI component headers for visual identification (e.g., `🤖 AI GENERATION PANEL`)

### Code Formatting
- **Single quotes** for strings in JavaScript/JSX
- **Template literals** for string interpolation and multi-line strings
- **2-space indentation** consistently across all files
- **Semicolons** used consistently at statement ends
- **Trailing commas** in multi-line arrays and objects
- **Arrow functions** preferred over function expressions
- **Destructuring** used extensively for props and state

### Naming Conventions
- **camelCase** for variables, functions, and methods (e.g., `handleTouchStart`, `getDistance`, `executeAICommand`)
- **PascalCase** for React components and classes (e.g., `NeuralMesh`, `ParticleField`, `AIGenerationPanel`)
- **UPPER_SNAKE_CASE** for constants and gesture types (e.g., `CACHE_NAME`, `THUMBS_UP`, `OPEN_HAND`)
- **Descriptive names** that clearly indicate purpose (e.g., `colorBlindPalettes`, `generationProgress`, `touchState`)
- **Prefixes for state setters** using `set` prefix (e.g., `setMode`, `setIntensity`, `setIsGenerating`)
- **Boolean variables** prefixed with `is`, `has`, `should` (e.g., `isListening`, `hasCamera`, `shouldRender`)

### File Organization
- **Imports grouped** by category: external libraries, internal modules, components, utilities
- **React hooks** imported from 'react' in a single destructured import
- **Component definitions** before export statements
- **Helper functions** defined before or after main component based on complexity
- **Constants and configurations** defined at top of file (e.g., `modes`, `STATIC_FILES`, `colorBlindPalettes`)

## Architectural Patterns

### React Component Patterns

#### Functional Components with Hooks
```javascript
// Standard pattern used throughout codebase
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  const ref = useRef(null);
  
  const memoizedValue = useMemo(() => computation, [dependencies]);
  const callback = useCallback(() => logic, [dependencies]);
  
  useEffect(() => {
    // Side effects
    return () => cleanup;
  }, [dependencies]);
  
  return <JSX />;
}
```

#### Custom Hooks Pattern
```javascript
// Pattern from useAdvancedTouchGestures.js
export const useCustomHook = (params) => {
  const [state, setState] = useState(initialState);
  const ref = useRef(initialValue);
  
  const helperFunction = useCallback(() => {
    // Logic
  }, [dependencies]);
  
  useEffect(() => {
    // Setup and cleanup
  }, [dependencies]);
  
  return {
    state,
    helperFunction,
    additionalData
  };
};
```

#### Ref Pattern for External Libraries
```javascript
// Pattern for Three.js, AI engines, managers
const engineRef = useRef(new AICommandEngine());
const managerRef = useRef(new SubscriptionManager());

// Access via engineRef.current throughout component
```

### State Management Patterns

#### Complex State Objects
```javascript
// Pattern for multi-property state
const [gestures, setGestures] = useState({
  pinch: { scale: 1, velocity: 0, active: false },
  pan: { x: 0, y: 0, velocity: { x: 0, y: 0 }, active: false },
  rotate: { angle: 0, velocity: 0, active: false }
});

// Update with spread operator
setGestures(prev => ({
  ...prev,
  pinch: { ...prev.pinch, scale: newScale }
}));
```

#### Derived State with useMemo
```javascript
// Pattern for expensive computations
const { positions, colors } = useMemo(() => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  // Complex calculations
  return { positions, colors };
}, [count, color, mode]);
```

#### Callback Optimization
```javascript
// Pattern for event handlers and callbacks
const handleEvent = useCallback((params) => {
  // Logic using dependencies
}, [dependency1, dependency2]);
```

### Three.js / React Three Fiber Patterns

#### useFrame Hook for Animation
```javascript
// Pattern for continuous animation
useFrame((state) => {
  if (meshRef.current) {
    meshRef.current.rotation.x = state.clock.elapsedTime * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.6;
  }
});
```

#### Geometry and Material Configuration
```javascript
// Pattern for 3D objects
<mesh ref={meshRef}>
  <torusKnotGeometry args={[1, 0.3, 100, 16]} />
  <meshStandardMaterial 
    color={color}
    wireframe={true}
    transparent
    opacity={0.8}
    emissive={color}
    emissiveIntensity={intensity}
  />
</mesh>
```

#### Buffer Geometry Pattern
```javascript
// Pattern for particle systems
<points ref={pointsRef}>
  <bufferGeometry>
    <bufferAttribute
      attach="attributes-position"
      count={count}
      array={positions}
      itemSize={3}
    />
  </bufferGeometry>
  <pointsMaterial size={0.05} vertexColors />
</points>
```

### Backend API Patterns

#### Express Route Structure
```javascript
// Pattern for REST endpoints
app.post('/api/resource', authenticateMiddleware, async (req, res) => {
  try {
    const { param1, param2 } = req.body;
    // Business logic
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Authentication Middleware Pattern
```javascript
// Pattern for JWT authentication
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### Mock Data Pattern for Development
```javascript
// Pattern for development without database
const mockUsers = [
  { id: 1, email: 'admin@demo.com', subscription_tier: 'admin' }
];

const mockClients = [
  { id: 1, username: 'techcorp', subscription_tier: 'enterprise' }
];
```

### Service Worker Patterns

#### Cache Strategy Pattern
```javascript
// Network first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fallbackResponse;
  }
}
```

#### Event Listener Pattern
```javascript
// Service worker lifecycle events
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});
```

## Common Code Idioms

### Conditional Rendering Pattern
```javascript
// Inline conditional with &&
{isVisible && <Component />}

// Ternary for two options
{isActive ? <ActiveView /> : <InactiveView />}

// Early return for visibility
if (!isVisible) return null;
```

### Event Handler Pattern
```javascript
// Inline arrow functions for simple handlers
onClick={() => setState(newValue)}

// Named callbacks for complex logic
const handleComplexEvent = useCallback((event) => {
  event.preventDefault();
  // Complex logic
}, [dependencies]);
```

### Array Mapping Pattern
```javascript
// Map with key prop
{items.map((item, index) => (
  <Component key={item.id || index} {...item} />
))}

// Map with destructuring
{Object.entries(modes).map(([key, config]) => (
  <button key={key}>{config.name}</button>
))}
```

### Timeout and Cleanup Pattern
```javascript
// Pattern for temporary UI feedback
setTimeout(() => {
  setMessage('');
  setProgress(0);
}, 3000);

// Pattern with cleanup in useEffect
useEffect(() => {
  const timer = setTimeout(() => action(), delay);
  return () => clearTimeout(timer);
}, [dependencies]);
```

### Mathematical Calculations Pattern
```javascript
// Spherical distribution for particles
const phi = Math.random() * Math.PI * 2;
const costheta = Math.random() * 2 - 1;
const u = Math.random();
const theta = Math.acos(costheta);
const r = radius * Math.cbrt(u);

positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
positions[i * 3 + 2] = r * Math.cos(theta);
```

### Distance and Angle Calculations
```javascript
// Distance between two points
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// Angle between two points
const getAngle = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.atan2(dy, dx) * 180 / Math.PI;
};
```

## Styling Patterns

### Inline Styles Pattern
```javascript
// Comprehensive inline style objects
style={{
  position: 'absolute',
  top: '10px',
  left: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.95)',
  backdropFilter: 'blur(15px)',
  borderRadius: '12px',
  padding: '12px',
  border: `2px solid ${dynamicColor}`,
  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8)`
}}
```

### Dynamic Styling Pattern
```javascript
// Conditional styles based on state
style={{
  backgroundColor: isActive ? 'rgba(255, 0, 255, 0.3)' : 'rgba(100, 100, 100, 0.3)',
  border: isActive ? '2px solid #ff00ff' : '2px solid transparent',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  opacity: isDisabled ? 0.5 : 1
}}
```

### Gradient and Effect Patterns
```javascript
// Complex gradients
background: `linear-gradient(135deg, ${color1}20, ${color2}20)`
background: `radial-gradient(circle at 30% 40%, ${color}15 0%, transparent 50%)`

// Glow effects
boxShadow: `0 0 20px ${color}40`
filter: highContrast ? 'contrast(150%)' : 'none'
```

## Error Handling Patterns

### Try-Catch with User Feedback
```javascript
// Pattern for async operations
try {
  setIsLoading(true);
  setProgress('Processing...');
  
  const result = await operation();
  
  if (result.success) {
    setProgress('✅ Success!');
  } else {
    throw new Error('Operation failed');
  }
} catch (error) {
  console.error('Operation failed:', error);
  setProgress(`❌ Error: ${error.message}`);
} finally {
  setIsLoading(false);
  setTimeout(() => setProgress(''), 3000);
}
```

### Validation Pattern
```javascript
// Early validation with user feedback
if (!requiredValue) {
  setError('❌ Required field missing');
  setTimeout(() => setError(''), 3000);
  return;
}
```

## Performance Optimization Patterns

### Throttling Pattern
```javascript
// Throttle to ~60fps
const deltaTime = currentTime - lastUpdateTime;
if (deltaTime < 16) return;
```

### Memoization Pattern
```javascript
// Expensive calculations
const expensiveValue = useMemo(() => {
  // Heavy computation
  return result;
}, [dependencies]);
```

### Ref Pattern for Non-Reactive Values
```javascript
// Values that don't trigger re-renders
const stateRef = useRef({
  touches: [],
  lastUpdateTime: 0,
  initialDistance: 0
});

// Access and modify without re-rendering
stateRef.current.touches = newTouches;
```

## Accessibility Patterns

### Color Blind Support Pattern
```javascript
// Palette system for accessibility
const colorBlindPalettes = {
  normal: { primary: '#ff006e', secondary: '#8338ec' },
  protanopia: { primary: '#0066cc', secondary: '#ffaa00' },
  deuteranopia: { primary: '#0066ff', secondary: '#ff6600' }
};

const getAccessibleColor = (colorType) => {
  return colorBlindPalettes[colorBlindMode][colorType];
};
```

### Reduced Motion Pattern
```javascript
// Respect user motion preferences
const getMotionSpeed = () => {
  return reducedMotion ? speed * 0.3 : speed;
};

// Conditional animation
autoRotate={!reducedMotion}
animation: reducedMotion ? 'none' : 'pulse 3s ease-in-out infinite'
```

### ARIA and Semantic HTML
```javascript
// Accessible button patterns
<button
  onClick={handler}
  disabled={isDisabled}
  aria-label="Descriptive label"
  title="Tooltip text"
>
  Content
</button>
```

## API Integration Patterns

### API Key Management
```javascript
// LocalStorage pattern for API keys
useEffect(() => {
  const savedKey = localStorage.getItem('openai_api_key');
  if (savedKey) {
    setApiKey(savedKey);
    validateApiKey(savedKey);
  }
}, []);

// Save on validation
if (result.valid) {
  localStorage.setItem('openai_api_key', key);
}
```

### Progressive Enhancement Pattern
```javascript
// Fallback for missing API keys
const service = apiKeyValid ? 'dalle' : 'huggingface';
const message = apiKeyValid 
  ? 'Using DALL-E 3 for premium quality' 
  : 'Will use free Hugging Face service without API key';
```

## Testing and Development Patterns

### Console Logging Pattern
```javascript
// Emoji prefixes for log categorization
console.log('✅ Success message');
console.log('❌ Error message');
console.log('🚀 Startup message');
console.log('📦 Caching message');
console.error('Error details:', error);
```

### Mock Data Pattern
```javascript
// Development mode detection
console.log('✅ Using mock database for development');

// Demo credentials in response
res.json({ 
  message: 'Use POST method', 
  credentials: { email: 'admin@demo.com', password: 'demo123' } 
});
```

## Security Best Practices

### Environment Variables
```javascript
// Always use environment variables for secrets
const secret = process.env.JWT_SECRET || 'demo_secret';
const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/db';
```

### Password Hashing
```javascript
// bcrypt for password comparison
const validPassword = await bcrypt.compare(password, user.password_hash);
```

### JWT Token Pattern
```javascript
// Token generation with expiration
const token = jwt.sign(
  { id: user.id, email: user.email, role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### CORS Configuration
```javascript
// Explicit origin configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Rate Limiting
```javascript
// Protect API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

## Code Organization Best Practices

1. **Component Size**: Keep components focused and under 500 lines when possible
2. **Extract Complex Logic**: Move complex calculations to custom hooks or utility functions
3. **Configuration Objects**: Define mode configurations, palettes, and constants at file top
4. **Ref Usage**: Use refs for DOM elements, Three.js objects, and class instances
5. **State Colocation**: Keep related state together in objects when appropriate
6. **Effect Dependencies**: Always include all dependencies in useEffect/useCallback arrays
7. **Early Returns**: Use early returns for conditional rendering and validation
8. **Async/Await**: Prefer async/await over promise chains for readability
9. **Error Boundaries**: Wrap complex components in error boundaries (implied pattern)
10. **Progressive Enhancement**: Build features that degrade gracefully without API keys or advanced features
