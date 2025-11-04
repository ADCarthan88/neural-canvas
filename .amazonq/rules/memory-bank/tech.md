# Neural Canvas - Technology Stack

## Programming Languages

### Primary Languages
- **JavaScript (ES6+)** - Main language for frontend and backend
- **TypeScript** - Type-safe development (frontend configuration)
- **GLSL** - OpenGL Shading Language for WebGL shaders
- **SQL** - PostgreSQL database queries

### Language Versions
- **Node.js**: >=18.18.0
- **npm**: >=10.0.0

## Frontend Technologies

### Core Framework
- **Next.js 15.0.3** - React framework with App Router
- **React 19.0.0** - UI library with latest features
- **React DOM 19.0.0** - React rendering

### 3D Graphics & Visualization
- **Three.js 0.169.0** - WebGL 3D library
- **@react-three/fiber 8.17.10** - React renderer for Three.js
- **@react-three/drei 9.114.3** - Three.js helpers and abstractions

### Styling & Animation
- **Tailwind CSS** - Utility-first CSS framework (mentioned in README)
- **Framer Motion** - Animation library (mentioned in README)

### Build & Development
- **Next.js Dev Server** - Hot module replacement
- **TypeScript Compiler** - Type checking and compilation

## Backend Technologies

### Core Framework
- **Express.js 4.21.0** - Web application framework
- **Node.js** - JavaScript runtime

### Security & Authentication
- **helmet 8.0.0** - Security headers middleware
- **jsonwebtoken 9.0.2** - JWT token generation and verification
- **bcryptjs 2.4.3** - Password hashing
- **express-rate-limit 7.4.0** - Rate limiting middleware
- **cors 2.8.5** - Cross-origin resource sharing

### Database & Caching
- **pg 8.13.0** - PostgreSQL client
- **redis 4.7.0** - Redis client for caching

### Real-time Communication
- **socket.io 4.8.0** - WebSocket library for real-time features

### Payment Processing
- **stripe 17.2.0** - Payment and subscription management

### File Processing
- **multer 2.0.0-rc.4** - Multipart form data handling
- **sharp 0.33.0** - Image processing and optimization

### Utilities
- **dotenv 16.4.0** - Environment variable management
- **compression 1.7.4** - Response compression
- **morgan 1.10.0** - HTTP request logging
- **nodemailer 6.9.0** - Email sending

### Development Tools
- **nodemon 3.1.0** - Auto-restart on file changes
- **eslint 9.14.0** - Code linting
- **@eslint/js 9.14.0** - ESLint JavaScript config
- **vitest 2.1.0** - Unit testing framework
- **@types/node 22.8.0** - Node.js type definitions

## AI Services

### AI Integration
- **OpenAI DALL-E 3** - Premium AI image generation
- **Stable Diffusion** - Open-source AI art generation

### Service Modules
- **generation/** - Image generation services
- **prediction/** - AI prediction models
- **vision/** - Computer vision processing
- **voice/** - Voice processing services

## Database Technologies

### Primary Database
- **PostgreSQL 15+** - Relational database
  - User management
  - Client accounts
  - Subscription data
  - Analytics storage

### Caching Layer
- **Redis 7+** - In-memory data store
  - Session management
  - API response caching
  - Real-time data

## DevOps & Deployment

### Containerization
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration

### Development Tools
- **concurrently 9.0.0** - Run multiple commands simultaneously
- **husky 9.1.0** - Git hooks
- **lint-staged 15.2.0** - Pre-commit linting
- **rimraf 6.0.0** - Cross-platform file deletion

## Build Systems & Package Management

### Package Management
- **npm Workspaces** - Monorepo package management
- **package.json** - Dependency management

### Build Scripts
```json
{
  "dev": "Concurrent frontend and backend development",
  "build": "Production build for frontend and backend",
  "test": "Run test suites across packages",
  "lint": "Code quality checks",
  "docker:build": "Build Docker containers",
  "docker:up": "Start Docker services",
  "install:all": "Install all workspace dependencies"
}
```

## Development Commands

### Root Level
```bash
npm run dev                 # Start frontend + backend concurrently
npm run build              # Build all packages
npm run test               # Run all tests
npm run lint               # Lint all packages
npm run docker:up          # Start with Docker
npm run install:all        # Install all dependencies
```

### Frontend
```bash
cd frontend
npm run dev                # Start Next.js dev server (port 3000)
npm run build              # Build for production
npm start                  # Start production server
```

### Backend
```bash
cd backend
npm run dev                # Start with nodemon (port 3001)
npm start                  # Start production server
npm run init-db            # Initialize database
npm run test               # Run tests
npm run test:coverage      # Run tests with coverage
npm run lint:fix           # Fix linting issues
```

### AI Services
```bash
cd ai-services
npm run dev                # Start AI services
npm run test               # Run AI service tests
```

## Environment Configuration

### Required Environment Variables
- **DATABASE_URL** - PostgreSQL connection string
- **JWT_SECRET** - Secret key for JWT tokens
- **FRONTEND_URL** - Frontend application URL
- **PORT** - Backend server port (default: 3001)
- **OPENAI_API_KEY** - OpenAI API credentials
- **REDIS_URL** - Redis connection string
- **STRIPE_SECRET_KEY** - Stripe payment processing

## Performance Optimization Technologies

### Frontend Optimization
- **WebGL Shader Optimization** - GPU-accelerated rendering
- **Instanced Rendering** - Efficient particle systems
- **Frustum Culling** - Render only visible objects
- **Texture Atlasing** - Reduced draw calls
- **Memory Pooling** - Optimized garbage collection
- **Shader LOD** - Dynamic quality scaling

### Backend Optimization
- **Response Compression** - Gzip/Brotli compression
- **Redis Caching** - Fast data retrieval
- **Rate Limiting** - API protection
- **Connection Pooling** - Database optimization

## Testing Framework

- **Vitest 2.1.0** - Fast unit testing
- **Coverage Reports** - Code coverage analysis
- **ESLint** - Static code analysis

## Browser Compatibility

### Required Features
- **WebGL 2.0** - Modern 3D graphics
- **Web Audio API** - Audio-reactive features
- **WebSocket** - Real-time communication
- **ES6+ Support** - Modern JavaScript features
