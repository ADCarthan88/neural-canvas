# 🧠 Neural Canvas - The Ultimate AI Art Platform

> **Revolutionary AI-powered neural canvas that transforms imagination into reality**

## 🚀 Features That Will Blow Your Mind

### 🎨 **4 Advanced Shader Modes**
- **🧠 Neural Flow**: Living neural network visualization with pulsing synapses
- **⚛️ Quantum Field**: Reality-bending quantum particle effects
- **🌌 Cosmic Dance**: Octahedral particle systems with cosmic motion
- **⚡ Plasma Storm**: High-energy icosahedral effects with metallic sheen

### 🎵 **Audio-Reactive Visuals**
- Real-time microphone input processing
- Frequency and amplitude visualization
- Dynamic shader parameter modulation

### ♿ **Accessibility-First Design**
- **ASL Recognition**: American Sign Language gesture control
- **Color Blind Modes**: 5 different palettes (Protanopia, Deuteranopia, Tritanopia, Monochrome)
- **High Contrast Mode**: Enhanced visibility
- **Reduced Motion**: Respects user preferences
- **Voice Control**: Natural language commands via AI

### ⚡ **Performance Beast**
- Up to 10,000 particles at 60fps
- WebGL shader optimization
- Advanced post-processing pipeline
- Instanced rendering for particle systems

### 🎮 **Interactive Controls**
- Real-time intensity adjustment
- Particle count scaling
- Speed controls
- Fullscreen immersion mode
- Keyboard shortcuts (1-5 for gesture testing)

## 🛠️ Tech Stack

### Frontend Powerhouse
- **Next.js 16.0.1** - React framework with App Router & Turbopack
- **React 19.2.0** - Latest React with concurrent features
- **React Three Fiber 9.4.0** - Declarative 3D graphics
- **Three.js 0.181.0** - WebGL 3D library
- **@react-three/drei 10.7.6** - Three.js helpers

### Backend Excellence
- **Node.js + Express 5.1.0** - High-performance server
- **Socket.io 4.8.0** - Real-time WebSocket connections
- **PostgreSQL** - Robust database
- **Redis 5.9.0** - Lightning-fast caching
- **JWT Authentication** - Secure user sessions
- **Winston 3.13.0** - Professional logging
- **Joi 17.12.2** - Environment validation

