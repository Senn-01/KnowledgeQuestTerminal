# Knowledge Quest Terminal

## Overview

Knowledge Quest Terminal is a gamified learning application built with a modern web stack. It features a terminal-inspired interface where users can learn about various topics through AI-powered conversations, take trials to test their knowledge, build a constellation of their learning progress, and store their knowledge in a personal vault. The application combines education with gaming elements through rarity systems and visual progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## Repository Information

- **Status**: Ready for GitHub deployment
- **License**: MIT License
- **Documentation**: Comprehensive README.md with setup instructions
- **Git Structure**: Repository prepared with proper .gitignore and documentation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks with local state and React Query for server state
- **Styling**: Terminal/retro-inspired dark theme with green monospace fonts

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: In-memory storage with fallback to PostgreSQL sessions

### Key Design Decisions

1. **Monorepo Structure**: Uses a shared folder structure with client/, server/, and shared/ directories for code organization
2. **Type Safety**: Full TypeScript implementation across frontend and backend with shared types
3. **Database Schema**: Simple user model with extensible design using Drizzle ORM
4. **Development Experience**: Hot reload with Vite, TypeScript checking, and Replit-specific plugins

## Key Components

### Frontend Components
- **Layout**: Terminal-style header with tab navigation between Chat, Constellation, and Vault screens
- **Chat Screen**: Main learning interface with AI conversation and trial system
- **Constellation Screen**: Visual representation of learning progress with interactive nodes
- **Vault Screen**: Storage and search interface for completed learning sessions
- **UI Components**: Complete set of shadcn/ui components for consistent styling

### Backend Services
- **Storage Interface**: Abstracted storage layer with both memory and database implementations
- **Route Registration**: Express route setup with error handling middleware
- **Vite Integration**: Development server integration for seamless full-stack development

### AI Integration
- **OpenAI Integration**: Uses GPT-4o model for topic explanations and evaluation
- **Learning Phases**: Topic selection, explanation, trials (articulation, gauntlet, lightning rounds)
- **Scoring System**: Complex rarity calculation based on performance across multiple trial types

## Data Flow

1. **Learning Session**: User selects topic → AI provides explanation → User takes trials → Results stored with rarity calculation
2. **Data Persistence**: LocalStorage for client-side data with PostgreSQL for user sessions
3. **AI Interaction**: Direct browser-to-OpenAI API calls with error handling and fallbacks
4. **State Management**: React Query for server state, local hooks for UI state

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Vite build tooling with TypeScript support
- Express.js server framework

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible components
- Lucide React for icons
- Custom terminal theme with CSS variables

### Database and ORM
- Drizzle ORM with PostgreSQL dialect
- Neon Database serverless driver
- Zod for schema validation

### AI and External Services
- OpenAI API for content generation and evaluation
- Browser-based API calls (no server proxy)

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to dist/public/
- **Backend**: esbuild bundles Express server to dist/
- **Database**: Drizzle migrations in migrations/ folder

### Environment Configuration
- DATABASE_URL for PostgreSQL connection
- VITE_OPENAI_API_KEY for AI service access
- Development vs production configurations

### Development Workflow
- Local development with Vite dev server
- Hot reload for both frontend and backend changes
- TypeScript checking and error reporting
- Replit-specific development tools integration

### Production Considerations
- Static asset serving through Express
- Database migration management
- Environment variable management
- Session storage scaling from memory to database