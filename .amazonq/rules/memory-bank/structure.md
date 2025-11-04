# Neural Canvas - Project Structure

## Directory Organization

```
neural-canvas/
├── frontend/              # Next.js 15 frontend application
├── backend/               # Express.js backend server
├── ai-services/           # AI integration services
├── migrations/            # Database migration scripts
└── .amazonq/             # Amazon Q configuration and rules
```

## Frontend Structure (`frontend/`)

### Core Directories
- **`src/app/`** - Next.js 15 App Router pages and layouts
- **`src/components/`** - React components including shader components
- **`src/shaders/`** - GLSL shader files for WebGL effects
- **`src/hooks/`** - Custom React hooks (e.g., useAdvancedTouchGestures)
- **`src/lib/`** - Utility functions and helpers
- **`src/3d/`** - Three.js 3D components and utilities
- **`src/ai/`** - AI integration client-side logic
- **`public/`** - Static assets (favicon, manifest, service worker)

### Key Components
- **InclusiveNeuralCanvas.jsx** - Main canvas component with accessibility features
- **AIGenerationPanel.jsx** - AI art generation interface
- **Shader Components** - WebGL shader implementations for visual effects

### Configuration Files
- **next.config.js** - Next.js configuration
- **tsconfig.json** - TypeScript configuration
- **package.json** - Frontend dependencies (React 19, Next.js 15, Three.js)

## Backend Structure (`backend/`)

### Core Directories
- **`app/`** - Application logic modules
  - `ai/` - AI service integrations
  - `api/` - API route handlers
  - `blockchain/` - Blockchain integrations
  - `ml/` - Machine learning services
  - `realtime/` - WebSocket/real-time handlers
- **`database/`** - Database connection and initialization
- **`middleware/`** - Express middleware (auth, rate limiting)
- **`models/`** - Database models (User, etc.)
- **`routes/`** - API route definitions
- **`realtime/`** - Socket.io real-time communication

### Key Files
- **server.js** - Main Express server with enterprise B2B features
- **server-simple.js** - Simplified server for development
- **.env** - Environment configuration

### Configuration Files
- **package.json** - Backend dependencies (Express, PostgreSQL, Redis, Socket.io)
- **Dockerfile** - Docker containerization
- **eslint.config.js** - ESLint configuration
- **vitest.config.js** - Vitest testing configuration

## AI Services Structure (`ai-services/`)

### Directories
- **`generation/`** - AI image generation services (DALL-E 3, Stable Diffusion)
- **`prediction/`** - AI prediction models
- **`vision/`** - Computer vision services
- **`voice/`** - Voice processing services

### Configuration
- **package.json** - AI services dependencies
- **eslint.config.js** - Linting configuration
- **vitest.config.js** - Testing configuration

## Database Structure (`migrations/`)

- **001_initial_schema.sql** - Initial database schema for PostgreSQL

## Root Level Files

### Configuration
- **package.json** - Root workspace configuration with monorepo scripts
- **docker-compose.yml** - Multi-container Docker setup
- **neural-canvas.code-workspace** - VS Code workspace configuration
- **.gitignore** - Git ignore patterns

### Documentation
- **README.md** - Main project documentation
- **ENTERPRISE-LAUNCH.md** - Enterprise deployment guide

### Scripts
- **start-enterprise.bat** - Windows startup script
- **Canvas.js** - Standalone canvas implementation

## Architectural Patterns

### Monorepo Structure
- Multi-package workspace with shared dependencies
- Independent frontend, backend, and AI services
- Coordinated development with concurrent scripts

### Frontend Architecture
- **Next.js 15 App Router** - File-based routing with React Server Components
- **React Three Fiber** - Declarative 3D graphics with React
- **Component-Based** - Modular, reusable UI components
- **Custom Hooks** - Shared logic extraction (gestures, state management)

### Backend Architecture
- **Express.js REST API** - RESTful endpoints for client/admin operations
- **Multi-Tenant B2B** - Client isolation and subscription management
- **JWT Authentication** - Secure token-based auth
- **Mock Database** - Development mode with in-memory data
- **Real-time Communication** - Socket.io for live updates

### AI Integration Architecture
- **Microservices** - Separate AI services package
- **Multiple Providers** - OpenAI DALL-E 3 and Stable Diffusion support
- **Modular Services** - Generation, prediction, vision, voice modules

### Database Architecture
- **PostgreSQL** - Primary relational database
- **Redis** - Caching and session management
- **Migration-Based** - Version-controlled schema changes

## Component Relationships

### Frontend → Backend
- REST API calls for authentication, client management, analytics
- WebSocket connections for real-time updates
- JWT token-based authorization

### Frontend → AI Services
- Image generation requests
- Real-time AI processing
- Vision and voice service integration

### Backend → Database
- PostgreSQL for persistent data (users, clients, subscriptions)
- Redis for caching and session storage

### Backend → AI Services
- Proxy requests from frontend
- Service orchestration
- Result caching and optimization

## Development Workflow

1. **Concurrent Development**: Frontend and backend run simultaneously
2. **Hot Reloading**: Next.js and nodemon for instant updates
3. **Containerization**: Docker support for production deployment
4. **Testing**: Vitest for unit and integration tests
5. **Linting**: ESLint across all packages for code quality