### AI Integration
- **OpenAI DALL-E 3** - Premium image generation
- **Stable Diffusion** - Open-source AI art (planned)
- **AI Command Engine** - Natural language processing with fuzzy matching
- **Levenshtein Distance** - Advanced command interpretation

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18.0+
- npm 10.0.0+
- PostgreSQL 15+ (optional for development)
- Redis 7+ (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ADCarthan88/neural-canvas.git
   cd neural-canvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   cd ../ai-services && npm install
   ```

3. **Configure environment variables**
   
   Create `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=3001
   DATABASE_URL=postgresql://admin:secure_password@localhost:5432/neural_canvas
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   FRONTEND_URL=http://localhost:3000
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

4. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will start on port 3001 (or random port if 3001 is taken)

5. **Start the frontend** (in new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will start on port 3002

6. **Open your browser**
   - Main app: `http://localhost:3002`
   - Backend API: `http://localhost:3001` (shows API info)
   - Health check: `http://localhost:3001/health`

## 📊 Current Status

### ✅ What's Working
- Backend server with Express 5
- Environment validation with Joi
- Winston logging system
- ES6 module system throughout
- AI services with OpenAI integration
- Mock authentication system
- Admin routes
- Generation routes
- Health check endpoint

### 🔧 Known Issues
- Frontend has Turbopack monorepo configuration issue
- Database not connected (using mock data)
- ASL recognition is simulated (not real MediaPipe)
- Hugging Face integration not implemented

### 🎯 Recommended Next Steps
1. **Option A**: Downgrade to Next.js 14 for immediate frontend functionality
2. **Option B**: Continue debugging Turbopack configuration
3. Connect PostgreSQL database
4. Implement real authentication middleware
5. Add input validation to all routes
6. Implement real ASL recognition with MediaPipe

## 🎯 Project Structure

```
neural-canvas/
├── frontend/                 # Next.js 16 frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components (30+ components)
│   │   │   └── shaders/     # Shader components (9 variants)
│   │   ├── hooks/           # Custom hooks (6 hooks)
│   │   ├── lib/             # Utilities & AI engines (15+ modules)
│   │   └── 3d/              # Three.js components
│   ├── public/              # Static assets
│   └── next.config.js       # Next.js configuration
├── backend/                 # Express.js backend
│   ├── config/              # Configuration (env, logger)
│   ├── routes/              # API routes (admin, generation, ai)
│   ├── middleware/          # Auth middleware
│   ├── models/              # Database models
│   ├── tests/               # Test files
│   └── server.js            # Main server file
├── ai-services/             # AI integration
│   └── generation/          # Image generation (DALL-E 3)
├── migrations/              # Database migrations
└── .amazonq/               # Amazon Q AI guidelines
    └── rules/memory-bank/   # Development guidelines
```

## 🔧 Recent Fixes (Latest Session)

### Backend Fixes
1. ✅ Added missing `validateEnvVars` import to server.js
2. ✅ Added missing `bcryptjs` and `jwt` imports to admin.js
3. ✅ Fixed duplicate code in admin.js login route
4. ✅ Converted ai-services to ES6 modules
5. ✅ Fixed `OPENAPI_API_KEY` → `OPENAI_API_KEY` typo
6. ✅ Made OpenAI initialization conditional (no crash without API key)
7. ✅ Added root route to backend (shows API info)
8. ✅ Installed ai-services dependencies

### Frontend Fixes
1. ✅ Fixed JSX syntax error in InclusiveNeuralCanvas.jsx (misplaced closing div)
2. ✅ Added Turbopack root configuration
3. ✅ Updated dev script to use port 3002

### Infrastructure Improvements
1. ✅ Environment validation with Joi
2. ✅ Winston logging system
3. ✅ Test infrastructure with Vitest
4. ✅ Placeholder test file

## 🎨 AI Command Engine

The project features a sophisticated AI command engine with:
- **Fuzzy Pattern Matching**: Understands variations of commands
- **Context Analysis**: Interprets user intent
- **Confidence Scoring**: Provides feedback on understanding
- **Mood Presets**: 8 emotional presets (angry, calm, happy, mysterious, etc.)
- **Natural Language**: "make it brighter", "quantum style", "angry mood"
- **Gesture Mapping**: Thumbs up/down, open hand, fist, peace sign

## 🔥 Performance Optimization

- **Shader LOD**: Dynamic quality scaling
- **Instanced Rendering**: Efficient particle systems
- **Frustum Culling**: Only render visible objects
- **Texture Atlasing**: Reduced draw calls
- **Memory Pooling**: Garbage collection optimization
- **WebGL Optimization**: GPU-accelerated rendering

## 🌐 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
```bash
npm run build
npm run start
```

### Enterprise Launch Script (Windows)
```cmd
start-enterprise.bat
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m "Add some AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community** - For the incredible 3D library
- **React Three Fiber** - For making 3D React development amazing
- **OpenAI** - For revolutionary AI capabilities
- **The WebGL Community** - For pushing the boundaries of web graphics
- **Amazon Q** - For AI-assisted development guidance

---

**Built with ❤️ and lots of ☕ by the Neural Canvas Team**

*"Where imagination meets reality through the power of AI and advanced graphics"*

## 📝 Development Notes

### Backend Port
The backend may start on a random port if 3001 is taken. Check the console output for the actual port.

### Mock Data
Currently using mock data for development. Database connection coming soon.

### API Key
OpenAI API key is optional. The app will run without it but image generation will fail gracefully.

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Partial support (WebKit Speech Recognition required for voice)
